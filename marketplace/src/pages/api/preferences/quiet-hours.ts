import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Fetch quiet hours
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { availabilityCalendar: true },
      });

      const quietHours = user?.availabilityCalendar as any || { start: null, end: null };
      return res.status(200).json(quietHours);
    } catch (error) {
      console.error('Fetch quiet hours error:', error);
      return res.status(500).json({ error: 'Failed to fetch quiet hours' });
    }
  }

  // PUT - Update quiet hours
  if (req.method === 'PUT') {
    try {
      const { start, end } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          availabilityCalendar: { start, end },
        },
        select: { availabilityCalendar: true },
      });

      return res.status(200).json(updated.availabilityCalendar);
    } catch (error) {
      console.error('Update quiet hours error:', error);
      return res.status(500).json({ error: 'Failed to update quiet hours' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
