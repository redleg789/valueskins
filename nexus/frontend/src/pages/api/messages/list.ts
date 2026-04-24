import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const conversationId = req.query.conversationId as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    if (!conversationId) {
      // List conversations
      const conversations = await prisma.conversation.findMany({
        where: {
          participantIds: { hasSome: [decoded.userId] },
        },
        include: {
          participants: {
            select: { id: true, name: true, avatar: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
      });

      return res.status(200).json(conversations);
    }

    // Verify access to conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || !conversation.participantIds.includes(decoded.userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get messages in conversation
    let messagesQuery: any = {
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        content: true,
        createdAt: true,
        readAt: true,
        status: true,
      },
    };

    if (cursor) {
      messagesQuery.skip = 1;
      messagesQuery.cursor = { id: cursor };
    }

    const messages = await prisma.message.findMany(messagesQuery);

    let nextCursor: string | undefined = undefined;
    if (messages.length > limit) {
      nextCursor = messages[limit].id;
      messages.pop();
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        recipientId: decoded.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'READ',
      },
    });

    return res.status(200).json({
      messages: messages.reverse(),
      nextCursor,
    });
  } catch (error) {
    console.error('List messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
