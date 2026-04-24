import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const markReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'PUT') {
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

    const validationResult = await validateInput(markReadSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const { notificationIds } = validationResult.data;

    // Verify ownership
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: notificationIds },
        userId: decoded.userId,
      },
    });

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as read
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        readAt: new Date(),
        inAppSeen: true,
        inAppSeenAt: new Date(),
      },
    });

    return res.status(200).json({
      updated: result.count,
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
