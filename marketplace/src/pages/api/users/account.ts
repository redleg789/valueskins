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

  // GET - Fetch account info
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          twoFactorEnabled: true,
        },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(user);
    } catch (error) {
      console.error('Fetch account error:', error);
      return res.status(500).json({ error: 'Failed to fetch account' });
    }
  }

  // PUT - Update account info
  if (req.method === 'PUT') {
    try {
      const { name, phone } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          twoFactorEnabled: true,
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Update account error:', error);
      return res.status(500).json({ error: 'Failed to update account' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
