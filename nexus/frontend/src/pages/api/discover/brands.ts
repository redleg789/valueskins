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

  // GET - Fetch brands
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;

      const brands = await prisma.user.findMany({
        where: {
          userType: 'BRAND',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          companyName: true,
          handle: true,
          avatar: true,
          verified: true,
          followerCount: true,
          bio: true,
        },
        orderBy: { followerCount: 'desc' },
        skip,
        take: limit,
      });

      return res.status(200).json({ brands });
    } catch (error) {
      console.error('Fetch brands error:', error);
      return res.status(500).json({ error: 'Failed to fetch brands' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
