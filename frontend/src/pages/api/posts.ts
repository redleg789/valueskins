import { NextApiRequest, NextApiResponse } from 'next';

// Mock database for MVP
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
    liked: false,
  },
  {
    id: '2',
    userId: 'user_456',
    author: 'Alex Rivers',
    handle: '@alexrivers',
    avatar: '👨‍💼',
    verified: true,
    content: 'Looking for authentic creators for Q2 campaigns. 50K+ followers, genuine engagement required.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 567,
    comments: 234,
    shares: 89,
    liked: false,
  },
];

let likes = new Map<string, Set<string>>(); // postId -> Set of userIds who liked

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

let comments = new Map<string, Comment[]>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  const { action, postId } = req.query;

  if (req.method === 'GET') {
    if (action === 'feed') {
      // Get posts user follows (for now, return all)
      return res.status(200).json(posts);
    }

    // Get all posts (default feed)
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    if (!userToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (action === 'like' && postId) {
      const post = posts.find(p => p.id === String(postId));
      if (!post) return res.status(404).json({ error: 'Post not found' });

      if (!likes.has(String(postId))) {
        likes.set(String(postId), new Set());
      }

      const postLikes = likes.get(String(postId))!;
      if (!postLikes.has(userToken)) {
        postLikes.add(userToken);
        post.likes += 1;
      }

      return res.status(200).json({ success: true, likes: post.likes });
    }

    if (action === 'unlike' && postId) {
      const post = posts.find(p => p.id === String(postId));
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const postLikes = likes.get(String(postId));
      if (postLikes && postLikes.has(userToken)) {
        postLikes.delete(userToken);
        post.likes = Math.max(0, post.likes - 1);
      }

      return res.status(200).json({ success: true, likes: post.likes });
    }

    if (action === 'comments' && postId) {
      // Get comments for a post
      const postComments = comments.get(String(postId)) || [];
      return res.status(200).json(postComments);
    }

    if (action === 'comment' && postId) {
      const { text } = req.body;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Comment cannot be empty' });
      }

      if (text.length > 500) {
        return res.status(400).json({ error: 'Comment too long (max 500 chars)' });
      }

      const post = posts.find(p => p.id === String(postId));
      if (!post) return res.status(404).json({ error: 'Post not found' });

      if (!comments.has(String(postId))) {
        comments.set(String(postId), []);
      }

      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        postId: String(postId),
        userId: userToken,
        userName: 'You',
        userHandle: '@yourhandle',
        userAvatar: '👤',
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
      };

      const postComments = comments.get(String(postId))!;
      postComments.push(newComment);

      post.comments += 1;
      return res.status(201).json(newComment);
    }

    // Create new post
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    if (content.length > 280) {
      return res.status(400).json({ error: 'Content too long (max 280 chars)' });
    }

    const newPost = {
      id: String(posts.length + 1),
      userId: userToken,
      author: 'Your Name',
      handle: '@yourhandle',
      avatar: '👤',
      verified: false,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
    };

    posts.unshift(newPost);
    return res.status(201).json(newPost);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
