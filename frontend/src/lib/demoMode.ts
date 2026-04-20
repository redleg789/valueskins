const DEMO_TOKEN_PATTERN = /^demo\.v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

type DemoUserType = 'creator' | 'brand';

type DemoTokenPayload = {
  sub: string;
  userType: DemoUserType;
  iat: number;
  exp: number;
  nonce: string;
};

export function isDemoModeEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
}

export function isValidDemoToken(token: string | null | undefined): token is string {
  return typeof token === 'string' && DEMO_TOKEN_PATTERN.test(token);
}

function decodePayload(token: string): DemoTokenPayload | null {
  if (!isValidDemoToken(token)) {
    return null;
  }

  const [, , encodedPayload] = token.split('.');

  try {
    const json =
      typeof window === 'undefined'
        ? Buffer.from(encodedPayload, 'base64url').toString('utf8')
        : new TextDecoder().decode(
            Uint8Array.from(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
          );

    const payload = JSON.parse(json) as Partial<DemoTokenPayload>;
    if (
      typeof payload.sub !== 'string' ||
      (payload.userType !== 'creator' && payload.userType !== 'brand') ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number' ||
      typeof payload.nonce !== 'string'
    ) {
      return null;
    }

    return payload as DemoTokenPayload;
  } catch {
    return null;
  }
}

export function demoUserIdFromToken(token: string): string {
  const payload = decodePayload(token);
  if (!payload) {
    throw new Error('Invalid demo token');
  }
  return payload.sub;
}

export function demoUserTypeFromToken(token: string): DemoUserType {
  const payload = decodePayload(token);
  if (!payload) {
    throw new Error('Invalid demo token');
  }
  return payload.userType;
}
