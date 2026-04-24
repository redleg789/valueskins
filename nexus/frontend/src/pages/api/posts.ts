import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const userId = req.query.userId as string | undefined;
    const posts = db.getPosts(userId);
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const { content, action, postId } = req.body;

    if (action === 'like' || action === 'unlike') {
      const result = db.toggleLike(postId);
      if (!result) {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(200).json(result);
    }

    if (content) {
      const post = db.createPost('user-1', content);
      if (!post) {
        return res.status(400).json({ error: 'Failed to create post' });
      }
      return res.status(201).json(post);
    }

    return res.status(400).json({ error: 'Invalid request' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}