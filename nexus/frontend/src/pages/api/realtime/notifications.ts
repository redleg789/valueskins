import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // SSE - Real-time notifications
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastCheck = new Date();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for new notifications every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const newNotifications = await prisma.notification.findMany({
          where: {
            userId,
            createdAt: { gt: lastCheck },
            deletedAt: null,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        lastCheck = new Date();

        if (newNotifications.length > 0) {
          newNotifications.forEach(notif => {
            res.write(`data: ${JSON.stringify({
              type: 'notification',
              notification: {
                id: notif.id,
                title: notif.title,
                message: notif.message,
                type: notif.type,
                time: new Date(notif.createdAt).toLocaleTimeString(),
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('Notification poll error:', error);
      }
    }, 2000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
