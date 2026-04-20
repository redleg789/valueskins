/**
 * SECURE Posts API with:
 * - Authentication validation
 * - IDOR prevention
 * - Rate limiting
 * - XSS prevention
 * - CSRF protection
 * - Input validation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from './auth';
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';

// Mock database
let posts = [
  {
    id: '1',
    userId: 'user_123',
    author: 'Sarah Chen',
    handle: '@sarahchen',
    avatar: '👩‍🎨',
    verified: true,
    content: 'Just landed a collab with Nike! 🔥 So excited for this journey',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 2341,
    comments: 89,
    shares: 124,
  },
];

let likes = new Map<string, Set<string>>();
let comments = new Map<string, any[]>();

// Rate limiting per user per action
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const bucket = rateLimits.get(key);

  if (!bucket || now > bucket.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

// CSRF token validation
function validateCSRFToken(req: NextApiRequest): boolean {
  const tokenFromBody = req.body._csrf;
  const tokenFromCookie = req.cookies.csrf_token;

  if (!tokenFromBody || !tokenFromCookie) {
    return false;
  }

  // Timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(tokenFromBody), Buffer.from(tokenFromCookie));
}

// Sanitize user input
function sanitizeInput(input: string, maxLength: number = 280): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds max length of ${maxLength}`);
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  }).trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. AUTHENTICATION: Validate token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
  }

  const token = authHeader.replace('Bearer ', '');
  const user = validateToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { userId, role } = user;

  // 2. CSRF: Validate CSRF token on POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
    if (!validateCSRFToken(req)) {
      return res.status(403).json({ error: 'CSRF token mismatch' });
    }
  }

  // 3. RATE LIMITING
  const rateLimitKey = `${userId}:${req.method}:${req.query.action || 'default'}`;
  if (!checkRateLimit(rateLimitKey, 100, 60000)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  // GET endpoints
  if (req.method === 'GET') {
    const { action, postId } = req.query;

    if (action === 'feed') {
      return res.status(200).json(posts);
    }

    if (action === 'post' && postId) {
      const post = posts.find(p => p.id === String(postId));
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(200).json(post);
    }

    if (action === 'comments' && postId) {
      const postComments = comments.get(String(postId)) || [];
      return res.status(200).json(postComments);
    }

    return res.status(200).json(posts);
  }

  // POST endpoints
  if (req.method === 'POST') {
    const { action, postId, content, text } = req.body;

    // LIKE
    if (action === 'like' && postId) {
      const post = posts.find(p => p.id === String(postId));
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (!likes.has(String(postId))) {
        likes.set(String(postId), new Set());
      }

      const postLikes = likes.get(String(postId))!;
      if (!postLikes.has(userId)) {
        postLikes.add(userId);
        post.likes += 1;
      }

      return res.status(200).json({ success: true, likes: post.likes });
    }

    // UNLIKE
    if (action === 'unlike' && postId) {
      const post = posts.find(p => p.id === String(postId));
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const postLikes = likes.get(String(postId));
      if (postLikes && postLikes.has(userId)) {
        postLikes.delete(userId);
        post.likes = Math.max(0, post.likes - 1);
      }

      return res.status(200).json({ success: true, likes: post.likes });
    }

    // COMMENT
    if (action === 'comment' && postId) {
      try {
        const sanitizedText = sanitizeInput(text, 500);

        const post = posts.find(p => p.id === String(postId));
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        if (!comments.has(String(postId))) {
          comments.set(String(postId), []);
        }

        const newComment = {
          id: `comment_${Date.now()}`,
          postId: String(postId),
          userId,
          text: sanitizedText,
          createdAt: new Date().toISOString(),
          likes: 0,
        };

        comments.get(String(postId))!.push(newComment);
        post.comments += 1;

        return res.status(201).json(newComment);
      } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid comment' });
      }
    }

    // CREATE POST
    try {
      const sanitizedContent = sanitizeInput(content, 280);

      const newPost = {
        id: `post_${Date.now()}`,
        userId,
        author: 'You',
        handle: '@yourhandle',
        avatar: '👤',
        verified: false,
        content: sanitizedContent,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
      };

      posts.unshift(newPost);
      return res.status(201).json(newPost);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid post' });
    }
  }

  // DELETE (admin only or owner)
  if (req.method === 'DELETE') {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'postId required' });
    }

    const post = posts.find(p => p.id === String(postId));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // IDOR: Check ownership
    if (post.userId !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Cannot delete other users\' posts' });
    }

    posts = posts.filter(p => p.id !== String(postId));
    comments.delete(String(postId));
    likes.delete(String(postId));

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
