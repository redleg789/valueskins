import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from './auth';
import { validateEmail, validateUsername, sanitizeOutput } from './middleware/security';
import crypto from 'crypto';

let users = new Map<string, any>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );

  // CORS
  const origin = req.headers.origin;
  if (origin?.includes('localhost') || origin?.includes('vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // Authenticate
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = validateToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    const { userId } = req.query;

    if (userId === 'me') {
      const userData = users.get(user.userId);
      return res.status(200).json(sanitizeOutput(userData || { id: user.userId }));
    }

    if (userId && typeof userId === 'string') {
      const targetUser = users.get(userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(sanitizeOutput(targetUser));
    }

    return res.status(400).json({ error: 'userId required' });
  }

  if (req.method === 'PUT') {
    const { username, bio, avatar } = req.body;
    const userId = user.userId;

    // Validate input
    if (username && !validateUsername(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio too long (max 500 chars)' });
    }

    const userData = users.get(userId) || { id: userId };

    if (username) userData.username = username;
    if (bio !== undefined) userData.bio = bio;
    if (avatar) userData.avatar = avatar;
    userData.updatedAt = new Date().toISOString();

    users.set(userId, userData);
    return res.status(200).json(sanitizeOutput(userData));
  }

  if (req.method === 'DELETE') {
    // Delete user account (soft delete)
    const userId = user.userId;
    const userData = users.get(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    userData.deletedAt = new Date().toISOString();
    userData.isActive = false;
    users.set(userId, userData);

    return res.status(200).json({ success: true, message: 'Account deleted' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
