import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Fetch content preferences
  if (req.method === 'GET') {
    try {
      const prefs = await prisma.userPreferences.findUnique({
        where: { userId },
        select: { adultContent: true },
      });

      return res.status(200).json(prefs || { adultContent: false });
    } catch (error) {
      console.error('Fetch content prefs error:', error);
      return res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  // PUT - Update content preferences
  if (req.method === 'PUT') {
    try {
      const { adultContent, language, mediaAutoplay, theme } = req.body;

      const updated = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          ...(adultContent !== undefined && { adultContent }),
        },
        create: {
          userId,
          ...(adultContent !== undefined && { adultContent }),
        },
      });

      // Store additional preferences in localStorage client-side
      // These are user preferences that don't need database storage
      return res.status(200).json({
        adultContent: updated.adultContent,
        language,
        mediaAutoplay,
        theme,
      });
    } catch (error) {
      console.error('Update content prefs error:', error);
      return res.status(500).json({ error: 'Failed to update preferences' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
