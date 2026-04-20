import { isDemoModeEnabled, isValidDemoToken } from './demoMode';

const DEMO_TOKEN_KEY = 'auth_token';
const DEMO_USER_TYPE_KEY = 'user_type';
const DEMO_SESSION_COOKIE = 'valueskins_demo_session';

function browserReady(): boolean {
  return typeof window !== 'undefined';
}

function secureCookieAttr(): string {
  return process.env.NODE_ENV === 'production' ? '; Secure' : '';
}

export function getDemoToken(): string | null {
  if (!browserReady()) return null;
  const token = sessionStorage.getItem(DEMO_TOKEN_KEY);
  return isValidDemoToken(token) ? token : null;
}

export function getDemoUserType(): 'creator' | 'brand' | null {
  if (!browserReady()) return null;
  const userType = sessionStorage.getItem(DEMO_USER_TYPE_KEY);
  return userType === 'creator' || userType === 'brand' ? userType : null;
}

export function setDemoSession(token: string, userType: 'creator' | 'brand'): void {
  if (!browserReady() || !isDemoModeEnabled() || !isValidDemoToken(token)) return;
  sessionStorage.setItem(DEMO_TOKEN_KEY, token);
  sessionStorage.setItem(DEMO_USER_TYPE_KEY, userType);
  document.cookie = `${DEMO_SESSION_COOKIE}=1; Path=/; SameSite=Strict${secureCookieAttr()}`;
}

export function clearDemoSession(): void {
  if (!browserReady()) return;
  sessionStorage.removeItem(DEMO_TOKEN_KEY);
  sessionStorage.removeItem(DEMO_USER_TYPE_KEY);
  document.cookie = `${DEMO_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict${secureCookieAttr()}`;
}
