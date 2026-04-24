import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true },
    });

    const sessions = await prisma.session.findMany({
      where: { userId },
      select: { createdAt: true, ipAddress: true, userAgent: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.status(200).json({
      lastLogin: user?.lastLoginAt,
      loginHistory: sessions.map(s => ({
        timestamp: s.createdAt,
        ip: s.ipAddress || 'Unknown',
        device: s.userAgent ? parseUserAgent(s.userAgent) : 'Unknown',
      })),
    });
  } catch (error) {
    console.error('Fetch login history error:', error);
    return res.status(500).json({ error: 'Failed to fetch login history' });
  }
}

function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown Device';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Mobile')) return 'Mobile Browser';
  return 'Unknown Device';
}
