import { createHash, randomBytes } from 'crypto';

interface SessionData {
  userId: string;
  userType: 'creator' | 'brand' | 'guest';
  createdAt: number;
  lastActiveAt: number;
  csrfToken: string;
}

const SESSION_EXPIRY = 30 * 60 * 1000;
const IDLE_TIMEOUT = 15 * 60 * 1000;

// In-memory fallback (production must use Redis)
const SESSION_STORE = new Map<string, SessionData>();

function hashSessionId(sessionId: string): string {
  return createHash('sha256')
    .update(sessionId + (process.env.SESSION_SECRET || 'default-secret'))
    .digest('hex');
}

function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(
  userId: string,
  userType: 'creator' | 'brand' | 'guest'
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

  const hashedId = hashSessionId(sessionId);
  SESSION_STORE.set(hashedId, sessionData);

  // Auto-cleanup expired session after 30 minutes
  setTimeout(() => {
    SESSION_STORE.delete(hashedId);
  }, SESSION_EXPIRY);

  return { sessionId, csrfToken };
}

export function getSession(
  sessionId: string
): {
  userId: string;
  userType: 'creator' | 'brand' | 'guest';
  isExpired: boolean;
  isIdleExpired: boolean;
} | null {
  const hashedId = hashSessionId(sessionId);
  const sessionData = SESSION_STORE.get(hashedId);

  if (!sessionData) {
    return null;
  }

  const now = Date.now();
  const isExpired = now > sessionData.createdAt + SESSION_EXPIRY;
  const isIdleExpired = now > sessionData.lastActiveAt + IDLE_TIMEOUT;

  if (isExpired || isIdleExpired) {
    SESSION_STORE.delete(hashedId);
    return null;
  }

  return {
    userId: sessionData.userId,
    userType: sessionData.userType,
    isExpired,
    isIdleExpired,
  };
}

export function refreshSession(sessionId: string): boolean {
  const hashedId = hashSessionId(sessionId);
  const sessionData = SESSION_STORE.get(hashedId);

  if (!sessionData) {
    return false;
  }

  sessionData.lastActiveAt = Date.now();
  sessionData.csrfToken = generateCsrfToken();
  SESSION_STORE.set(hashedId, sessionData);

  return true;
}

export function destroySession(sessionId: string): void {
  const hashedId = hashSessionId(sessionId);
  SESSION_STORE.delete(hashedId);
}

export function validateCsrfToken(sessionId: string, token: string): boolean {
  const hashedId = hashSessionId(sessionId);
  const sessionData = SESSION_STORE.get(hashedId);

  if (!sessionData) {
    return false;
  }

  return sessionData.csrfToken === token;
}
