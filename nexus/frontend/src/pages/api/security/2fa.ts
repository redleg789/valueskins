import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Check 2FA status
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, twoFactorEnabled: true },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ twoFactorEnabled: user.twoFactorEnabled });
    } catch (error) {
      console.error('Fetch 2FA status error:', error);
      return res.status(500).json({ error: 'Failed to fetch 2FA status' });
    }
  }

  // PUT - Toggle 2FA
  if (req.method === 'PUT') {
    try {
      const { enable } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: enable },
        select: { id: true, twoFactorEnabled: true },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Toggle 2FA error:', error);
      return res.status(500).json({ error: 'Failed to toggle 2FA' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
