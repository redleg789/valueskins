import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
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

    const query = req.query.q as string;
    const type = (req.query.type as string) || 'all';
    const niche = req.query.niche as string | undefined;
    const minBudget = parseInt(req.query.minBudget as string) || 0;
    const maxBudget = parseInt(req.query.maxBudget as string) || Infinity;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const searchResults: any = {};

    // Search deals
    if (type === 'all' || type === 'deals') {
      const dealWhere: any = {
        AND: [
          { state: { in: ['PUBLISHED', 'ACTIVE'] } },
          {
            OR: [
              { title: { search: query } },
              { description: { search: query } },
            ],
          },
          { budget: { gte: minBudget, lte: maxBudget } },
        ],
      };

      if (niche) {
        dealWhere.niche = { hasSome: [niche] };
      }

      searchResults.deals = await prisma.deal.findMany({
        where: dealWhere,
        include: { brand: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    }

    // Search creators
    if (type === 'all' || type === 'creators') {
      searchResults.creators = await prisma.user.findMany({
        where: {
          AND: [
            { userType: 'CREATOR' },
            { status: 'ACTIVE' },
            {
              OR: [
                { name: { search: query } },
                { handle: { search: query } },
                { bio: { search: query } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          handle: true,
          avatar: true,
          verified: true,
          followers: true,
          creatorNiche: true,
        },
        orderBy: { followers: 'desc' },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      searchResults.posts = await prisma.post.findMany({
        where: {
          AND: [
            { visibility: 'PUBLIC' },
            { status: 'PUBLISHED' },
            { content: { search: query } },
          ],
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true, handle: true, verified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    }

    // Log search
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'search_performed',
        entityType: 'search',
        changes: { query, type },
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(200).json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
