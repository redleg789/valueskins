import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const SESSION_COOKIE_NAME = 'nexus_session';
const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes idle

interface SessionData {
  userId: string;
  userType: 'creator' | 'brand';
  createdAt: number;
  lastActiveAt: number;
  csrfToken: string;
}

interface SecureSession {
  sessionId: string;
  userId: string;
  userType: 'creator' | 'brand';
  isExpired: boolean;
  isIdleExpired: boolean;
}

const SESSION_STORE = new Map<string, SessionData>();

function hashSessionId(sessionId: string): string {
  return createHash('sha256').update(sessionId + process.env.SESSION_SECRET || 'default-secret').digest('hex');
}

function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function createSession(
  userId: string,
  userType: 'creator' | 'brand'
): Promise<{ sessionId: string; csrfToken: string }> {
  const sessionId = generateSessionId();
  const csrfToken = generateCsrfToken();
  const now = Date.now();
  
  const sessionData: SessionData = {
    userId,
    userType,
    createdAt: now,
    lastActiveAt: now,
    csrfToken,
  };
  
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY / 1000,
    path: '/',
  });
  
  cookieStore.set('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY / 1000,
    path: '/',
  });
  
  SESSION_STORE.set(hashSessionId(sessionId), sessionData);
  
  return { sessionId, csrfToken };
}

export async function getSession(request: NextRequest): Promise<SecureSession | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return null;
  }
  
  const hashedSessionId = hashSessionId(sessionId);
  const sessionData = SESSION_STORE.get(hashedSessionId);
  
  if (!sessionData) {
    return null;
  }
  
  const now = Date.now();
  const isExpired = now > sessionData.createdAt + SESSION_EXPIRY;
  const isIdleExpired = now > sessionData.lastActiveAt + IDLE_TIMEOUT;
  
  return {
    sessionId,
    userId: sessionData.userId,
    userType: sessionData.userType,
    isExpired,
    isIdleExpired,
  };
}

export async function refreshSession(request: NextRequest): Promise<boolean> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return false;
  }
  
  const hashedSessionId = hashSessionId(sessionId);
  const sessionData = SESSION_STORE.get(hashedSessionId);
  
  if (!sessionData) {
    return false;
  }
  
  sessionData.lastActiveAt = Date.now();
  
  const newCsrfToken = generateCsrfToken();
  sessionData.csrfToken = newCsrfToken;
  
  const cookieStore = await cookies();
  cookieStore.set('csrf_token', newCsrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: IDLE_TIMEOUT / 1000,
    path: '/',
  });
  
  SESSION_STORE.set(hashedSessionId, sessionData);
  
  return true;
}

export async function destroySession(request: NextRequest): Promise<void> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (sessionId) {
    SESSION_STORE.delete(hashSessionId(sessionId));
  }
  
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete('csrf_token');
}

export function validateCsrfCookieToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get('csrf_token')?.value;
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return timingSafeCompare(cookieToken, headerToken);
}

export async function requireAuth<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T,
  allowedRoles?: ('creator' | 'brand')[]
): Promise<T> {
  return (async (...args: unknown[]) => {
    const request = args[0] as NextRequest;
    
    const session = await getSession(request);
    
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.isExpired || session.isIdleExpired) {
      await destroySession(request);
      return Response.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }
    
    if (allowedRoles && !allowedRoles.includes(session.userType)) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await refreshSession(request);
    
    (request as NextRequest & { session: SecureSession }).session = session;
    
    return handler(...args);
  }) as T;
}

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const useSalt = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + useSalt).digest('hex');
  return { hash, salt: useSalt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const { hash: computedHash } = await hashPassword(password, salt);
  return timingSafeCompare(hash, computedHash);
}