import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const createCommentSchema = z.object({
  postId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  parentCommentId: z.string().cuid().optional(),
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

    const validationResult = await validateInput(createCommentSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const { postId, content, parentCommentId } = validationResult.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, handle: true },
    });

    // Extract mentions
    const mentions = content.match(/@[\w-]+/g) || [];
    const uniqueMentions = [...new Set(mentions.map(m => m.slice(1)))] as string[];

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: decoded.userId,
        parentCommentId: parentCommentId || null,
        content,
        mentions: uniqueMentions,
        status: 'PUBLISHED',
      },
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    // Notify post author
    if (post.userId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'COMMENT_ON_POST',
          actorId: decoded.userId,
          actorName: user?.name,
          title: 'New Comment',
          message: `${user?.name} commented on your post`,
          metadata: {
            postId,
            commentId: comment.id,
          },
        },
      });
    }

    // Notify mentioned users
    for (const mention of uniqueMentions) {
      const mentionedUser = await prisma.user.findUnique({
        where: { handle: mention },
      });

      if (mentionedUser && mentionedUser.id !== decoded.userId) {
        await prisma.notification.create({
          data: {
            userId: mentionedUser.id,
            type: 'MENTION',
            actorId: decoded.userId,
            actorName: user?.name,
            title: 'You were mentioned',
            message: `${user?.name} mentioned you in a comment`,
            metadata: {
              postId,
              commentId: comment.id,
            },
          },
        });
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'comment_created',
        entityType: 'comment',
        entityId: comment.id,
        changes: { postId },
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
