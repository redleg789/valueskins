import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const filter = req.query.filter as string || 'all';
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const where: any = { userId: decoded.userId };

    if (filter === 'unread') {
      where.readAt = null;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    let nextCursor: string | undefined = undefined;
    if (notifications.length > limit) {
      nextCursor = notifications[limit].id;
      notifications.pop();
    }

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: decoded.userId,
        readAt: null,
      },
    });

    return res.status(200).json({
      notifications,
      unreadCount,
      nextCursor,
    });
  } catch (error) {
    console.error('List notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
