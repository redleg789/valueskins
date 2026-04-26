import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const postCreateSchema = z.object({
  content: z.string().min(1).max(2000),
  action: z.enum(['like', 'unlike', 'create']).optional(),
  postId: z.string().uuid().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  // GET - Fetch feed posts
  if (req.method === 'GET') {
    try {
      const page = Math.max(1, Math.min(parseInt(req.query.page as string) || 1, 1000));
      const limit = 20;
      const skip = (page - 1) * limit;

      const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED', visibility: 'PUBLIC', deletedAt: null },
        include: {
          user: { select: { id: true, name: true, handle: true, avatar: true, verified: true } },
          likes: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const postsWithLikeStatus = posts.map(post => ({
        id: post.id,
        userId: post.userId,
        author: post.user.name,
        handle: post.user.handle,
        avatar: post.user.avatar,
        verified: post.user.verified,
        content: post.content,
        createdAt: post.createdAt,
        likes: post.likeCount,
        comments: post.commentCount,
        shares: post.shareCount,
        saves: 0,
        hashtags: post.hashtags,
        liked: userId && post.likes && (post.likes as any[]).length > 0,
      }));

      return res.status(200).json({ posts: postsWithLikeStatus });
    } catch (error) {
      console.error('Fetch posts error:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  // POST - Create post or like/unlike
  if (req.method === 'POST') {
    try {
      const validation = postCreateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid request', details: validation.error.issues });
      }

      const { content, action, postId } = validation.data;

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Like/Unlike action
      if (action === 'like') {
        try {
          await prisma.like.create({ data: { userId, postId } });
          await prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
        } catch (e: any) {
          if (e.code !== 'P2002') throw e;
        }
        const post = await prisma.post.findUnique({ where: { id: postId } });
        return res.status(200).json({ likes: post?.likeCount || 0 });
      }

      if (action === 'unlike') {
        await prisma.like.delete({
          where: { userId_postId: { userId, postId } },
        }).catch(() => {});
        await prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
        const post = await prisma.post.findUnique({ where: { id: postId } });
        return res.status(200).json({ likes: post?.likeCount || 0 });
      }

      // Create post
      if (!action && content) {
        const hashtags = (content.match(/#[\w]+/g) || []).map(t => t.toLowerCase());
        const sanitized = content
          .trim()
          .slice(0, 2000)
          .replace(/[<>]/g, '');

        const post = await prisma.post.create({
          data: {
            userId,
            content: sanitized,
            hashtags,
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
          },
          include: { user: { select: { id: true, name: true, handle: true, avatar: true, verified: true } } },
        });

        return res.status(201).json({
          id: post.id,
          userId: post.userId,
          author: post.user.name,
          handle: post.user.handle,
          avatar: post.user.avatar,
          verified: post.user.verified,
          content: post.content,
          createdAt: post.createdAt,
          likes: 0,
          comments: 0,
          shares: 0,
          hashtags: post.hashtags,
          liked: false,
        });
      }

      return res.status(400).json({ error: 'Invalid request' });
    } catch (error) {
      console.error('Post error:', error);
      return res.status(500).json({ error: 'Failed to process post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}