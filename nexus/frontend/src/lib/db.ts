import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'nexus.db');

export const db = new Database(dbPath, {
  readonly: false,
  fileMustExist: false,
  verbose: console.log,
});

db.pragma('journal_mode = WAL');
db.pragma('synchronous = FULL');
db.pragma('foreign_keys = ON');
db.pragma('locking_mode = NORMAL');

// Enable encryption (at-rest)
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
if (process.env.NODE_ENV === 'production' && !process.env.DB_ENCRYPTION_KEY) {
  throw new Error('DB_ENCRYPTION_KEY must be set in production');
}

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      isActive BOOLEAN DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      deletedAt TEXT,
      CONSTRAINT username_length CHECK (length(username) BETWEEN 3 AND 20),
      CONSTRAINT email_valid CHECK (email LIKE '%@%.%')
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      deletedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT content_length CHECK (length(content) BETWEEN 1 AND 280)
    );
    CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
    CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts(createdAt DESC);
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      deletedAt TEXT,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT content_length CHECK (length(content) BETWEEN 1 AND 500)
    );
    CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId);
    CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments(userId);
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      recipientId TEXT NOT NULL,
      content TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      deletedAt TEXT,
      FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT content_length CHECK (length(content) BETWEEN 1 AND 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_messages_senderId ON messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_messages_recipientId ON messages(recipientId);
  `);

  // Likes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      postId TEXT,
      commentId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (userId, postId),
      UNIQUE (userId, commentId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
      CHECK ((postId IS NOT NULL AND commentId IS NULL) OR (postId IS NULL AND commentId IS NOT NULL))
    );
  `);

  // Auth tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS authTokens (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt TEXT NOT NULL,
      revokedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_authTokens_token ON authTokens(token);
    CREATE INDEX IF NOT EXISTS idx_authTokens_userId ON authTokens(userId);
  `);

  // Audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS auditLogs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      resourceType TEXT,
      resourceId TEXT,
      details TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auditLogs_userId ON auditLogs(userId);
    CREATE INDEX IF NOT EXISTS idx_auditLogs_createdAt ON auditLogs(createdAt DESC);
  `);

  // Rate limit buckets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rateLimitBuckets (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 1,
      resetAt TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Failed login attempts
  db.exec(`
    CREATE TABLE IF NOT EXISTS failedLoginAttempts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      ipAddress TEXT NOT NULL,
      userAgent TEXT,
      attemptedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_failedLoginAttempts_email ON failedLoginAttempts(email);
    CREATE INDEX IF NOT EXISTS idx_failedLoginAttempts_ipAddress ON failedLoginAttempts(ipAddress);
  `);

  // Backup metadata
  db.exec(`
    CREATE TABLE IF NOT EXISTS backupMetadata (
      id TEXT PRIMARY KEY,
      backupPath TEXT NOT NULL,
      backupSize INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      encryptionKeyHash TEXT NOT NULL
    );
  `);
}

export function encryptField(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptField(encrypted: string): string {
  const [iv, authTag, encryptedData] = encrypted.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(process.cwd(), `backups/nexus-${timestamp}.db`);

  if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
    fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
  }

  const backupDb = new Database(backupPath);
  db.backup(backupDb);
  backupDb.close();

  const stats = fs.statSync(backupPath);
  const encKeyHash = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest('hex');

  db.prepare(`
    INSERT INTO backupMetadata (id, backupPath, backupSize, encryptionKeyHash)
    VALUES (?, ?, ?, ?)
  `).run(crypto.randomUUID(), backupPath, stats.size, encKeyHash);

  return backupPath;
}

export function logAudit(userId: string | null, action: string, resourceType: string, resourceId: string, details: any, ipAddress: string, userAgent: string) {
  db.prepare(`
    INSERT INTO auditLogs (id, userId, action, resourceType, resourceId, details, ipAddress, userAgent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent);
}
