import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from './auth';
import { checkDDoSProtection } from '@/lib/security/ddos-protection';
import { injectionPrevention } from '@/lib/security/injection-prevention';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  checkDDoSProtection(req, res, () => {});
  injectionPrevention(req, res, () => {});

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = validateToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const metrics = {
    userId: user.userId,
    totalLikes: Math.floor(Math.random() * 5000) + 100,
    totalComments: Math.floor(Math.random() * 500) + 10,
    totalShares: Math.floor(Math.random() * 200) + 5,
    averageLikesPerPost: Math.floor(Math.random() * 500) + 50,
    topPost: {
      id: 'post_123',
      content: 'This is your most engaging post',
      likes: Math.floor(Math.random() * 1000) + 100,
      comments: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5,
      createdAt: new Date().toISOString(),
    },
    lastUpdated: new Date().toISOString(),
  };

  return res.status(200).json(metrics);
}
