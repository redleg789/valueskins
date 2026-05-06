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
      include: {
        posts: true,
        grimoires: true,
        comments: true,
        likes: true,
        sentMessages: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      posts: user.posts,
      grimoires: user.grimoires,
      comments: user.comments,
      likes: user.likes,
      messages: user.sentMessages,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
}
