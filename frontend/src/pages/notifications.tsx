import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchNotifications(token);
  }, []);

  const fetchNotifications = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(
        notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-50 border-blue-200';
      case 'deal_accepted':
        return 'bg-green-50 border-green-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      case 'deal_completed':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 mb-6">← Back</button>

        <h1 className="text-3xl font-bold mb-8">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id);
                  if (notif.action_url) router.push(notif.action_url);
                }}
                className={`border rounded-lg p-4 cursor-pointer transition ${getNotificationColor(notif.type)} ${
                  notif.read ? 'opacity-60' : 'font-semibold'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-sm text-gray-700">{notif.message}</p>
                  </div>
                  {!notif.read && <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>}
                </div>
                <p className="text-xs text-gray-500 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
