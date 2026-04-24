import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Fetch messages for a conversation
  if (req.method === 'GET') {
    try {
      const { conversationId } = req.query;

      if (!conversationId || typeof conversationId !== 'string') {
        return res.status(400).json({ error: 'Invalid conversationId' });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || !conversation.participantIds.includes(userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId, status: { not: 'DELETED' } },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });

      const formatted = messages.map(msg => ({
        id: msg.id,
        from: msg.senderId === userId ? 'me' : 'them',
        content: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString(),
      }));

      return res.status(200).json({ messages: formatted });
    } catch (error) {
      console.error('Fetch messages error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
