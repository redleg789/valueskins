import crypto from 'crypto';

type DemoUserType = 'creator' | 'brand';

type DemoTokenPayload = {
  sub: string;
  userType: DemoUserType;
  iat: number;
  exp: number;
  nonce: string;
};

const DEMO_TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const DEMO_TOKEN_PREFIX = 'demo.v1';

function getDemoSecret(): string | null {
  if (process.env.DEMO_AUTH_SECRET) {
    return process.env.DEMO_AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'valueskins-dev-demo-secret';
  }

  return null;
}

function signPayload(encodedPayload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function userIdForType(userType: DemoUserType): string {
  return userType === 'creator' ? 'user_123' : 'brand_123';
}

export function issueDemoToken(userType: DemoUserType): string | null {
  const secret = getDemoSecret();
  if (!secret) {
    return null;
  }

  const now = Date.now();
  const payload: DemoTokenPayload = {
    sub: userIdForType(userType),
    userType,
    iat: now,
    exp: now + DEMO_TOKEN_TTL_MS,
    nonce: crypto.randomBytes(16).toString('base64url'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encodedPayload, secret);

  return `${DEMO_TOKEN_PREFIX}.${encodedPayload}.${signature}`;
}

export function validateDemoToken(token: string | null | undefined): DemoTokenPayload | null {
  if (typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'demo' || parts[1] !== 'v1') {
    return null;
  }

  const encodedPayload = parts[2];
  const providedSignature = parts[3];
  const secret = getDemoSecret();
  if (!secret) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload, secret);
  const providedBuffer = Buffer.from(providedSignature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as DemoTokenPayload;
    if (
      typeof payload.sub !== 'string' ||
      (payload.userType !== 'creator' && payload.userType !== 'brand') ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number' ||
      typeof payload.nonce !== 'string'
    ) {
      return null;
    }

    const now = Date.now();
    if (payload.iat > now + 60_000 || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
