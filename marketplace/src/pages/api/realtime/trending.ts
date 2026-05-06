import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // SSE - Real-time trending hashtags and creators
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastCheck = new Date();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for trending updates every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        // Get posts from last 24 hours grouped by hashtags
        const trendingPosts = await prisma.post.findMany({
          where: {
            status: 'PUBLISHED',
            createdAt: { gt: new Date(Date.now() - 86400000) },
          },
          select: { hashtags: true },
        });

        // Count hashtag occurrences
        const hashtagMap = new Map<string, number>();
        trendingPosts.forEach(post => {
          post.hashtags.forEach(tag => {
            hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1);
          });
        });

        // Get top 10 trending
        const trending = Array.from(hashtagMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, posts: count }));

        if (trending.length > 0) {
          res.write(`data: ${JSON.stringify({
            type: 'trending_hashtags',
            trending,
          })}\n\n`);
        }

        // Get top creators by new followers
        const topCreators = await prisma.user.findMany({
          where: {
            userType: 'CREATOR',
            status: 'ACTIVE',
            updatedAt: { gt: lastCheck },
          },
          orderBy: { followerCount: 'desc' },
          select: {
            id: true,
            name: true,
            handle: true,
            avatar: true,
            followerCount: true,
            creatorNiche: true,
          },
          take: 5,
        });

        lastCheck = new Date();

        if (topCreators.length > 0) {
          res.write(`data: ${JSON.stringify({
            type: 'trending_creators',
            creators: topCreators,
          })}\n\n`);
        }
      } catch (error) {
        console.error('Trending poll error:', error);
      }
    }, 5000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
