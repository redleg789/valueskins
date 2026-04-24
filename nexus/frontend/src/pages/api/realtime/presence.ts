import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// In-memory presence tracking (in production, use Redis)
const onlineUsers = new Map<string, { lastSeen: Date; userId: string }>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // POST - Mark user as online/update last seen
  if (req.method === 'POST') {
    try {
      onlineUsers.set(userId, { lastSeen: new Date(), userId });

      // Update user's last login
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });

      // Return list of online users
      const onlineList = Array.from(onlineUsers.values())
        .filter(u => new Date().getTime() - u.lastSeen.getTime() < 60000); // 1 minute timeout

      const onlineUserIds = onlineList.map(u => u.userId);

      const onlineUsersData = await prisma.user.findMany({
        where: { id: { in: onlineUserIds } },
        select: { id: true, name: true, handle: true, avatar: true },
      });

      return res.status(200).json({ online: onlineUsersData });
    } catch (error) {
      console.error('Presence update error:', error);
      return res.status(500).json({ error: 'Failed to update presence' });
    }
  }

  // SSE - Real-time online status updates
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Mark user as online
    onlineUsers.set(userId, { lastSeen: new Date(), userId });

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for online status changes every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);

        // Remove stale users
        for (const [key, user] of onlineUsers.entries()) {
          if (user.lastSeen < oneMinuteAgo) {
            onlineUsers.delete(key);
          }
        }

        const onlineList = Array.from(onlineUsers.values());
        const onlineUserIds = onlineList.map(u => u.userId);

        if (onlineUserIds.length > 0) {
          const onlineUsersData = await prisma.user.findMany({
            where: { id: { in: onlineUserIds } },
            select: { id: true, name: true, handle: true, avatar: true, lastLoginAt: true },
          });

          onlineUsersData.forEach(user => {
            res.write(`data: ${JSON.stringify({
              type: 'user_online',
              user: {
                id: user.id,
                name: user.name,
                handle: user.handle,
                avatar: user.avatar,
                status: 'online',
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('Presence poll error:', error);
      }
    }, 2000);

    req.on('close', () => {
      onlineUsers.delete(userId);
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
