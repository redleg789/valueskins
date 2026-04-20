import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { clearDemoSession, getDemoToken } from '@/lib/demoSession';

interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
  engagement: number;
  posts: number;
}

interface Post {
  id: string;
  userId: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
}

export default function CreatorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUserId('user_123');

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const token = getDemoToken();
      const response = await fetch(`/api/users?action=profile&userId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const userData = await response.json();
      setUser(userData);

      // Fetch user's posts
      const postsResponse = await fetch('/api/posts');
      const allPosts = await postsResponse.json();
      const creatorPosts = allPosts.filter((p: Post) => p.userId === id);
      setUserPosts(creatorPosts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const token = getDemoToken();
      const response = await fetch(`/api/users?action=follow&targetUserId=${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFollowing(true);
        if (user) {
          setUser({ ...user, followers: user.followers + 1 });
        }
      }
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = getDemoToken();
      const response = await fetch(`/api/users?action=unfollow&targetUserId=${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFollowing(false);
        if (user) {
          setUser({ ...user, followers: Math.max(0, user.followers - 1) });
        }
      }
    } catch (error) {
      console.error('Failed to unfollow:', error);
    }
  };

  const isOwnProfile = currentUserId === id;

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">User not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">← Back</button>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <button
            onClick={() => {
              clearDemoSession();
              router.push('/auth/login');
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Discover</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/creator/profile" className="block text-xl hover:text-blue-400">👤 My Profile</a>
          </nav>
        </div>

        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          <div className="border-b border-gray-700">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-6xl">
              {user.avatar}
            </div>
            <div className="p-4">
              <div className="text-5xl mb-4 -mt-16">{user.avatar}</div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {user.verified && <span>✓</span>}
              </div>
              <p className="text-gray-500">{user.handle}</p>
              <p className="text-white mt-2">{user.bio}</p>
              <div className="flex gap-4 mt-4 text-sm">
                <span><strong className="text-white text-lg">{user.followers.toLocaleString()}</strong> <span className="text-gray-500">followers</span></span>
                <span><strong className="text-white text-lg">{user.following}</strong> <span className="text-gray-500">following</span></span>
                <span><strong className="text-white text-lg">{user.engagement.toFixed(1)}%</strong> <span className="text-gray-500">engagement</span></span>
              </div>
            </div>
          </div>

          {userPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="border-b border-gray-700 p-4">
              <h3 className="font-bold mb-3">Posts</h3>
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div key={post.id} className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50">
                    <p className="text-white">{post.content}</p>
                    <div className="mt-3 flex gap-6 text-gray-500 text-sm">
                      <button>💬</button>
                      <button>🔄</button>
                      <button>
                        {post.liked ? '❤️' : '🤍'} {post.likes}
                      </button>
                      <button>📤</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            {isOwnProfile ? (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
                Edit Profile
              </button>
            ) : (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`w-full font-bold py-3 rounded-xl transition ${
                  isFollowing
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Creator Stats</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Total Posts</p>
                <p className="font-bold">{user.posts}</p>
              </div>
              <div>
                <p className="text-gray-500">Engagement Rate</p>
                <p className="font-bold">{user.engagement.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Followers/Following</p>
                <p className="font-bold">{(user.followers / user.following).toFixed(2)}x</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
