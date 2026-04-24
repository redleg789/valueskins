import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // SSE - Real-time feed updates
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for new posts every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const newPosts = await prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            createdAt: { gt: new Date(Date.now() - 10000) }, // Last 10 seconds
          },
          include: {
            user: { select: { id: true, name: true, handle: true, avatar: true, verified: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        if (newPosts.length > 0) {
          newPosts.forEach(post => {
            res.write(`data: ${JSON.stringify({
              type: 'new_post',
              post: {
                id: post.id,
                author: post.user.name,
                handle: post.user.handle,
                avatar: post.user.avatar,
                verified: post.user.verified,
                content: post.content,
                createdAt: post.createdAt,
                likes: post.likeCount,
                comments: post.commentCount,
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('Feed poll error:', error);
      }
    }, 2000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
