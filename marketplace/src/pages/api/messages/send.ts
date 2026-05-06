import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const sendMessageSchema = z.object({
  recipientId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  dealId: z.string().cuid().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
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

    const validationResult = await validateInput(sendMessageSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const { recipientId, content, dealId } = validationResult.data;

    if (recipientId === decoded.userId) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { hasSome: [decoded.userId] } },
          { participantIds: { hasSome: [recipientId] } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: [decoded.userId, recipientId],
          participants: {
            connect: [{ id: decoded.userId }, { id: recipientId }],
          },
          dealId,
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: decoded.userId,
        recipientId,
        content,
        status: 'SENT',
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Notify recipient
    const sender = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        actorId: decoded.userId,
        actorName: sender?.name,
        title: 'New Message',
        message: `${sender?.name || 'Someone'} sent you a message`,
        metadata: {
          conversationId: conversation.id,
          messageId: message.id,
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'message_sent',
        entityType: 'message',
        entityId: message.id,
        changes: { recipientId },
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
