import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  // GET - Fetch grimoire entries
  if (req.method === 'GET') {
    try {
      const { userId: targetUserId } = req.query;
      const userIdToFetch = targetUserId ? String(targetUserId) : userId;

      if (!userIdToFetch) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entries = await prisma.grimoireEntry.findMany({
        where: {
          userId: userIdToFetch,
          status: 'PUBLISHED',
          deletedAt: null,
          visibility: 'PUBLIC',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const formatted = entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        excerpt: entry.content.substring(0, 150),
        date: new Date(entry.createdAt).toISOString().split('T')[0],
        type: entry.entryType,
        likes: entry.likeCount,
        views: entry.viewCount,
      }));

      return res.status(200).json({ entries: formatted });
    } catch (error) {
      console.error('Fetch grimoire error:', error);
      return res.status(500).json({ error: 'Failed to fetch entries' });
    }
  }

  // POST - Create grimoire entry
  if (req.method === 'POST') {
    try {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { title, content, entryType } = req.body;

      if (!title || !content || !entryType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const entry = await prisma.grimoireEntry.create({
        data: {
          userId,
          title,
          content,
          entryType,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
        },
      });

      return res.status(201).json({
        id: entry.id,
        title: entry.title,
        date: new Date(entry.createdAt).toISOString().split('T')[0],
        type: entry.entryType,
      });
    } catch (error) {
      console.error('Create grimoire error:', error);
      return res.status(500).json({ error: 'Failed to create entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
