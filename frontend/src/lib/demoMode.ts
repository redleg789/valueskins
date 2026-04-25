export function isDemoModeEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('demo_mode') === 'true';
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo_mode', String(enabled));
  }
}

export function isValidDemoToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return !!(decoded.userId && decoded.userName);
  } catch {
    return false;
  }
}

export function demoUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.userId || null;
  } catch {
    return null;
  }
}
