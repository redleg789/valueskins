import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === 'string') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'user_logout',
        entityType: 'auth',
        entityId: decoded.userId,
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }
}
