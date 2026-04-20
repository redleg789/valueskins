import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from './auth';
import { db, initDb, logAudit } from '@/lib/db';
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';
import { checkDDoSProtection } from '@/lib/security/ddos-protection';
import { injectionPrevention } from '@/lib/security/injection-prevention';
import { enforceTLS, validatePublicKeyPin, verifyCertificateValidity } from '@/lib/security/tls-pinning';
import { scanForSecrets, logWithoutSecrets } from '@/lib/security/secrets-scanner';
import { calculateAnomalyScore } from '@/lib/security/intrusion-detection';

initDb();

const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const bucket = rateLimits.get(key);

  if (!bucket || now > bucket.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  enforceTLS(req, res, () => {});
  validatePublicKeyPin(req, res, () => {});
  verifyCertificateValidity(req, res, () => {});

  checkDDoSProtection(req, res, () => {});

  injectionPrevention(req, res, () => {});

  const secrets = scanForSecrets(req.body);
  if (secrets.found) {
    console.error('Secrets detected in request:', logWithoutSecrets(secrets.locations));
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const user = validateToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const anomaly = calculateAnomalyScore(req, user.userId);
  if (anomaly.isAnomaly) {
    res.setHeader('X-Anomaly-Score', anomaly.score.toString());
    if (anomaly.score >= 9) {
      logAudit(user.userId, 'INTRUSION_DETECTED', JSON.stringify(anomaly.factors));
      return res.status(403).json({ error: 'Suspicious activity. Please verify identity.' });
    }
  }

  const rateLimitKey = `${user.userId}:${req.method}:${req.query.action || 'default'}`;
  if (!checkRateLimit(rateLimitKey, 100, 60000)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (req.method === 'GET') {
    const posts = db.prepare('SELECT id, userId, content, likes, comments, shares, createdAt FROM posts WHERE deletedAt IS NULL ORDER BY createdAt DESC LIMIT 100').all();
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const { action, postId, content, text } = req.body;

    if (action === 'like' && postId) {
      const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const existing = db.prepare('SELECT * FROM likes WHERE userId = ? AND postId = ?').get(user.userId, postId);
      if (!existing) {
        db.prepare('INSERT INTO likes (id, userId, postId) VALUES (?, ?, ?)').run(crypto.randomUUID(), user.userId, postId);
        db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(postId);
      }

      const updatedPost = db.prepare('SELECT likes FROM posts WHERE id = ?').get(postId) as any;
      return res.status(200).json({ success: true, likes: updatedPost?.likes || 0 });
    }

    if (action === 'comment' && postId) {
      const sanitizedText = DOMPurify.sanitize((text || '').trim(), { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'], ALLOWED_ATTR: [] });
      if (sanitizedText.length < 1 || sanitizedText.length > 500) return res.status(400).json({ error: 'Comment invalid' });

      const commentId = crypto.randomUUID();
      db.prepare('INSERT INTO comments (id, postId, userId, content) VALUES (?, ?, ?, ?)').run(commentId, postId, user.userId, sanitizedText);
      db.prepare('UPDATE posts SET comments = comments + 1 WHERE id = ?').run(postId);

      return res.status(201).json({ id: commentId, content: sanitizedText });
    }

    const sanitizedContent = DOMPurify.sanitize((content || '').trim(), { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'], ALLOWED_ATTR: [] });
    if (sanitizedContent.length < 1 || sanitizedContent.length > 280) return res.status(400).json({ error: 'Post invalid' });

    const newPostId = crypto.randomUUID();
    db.prepare('INSERT INTO posts (id, userId, content) VALUES (?, ?, ?)').run(newPostId, user.userId, sanitizedContent);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(newPostId);
    return res.status(201).json(post);
  }

  if (req.method === 'DELETE') {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ error: 'postId required' });

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== user.userId && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    db.prepare('UPDATE posts SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?').run(postId);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
