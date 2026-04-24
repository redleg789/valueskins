import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { email } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { email, emailVerified: false },
      select: { id: true, email: true, emailVerified: true },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update email error:', error);
    return res.status(500).json({ error: 'Failed to update email' });
  }
}
