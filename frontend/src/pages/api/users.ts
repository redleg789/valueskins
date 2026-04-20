import { NextApiRequest, NextApiResponse } from 'next';
import { isDemoModeEnabled } from '@/lib/demoMode';
import { validateDemoToken } from '@/lib/server/demoAuth';

const users = [
  {
    id: 'user_123',
    name: 'Sarah Chen',
    handle: '@sarahchen',
    avatar: '👩‍🎨',
    bio: 'Digital creator | Fashion & Lifestyle | She/Her 🌍',
    followers: 248000,
    following: 156,
    engagement: 8.2,
    verified: true,
    posts: 342,
  },
  {
    id: 'user_456',
    name: 'Alex Rivers',
    handle: '@alexrivers',
    avatar: '👨‍💼',
    bio: 'Brand collaborations | Marketing | Tech enthusiast',
    followers: 512000,
    following: 234,
    engagement: 12.1,
    verified: true,
    posts: 521,
  },
  {
    id: 'user_789',
    name: 'Maya Patel',
    handle: '@mayapatel',
    avatar: '👩‍💻',
    bio: 'Software engineer turned creator | AI enthusiast',
    followers: 156000,
    following: 445,
    engagement: 6.8,
    verified: true,
    posts: 289,
  },
  {
    id: 'user_012',
    name: 'Chris Lee',
    handle: '@chrislee',
    avatar: '🎬',
    bio: 'Filmmaker | Content creator | Cinematic storytelling',
    followers: 892000,
    following: 123,
    engagement: 14.5,
    verified: true,
    posts: 678,
  },
];

const follows = new Map<string, Set<string>>(); // userId -> Set of following userIds

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action, userId, targetUserId } = req.query;
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  const demoSession = validateDemoToken(userToken);
  const currentUserId = demoSession?.sub ?? null;

  if (!isDemoModeEnabled()) {
    return res.status(403).json({ error: 'Demo API disabled' });
  }

  if (req.method === 'GET') {
    if (action === 'discover') {
      // Get all users except the current user
      const filteredUsers = users.filter(u => u.id !== currentUserId);
      return res.status(200).json(filteredUsers);
    }

    if (action === 'profile' && userId) {
      const user = users.find(u => u.id === String(userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    }

    if (action === 'me' && currentUserId) {
      const user = users.find(u => u.id === currentUserId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    }

    // Default: if no action but userId provided, return that user's profile
    if (userId && !action) {
      const user = users.find(u => u.id === String(userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  if (req.method === 'POST') {
    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (action === 'follow' && targetUserId) {
      if (!follows.has(currentUserId)) {
        follows.set(currentUserId, new Set());
      }
      follows.get(currentUserId)!.add(String(targetUserId));

      const targetUser = users.find(u => u.id === String(targetUserId));
      if (targetUser) {
        targetUser.followers += 1;
      }

      return res.status(200).json({ success: true, message: 'Following' });
    }

    if (action === 'unfollow' && targetUserId) {
      if (follows.has(currentUserId)) {
        follows.get(currentUserId)!.delete(String(targetUserId));
      }

      const targetUser = users.find(u => u.id === String(targetUserId));
      if (targetUser && targetUser.followers > 0) {
        targetUser.followers -= 1;
      }

      return res.status(200).json({ success: true, message: 'Unfollowed' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
