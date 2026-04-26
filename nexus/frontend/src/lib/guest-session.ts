import { v4 as uuidv4 } from 'uuid';

export interface GuestSession {
  guestId: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

const GUEST_SESSION_KEY = 'guest_session_data';
const GUEST_TOKEN_PREFIX = 'guest_';
const GUEST_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_ACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour idle timeout

export function createGuestSession(): GuestSession {
  const guestId = uuidv4();
  const now = Date.now();
  const session: GuestSession = {
    guestId,
    createdAt: now,
    expiresAt: now + GUEST_SESSION_DURATION,
    lastActivityAt: now,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export function getGuestSession(): GuestSession | null {
  if (typeof window === 'undefined') return null;

  const sessionData = localStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionData) return null;

  try {
    const session = JSON.parse(sessionData) as GuestSession;
    const now = Date.now();

    // Check if session expired
    if (now > session.expiresAt) {
      clearGuestSession();
      return null;
    }

    // Check if session timed out due to inactivity
    if (now - session.lastActivityAt > SESSION_ACTIVITY_TIMEOUT) {
      clearGuestSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to parse guest session:', error);
    clearGuestSession();
    return null;
  }
}

export function updateGuestActivityTime(): void {
  if (typeof window === 'undefined') return;

  const sessionData = localStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionData) return;

  try {
    const session = JSON.parse(sessionData) as GuestSession;
    session.lastActivityAt = Date.now();
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to update guest activity:', error);
  }
}

export function clearGuestSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

export function generateGuestToken(): string {
  const session = getGuestSession();
  if (!session) {
    const newSession = createGuestSession();
    return GUEST_TOKEN_PREFIX + newSession.guestId;
  }
  return GUEST_TOKEN_PREFIX + session.guestId;
}

export function getGuestIdFromToken(token: string): string | null {
  if (!token.startsWith(GUEST_TOKEN_PREFIX)) return null;
  return token.substring(GUEST_TOKEN_PREFIX.length);
}

export function isValidGuestToken(token: string): boolean {
  if (!token.startsWith(GUEST_TOKEN_PREFIX)) return false;
  const session = getGuestSession();
  return session !== null;
}
