import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getDemoToken } from '@/lib/demoSession';

interface User {
  id: string;
  name: string;
  handle: string;
  followers: number;
  following: number;
  avatar: string;
  bio: string;
  verified: boolean;
  engagement: number;
  posts: number;
}

export default function Discover() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getDemoToken();
      const response = await fetch('/api/users?action=discover', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    const token = getDemoToken();
    try {
      const response = await fetch(`/api/users?action=follow&targetUserId=${targetUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFollowing(new Set([...following, targetUserId]));
        setUsers(users.map(u =>
          u.id === targetUserId
            ? { ...u, followers: u.followers + 1 }
            : u
        ));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    const token = getDemoToken();
    try {
      const response = await fetch(`/api/users?action=unfollow&targetUserId=${targetUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newFollowing = new Set(following);
        newFollowing.delete(targetUserId);
        setFollowing(newFollowing);
        setUsers(users.map(u =>
          u.id === targetUserId
            ? { ...u, followers: Math.max(0, u.followers - 1) }
            : u
        ));
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Discover</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Discover</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/creator/my-profile" className="block text-xl hover:text-blue-400">👤 My Profile</a>
          </nav>
        </div>

        <div className="col-span-12 lg:col-span-6 border-r border-gray-700 p-4">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search creators, brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-full px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading creators...</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50 cursor-pointer transition"
                  onClick={() => router.push(`/creator/profile?id=${user.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-4xl">{user.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold hover:underline">{user.name}</h3>
                          {user.verified && <span>✓</span>}
                        </div>
                        <p className="text-gray-500">{user.handle}</p>
                        <p className="text-gray-500 text-sm">{user.followers.toLocaleString()} followers · {user.engagement.toFixed(1)}% engagement</p>
                        <p className="text-gray-400 text-sm mt-1">{user.bio}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (following.has(user.id)) {
                        handleUnfollow(user.id);
                      } else {
                        handleFollow(user.id);
                      }
                    }}
                    className={`w-full py-2 rounded-full font-bold text-sm transition ${
                      following.has(user.id)
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {following.has(user.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Trending Niches</h3>
            <div className="space-y-2">
              {['#Fashion', '#Tech', '#Lifestyle', '#Business', '#Travel'].map(tag => (
                <p key={tag} className="hover:text-blue-400 cursor-pointer text-sm">{tag}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
