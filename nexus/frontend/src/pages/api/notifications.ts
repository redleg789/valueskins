import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from './auth';

let notifications = new Map<string, any[]>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = validateToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const userNotifs = notifications.get(user.userId) || [];
    return res.status(200).json(userNotifs);
  }

  if (req.method === 'POST') {
    const { action, notificationId } = req.body;

    if (action === 'read' && notificationId) {
      const userNotifs = notifications.get(user.userId) || [];
      const notif = userNotifs.find((n) => n.id === notificationId);

      if (!notif) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      notif.read = true;
      return res.status(200).json(notif);
    }

    if (action === 'delete' && notificationId) {
      const userNotifs = notifications.get(user.userId) || [];
      const filtered = userNotifs.filter((n) => n.id !== notificationId);
      notifications.set(user.userId, filtered);

      return res.status(200).json({ success: true });
    }

    res.status(400).json({ error: 'Invalid action' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
