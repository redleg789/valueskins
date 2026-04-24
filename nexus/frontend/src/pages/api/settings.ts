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

  // GET - Fetch user settings
  if (req.method === 'GET') {
    try {
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: { userId },
        });
      }

      return res.status(200).json(preferences);
    } catch (error) {
      console.error('Fetch settings error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  // PUT - Update user settings
  if (req.method === 'PUT') {
    try {
      const {
        emailNotifications,
        pushNotifications,
        inAppNotifications,
        allowMessages,
        adultContent,
        weeklyDigest,
      } = req.body;

      const updated = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          ...(emailNotifications !== undefined && { emailNotifications }),
          ...(pushNotifications !== undefined && { pushNotifications }),
          ...(inAppNotifications !== undefined && { inAppNotifications }),
          ...(allowMessages !== undefined && { allowMessages }),
          ...(adultContent !== undefined && { adultContent }),
          ...(weeklyDigest !== undefined && { weeklyDigest }),
        },
        create: {
          userId,
          ...(emailNotifications !== undefined && { emailNotifications }),
          ...(pushNotifications !== undefined && { pushNotifications }),
          ...(inAppNotifications !== undefined && { inAppNotifications }),
          ...(allowMessages !== undefined && { allowMessages }),
          ...(adultContent !== undefined && { adultContent }),
          ...(weeklyDigest !== undefined && { weeklyDigest }),
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Update settings error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
