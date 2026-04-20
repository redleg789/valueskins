import crypto from 'crypto';

export const db = {
  prepare: (sql: string) => ({
    all: (...args: any[]) => [],
    get: (...args: any[]) => null,
    run: (...args: any[]) => ({ changes: 0 }),
  }),
  exec: () => {},
};

export function initDb() {
  console.log('Database initialized (in-memory mode)');
}

export function logAudit(userId: string, action: string, details: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId: crypto.createHash('sha256').update(userId).digest('hex').slice(0, 12),
    action,
    details: details.slice(0, 100),
  };
  console.log('[AUDIT]', logEntry);
}
