import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { conversationId } = req.query;

  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'Invalid conversationId' });
  }

  // SSE - Real-time messages for a conversation
  if (req.method === 'GET') {
    // Verify user is part of conversation
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || !conv.participantIds.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastCheck = new Date();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for new messages every 1 second
    const pollInterval = setInterval(async () => {
      try {
        const newMessages = await prisma.message.findMany({
          where: {
            conversationId,
            createdAt: { gt: lastCheck },
            status: { not: 'DELETED' },
          },
          orderBy: { createdAt: 'asc' },
        });

        lastCheck = new Date();

        if (newMessages.length > 0) {
          newMessages.forEach(msg => {
            res.write(`data: ${JSON.stringify({
              type: 'new_message',
              message: {
                id: msg.id,
                from: msg.senderId === userId ? 'me' : 'them',
                content: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString(),
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('Message poll error:', error);
      }
    }, 1000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      res.end();
    });
  }
}
