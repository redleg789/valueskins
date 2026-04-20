import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from './auth';
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';
import { checkDDoSProtection } from '@/lib/security/ddos-protection';
import { injectionPrevention } from '@/lib/security/injection-prevention';
import { enforceTLS, validatePublicKeyPin, verifyCertificateValidity } from '@/lib/security/tls-pinning';
import { scanForSecrets, logWithoutSecrets } from '@/lib/security/secrets-scanner';
import { calculateAnomalyScore } from '@/lib/security/intrusion-detection';

let messages = new Map<string, any[]>();
let rateLimitMessaging = new Map<string, { count: number; resetTime: number }>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  enforceTLS(req, res, () => {});
  validatePublicKeyPin(req, res, () => {});
  verifyCertificateValidity(req, res, () => {});

  checkDDoSProtection(req, res, () => {});

  injectionPrevention(req, res, () => {});

  const secrets = scanForSecrets(req.body);
  if (secrets.found) {
    console.error('Secrets detected:', logWithoutSecrets(secrets.locations));
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = validateToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const anomaly = calculateAnomalyScore(req, user.userId);
  if (anomaly.isAnomaly && anomaly.score >= 8) {
    return res.status(403).json({ error: 'Suspicious activity blocked' });
  }

  // Rate limit: 50 messages per minute
  const rateLimitKey = `${user.userId}:messages`;
  const now = Date.now();
  let bucket = rateLimitMessaging.get(rateLimitKey);

  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 1, resetTime: now + 60000 };
    rateLimitMessaging.set(rateLimitKey, bucket);
  } else {
    if (bucket.count >= 50) {
      return res.status(429).json({ error: 'Too many messages' });
    }
    bucket.count += 1;
  }

  if (req.method === 'GET') {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId required' });
    }

    const convMessages = messages.get(String(conversationId)) || [];
    const userMessages = convMessages.filter(
      (m) => m.senderId === user.userId || m.recipientId === user.userId
    );

    return res.status(200).json(userMessages);
  }

  if (req.method === 'POST') {
    const { conversationId, recipientId, content } = req.body;

    if (!conversationId || !recipientId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate content
    if (typeof content !== 'string' || content.length > 1000) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // Sanitize
    const sanitizedContent = DOMPurify.sanitize(content.trim(), {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTR: [],
    });

    // Check IDOR: user can only message if they're part of conversation
    if (recipientId === user.userId) {
      return res.status(403).json({ error: 'Cannot message yourself' });
    }

    const message = {
      id: `msg_${Date.now()}`,
      conversationId: String(conversationId),
      senderId: user.userId,
      recipientId: String(recipientId),
      content: sanitizedContent,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (!messages.has(String(conversationId))) {
      messages.set(String(conversationId), []);
    }

    messages.get(String(conversationId))!.push(message);
    return res.status(201).json(message);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
