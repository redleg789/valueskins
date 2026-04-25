export interface DemoSession {
  userId: string;
  userName: string;
}

export function validateDemoToken(token: string | undefined): DemoSession | null {
  if (!token) return null;
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.userId && decoded.userName) {
      return decoded as DemoSession;
    }
  } catch {
    return null;
  }
  
  return null;
}

export function createDemoToken(userId: string, userName: string): string {
  const session: DemoSession = { userId, userName };
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function issueDemoToken(userTypeOrId: string, userName?: string): string {
  const userId = userName ? userTypeOrId : `demo_${userTypeOrId}_${Date.now()}`;
  const name = userName || `Demo ${userTypeOrId}`;
  return createDemoToken(userId, name);
}
