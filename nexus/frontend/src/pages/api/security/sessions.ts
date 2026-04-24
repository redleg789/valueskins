import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Fetch active sessions
  if (req.method === 'GET') {
    try {
      const sessions = await prisma.session.findMany({
        where: { userId },
        select: { id: true, createdAt: true, lastActivityAt: true, ipAddress: true, userAgent: true },
        orderBy: { lastActivityAt: 'desc' },
      });

      return res.status(200).json({ sessions });
    } catch (error) {
      console.error('Fetch sessions error:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  // DELETE - Logout all devices
  if (req.method === 'DELETE') {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });

      return res.status(200).json({ message: 'All sessions terminated' });
    } catch (error) {
      console.error('Logout all error:', error);
      return res.status(500).json({ error: 'Failed to logout all devices' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
