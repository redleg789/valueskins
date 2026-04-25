import { NextApiRequest, NextApiResponse } from 'next';
import { isDemoModeEnabled } from '@/lib/demoMode';
import { validateDemoToken } from '@/lib/server/demoAuth';

interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'reply';
  actor: string;
  actorId: string;
  actorAvatar: string;
  postId?: string;
  postContent?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    userId: 'user_123',
    type: 'follow',
    actor: 'Alex Rivers',
    actorId: 'user_456',
    actorAvatar: '👨‍💼',
    message: 'started following you',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '2',
    userId: 'user_123',
    type: 'like',
    actor: 'Maya Patel',
    actorId: 'user_789',
    actorAvatar: '👩‍💻',
    postId: '1',
    postContent: 'Just landed a collab with Nike! 🔥',
    message: 'liked your post',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '3',
    userId: 'user_123',
    type: 'comment',
    actor: 'Chris Lee',
    actorId: 'user_012',
    actorAvatar: '🎬',
    postId: '1',
    postContent: 'Just landed a collab with Nike! 🔥',
    message: 'commented on your post',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  const demoSession = validateDemoToken(userToken);

  if (!isDemoModeEnabled()) {
    return res.status(403).json({ error: 'Demo API disabled' });
  }

  if (!demoSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = demoSession.userId;

  if (req.method === 'GET') {
    // Get notifications for current user
    const userNotifications = notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json(userNotifications);
  }

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'mark-read' && req.body.notificationId) {
      const notification = notifications.find(n => n.id === req.body.notificationId);
      if (notification) {
        notification.read = true;
      }
      return res.status(200).json({ success: true });
    }

    if (action === 'create') {
      const { type, actorId, actorName, actorAvatar, postId, postContent, message } = req.body;

      const newNotification: Notification = {
        id: String(notifications.length + 1),
        userId,
        type,
        actor: actorName,
        actorId,
        actorAvatar,
        postId,
        postContent,
        message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      notifications.push(newNotification);
      return res.status(201).json(newNotification);
    }

    if (action === 'mark-all-read') {
      notifications.forEach(n => {
        if (n.userId === userId) {
          n.read = true;
        }
      });
      return res.status(200).json({ success: true });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
