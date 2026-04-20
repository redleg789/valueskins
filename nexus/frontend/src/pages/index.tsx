import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CommentsModal from '@/components/CommentsModal';
import { MAX_FEED_POSTS_PER_PAGE } from '@/lib/guards/addictiveDesign';
import { checkContent, getWarningComponent } from '@/lib/contentBlocker';

interface Post {
  id: string;
  userId: string;
  author: string;
  handle: string;
  avatar: string;
  verified: boolean;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
}

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [contentWarning, setContentWarning] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('auth_token');
    const userType = localStorage.getItem('user_type');

    if (!token || !userType) {
      router.push('/auth/login');
      return;
    }

    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    // Check content before allowing upload
    const contentCheck = checkContent(newPost);
    if (contentCheck.blocked) {
      setContentWarning(getWarningComponent(newPost));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (response.ok) {
        const post = await response.json();
        setPosts([post, ...posts]);
        setNewPost('');
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    const token = localStorage.getItem('auth_token');
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const action = post.liked ? 'unlike' : 'like';
      const response = await fetch(`/api/posts?action=${action}&postId=${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, liked: !p.liked, likes: data.likes }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nexus</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        {/* Sidebar */}
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block sticky top-20 h-screen">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/deals-feed" className="block text-xl hover:text-blue-400">💼 Deals</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Discover</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/creator-profile?id=me" className="block text-xl hover:text-blue-400">👤 My Profile</a>
          </nav>
        </div>

        {/* Feed */}
        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          {/* Compose Post */}
          <div className="border-b border-gray-700 p-4">
            {contentWarning && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm font-bold">{contentWarning.message}</p>
                {contentWarning.blockedTerms.length > 0 && (
                  <p className="text-red-300 text-xs mt-1">Blocked terms: {contentWarning.blockedTerms.slice(0, 3).join(', ')}</p>
                )}
              </div>
            )}
            <div className="flex gap-4">
              <div className="text-2xl">👤</div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => {
                    setNewPost(e.target.value);
                    setContentWarning(null);
                  }}
                  placeholder="What's happening?!"
                  className="w-full bg-transparent text-xl text-white placeholder-gray-500 resize-none focus:outline-none"
                  rows={3}
                  maxLength={280}
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-500 text-sm">{newPost.length}/280</span>
                  <button
                    onClick={handleCreatePost}
                    disabled={loading || !newPost.trim() || contentWarning}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-8 py-2 rounded-full transition"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No posts yet. Be the first to post! 🚀</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="border-b border-gray-700 p-4 hover:bg-gray-900/50 cursor-pointer transition">
                <div className="flex gap-3">
                  <div className="text-3xl">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold hover:underline">{post.author}</span>
                      {post.verified && <span>✓</span>}
                      <span className="text-gray-500">{post.handle}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white mt-2 text-base leading-normal">{post.content}</p>

                    {/* Engagement */}
                    <div className="flex justify-between text-gray-500 mt-3 max-w-md text-sm">
                      <button
                        onClick={() => setSelectedPostForComments(post.id)}
                        className="hover:text-blue-400 flex items-center gap-2"
                      >
                        💬 {post.comments}
                      </button>
                      <button className="hover:text-green-400 flex items-center gap-2">
                        🔄 {post.shares}
                      </button>
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 ${post.liked ? 'text-red-500' : 'hover:text-red-400'}`}
                      >
                        {post.liked ? '❤️' : '🤍'} {post.likes}
                      </button>
                      <button className="hover:text-blue-400">📤</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <input
              type="text"
              placeholder="Search Nexus"
              className="w-full bg-gray-800 text-white rounded-full px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">What's happening</h2>
            <div className="space-y-4">
              {[
                { category: 'Opportunities', trend: '#SafariCollab', posts: '45.2K' },
                { category: 'Trending', trend: '#CreatorLife', posts: '123K' },
                { category: 'Featured Brands', trend: 'Nike Collab', posts: 'See opportunities' },
              ].map((item, i) => (
                <div key={i} className="hover:bg-gray-800 p-2 rounded cursor-pointer">
                  <div className="text-gray-500 text-sm">{item.category}</div>
                  <div className="font-bold">{item.trend}</div>
                  <div className="text-gray-500 text-sm">{item.posts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CommentsModal
        postId={selectedPostForComments || ''}
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
}
