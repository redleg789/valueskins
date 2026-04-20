import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`/api/notifications?action=mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === 'follow') {
      router.push(`/creator/profile?id=${notification.actorId}`);
    } else if (notification.postId) {
      router.push(`/`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
      case 'reply':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      default:
        return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_type');
              router.push('/auth/login');
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block sticky top-20 h-screen">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Discover</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/creator/my-profile" className="block text-xl hover:text-blue-400">👤 My Profile</a>
          </nav>
        </div>

        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No notifications yet. Follow creators and interact with posts! 🚀</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-900/50 cursor-pointer transition border-l-4 ${
                    notification.read ? 'border-l-transparent' : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">{notification.actorAvatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{notification.actor}</span>
                        <span className="text-gray-500">{notification.message}</span>
                      </div>
                      {notification.postContent && (
                        <p className="text-gray-400 text-sm mt-2">"{notification.postContent}"</p>
                      )}
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Notification Types</h3>
            <div className="space-y-2 text-sm">
              <p>❤️ <span className="text-gray-400">Likes</span></p>
              <p>💬 <span className="text-gray-400">Comments</span></p>
              <p>👤 <span className="text-gray-400">New followers</span></p>
              <p>@ <span className="text-gray-400">Mentions</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
