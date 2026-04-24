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

  // GET - Fetch user's conversations
  if (req.method === 'GET') {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { participantIds: { has: userId } },
        include: {
          participants: { select: { id: true, name: true, avatar: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const formatted = conversations.map(conv => ({
        id: conv.id,
        name: conv.participants.find(p => p.id !== userId)?.name || 'Unknown',
        lastMessage: conv.messages[0]?.content || '',
        time: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : '',
        unread: 0,
        avatar: conv.participants.find(p => p.id !== userId)?.avatar || 'https://via.placeholder.com/48',
      }));

      return res.status(200).json({ conversations: formatted });
    } catch (error) {
      console.error('Fetch conversations error:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  // POST - Create conversation or send message
  if (req.method === 'POST') {
    try {
      const { recipientId, content, conversationId } = req.body;

      if (conversationId && content) {
        // Send message to existing conversation
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            recipientId,
            content,
            status: 'SENT',
          },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });

        return res.status(201).json({
          id: message.id,
          from: 'me',
          content: message.content,
          time: new Date(message.createdAt).toLocaleTimeString(),
        });
      }

      if (recipientId) {
        // Create new conversation
        const existing = await prisma.conversation.findFirst({
          where: {
            participantIds: { hasEvery: [userId, recipientId] },
          },
        });

        if (existing) {
          return res.status(200).json({ conversationId: existing.id });
        }

        const conversation = await prisma.conversation.create({
          data: {
            participantIds: [userId, recipientId],
            participants: { connect: [{ id: userId }, { id: recipientId }] },
          },
        });

        return res.status(201).json({ conversationId: conversation.id });
      }

      return res.status(400).json({ error: 'Invalid request' });
    } catch (error) {
      console.error('Conversation error:', error);
      return res.status(500).json({ error: 'Failed to process conversation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
