import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { postId } = req.query;

  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ error: 'Invalid postId' });
  }

  // SSE - Real-time engagement updates (likes, comments, etc)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastCheck = new Date();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for post engagement updates every 1 second
    const pollInterval = setInterval(async () => {
      try {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          include: {
            likes: { where: { createdAt: { gt: lastCheck } } },
            comments: { where: { createdAt: { gt: lastCheck } } },
          },
        });

        lastCheck = new Date();

        if (post) {
          if (post.likes.length > 0 || post.comments.length > 0) {
            res.write(`data: ${JSON.stringify({
              type: 'engagement_updated',
              engagement: {
                postId: post.id,
                likes: post.likeCount,
                comments: post.commentCount,
                shares: post.shareCount,
                newLikes: post.likes.length,
                newComments: post.comments.length,
              },
            })}\n\n`);
          }
        }
      } catch (error) {
        console.error('Engagement poll error:', error);
      }
    }, 1000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
