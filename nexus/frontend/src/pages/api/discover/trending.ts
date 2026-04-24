import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Fetch trending hashtags
  if (req.method === 'GET') {
    try {
      // Get posts from last 24 hours grouped by hashtags
      const oneDayAgo = new Date(Date.now() - 86400000);

      const trendingPosts = await prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: { gt: oneDayAgo },
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

      // Get top 20 trending
      const trending = Array.from(hashtagMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([tag, count]) => ({ title: tag, posts: count }));

      return res.status(200).json({ trending });
    } catch (error) {
      console.error('Fetch trending error:', error);
      return res.status(500).json({ error: 'Failed to fetch trending' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
