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

  // GET - Fetch creators
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const niche = req.query.niche as string;
      const limit = 20;
      const skip = (page - 1) * limit;

      const where: any = {
        userType: 'CREATOR',
        status: 'ACTIVE',
      };

      if (niche) {
        where.creatorNiche = niche;
      }

      const creators = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          handle: true,
          avatar: true,
          verified: true,
          followers: true,
          creatorNiche: true,
          bio: true,
        },
        orderBy: { followers: 'desc' },
        skip,
        take: limit,
      });

      return res.status(200).json({ creators });
    } catch (error) {
      console.error('Fetch creators error:', error);
      return res.status(500).json({ error: 'Failed to fetch creators' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
