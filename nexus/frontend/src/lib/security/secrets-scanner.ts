import crypto from 'crypto';

const SECRET_PATTERNS = {
  awsAccessKey: /AKIA[0-9A-Z]{16}/,
  awsSecretKey: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/,
  apiKey: /api[_-]?key\s*=\s*[A-Za-z0-9\-_.]{32,}/i,
  privateKey: /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/,
  jwtToken: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  databaseUrl: /postgres:\/\/[^:]+:[^@]+@[^\/]+\/[^\s]+/,
  slackToken: /xox[baprs]-[0-9a-zA-Z\-]{10,255}/,
  githubToken: /ghp_[0-9a-zA-Z]{36}/,
  mongodbUri: /mongodb\+?srv:\/\/[^:]+:[^@]+@/,
  sqlConnectionString: /Server=.+;User\s*=.+;Password=.+/i,
  stripeKey: /sk_live_[0-9a-zA-Z]{24,}/,
  googleApiKey: /AIza[0-9A-Za-z_-]{35}/,
};

export function scanForSecrets(obj: unknown, depth: number = 0): { found: boolean; locations: string[] } {
  const locations: string[] = [];

  if (depth > 5) {
    return { found: false, locations };
  }

  function scan(value: unknown, path: string = ''): void {
    if (typeof value === 'string') {
      for (const [secretType, pattern] of Object.entries(SECRET_PATTERNS)) {
        if (pattern.test(value)) {
          locations.push(`${secretType} at ${path || 'root'}`);
        }
      }
    }

    if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        const newPath = path ? `${path}.${key}` : key;
        if (typeof val === 'object') {
          scan(val, newPath);
        } else if (typeof val === 'string') {
          scan(val, newPath);
        }
      }
    }
  }

  scan(obj);

  return {
    found: locations.length > 0,
    locations,
  };
}

export function maskSecrets(str: string): string {
  let masked = str;

  for (const pattern of Object.values(SECRET_PATTERNS)) {
    masked = masked.replace(pattern, '***REDACTED***');
  }

  return masked;
}

export function logWithoutSecrets(data: unknown): unknown {
  const serialized = JSON.stringify(data);
  return JSON.parse(maskSecrets(serialized));
}

export function validateEnvironmentSecrets(): { valid: boolean; missing: string[] } {
  const required = [
    'DB_ENCRYPTION_KEY',
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (process.env.NODE_ENV === 'production' && missing.length > 0) {
    console.error('Missing required secrets in production:', missing);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function rotateSecrets(): void {
  const newJwtSecret = crypto.randomBytes(32).toString('hex');
  const newSessionSecret = crypto.randomBytes(32).toString('hex');
  const newDbKey = crypto.randomBytes(32).toString('hex');

  console.log('Secrets rotated (update .env)');
  console.log(`JWT_SECRET=${newJwtSecret}`);
  console.log(`SESSION_SECRET=${newSessionSecret}`);
  console.log(`DB_ENCRYPTION_KEY=${newDbKey}`);
}
