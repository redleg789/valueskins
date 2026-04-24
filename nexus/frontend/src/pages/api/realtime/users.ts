import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // SSE - Real-time user updates (avatar, name, bio, etc)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastCheck = new Date();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for user profile updates every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const updatedUsers = await prisma.user.findMany({
          where: {
            updatedAt: { gt: lastCheck },
            status: 'ACTIVE',
          },
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            bio: true,
            verified: true,
            followers: true,
            following: true,
            updatedAt: true,
          },
          take: 20,
        });

        lastCheck = new Date();

        if (updatedUsers.length > 0) {
          updatedUsers.forEach(user => {
            res.write(`data: ${JSON.stringify({
              type: 'user_updated',
              user: {
                id: user.id,
                name: user.name,
                handle: user.handle,
                avatar: user.avatar,
                bio: user.bio,
                verified: user.verified,
                followers: user.followers,
                following: user.following,
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('User poll error:', error);
      }
    }, 3000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
