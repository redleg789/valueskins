'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  saves: number;
  hashtags: string[];
  liked: boolean;
}

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const storedUserType = localStorage.getItem('user_type');
        if (!token || !storedUserType) {
          // Redirect to login if not authenticated
          router.push('/auth/login');
          return false;
        }
        return true;
      }
      return false;
    };

    if (!checkAuth()) {
      return;
    }

    // Fetch initial posts
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/posts', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };

    fetchPosts();
    setReady(true);

    // Connect to real-time feed
    const token = localStorage.getItem('auth_token');
    const eventSource = new EventSource(`/api/realtime/feed?token=${token}`);

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_post') {
          setPosts(prev => [data.post, ...prev]);
        }
      } catch (error) {
        console.error('Failed to parse event:', error);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const extractHashtags = (content: string): string[] => {
    const matches = content.match(/#[\w]+/g);
    return matches ? matches.map(t => t.toLowerCase()) : [];
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newPost }),
      });
      if (response.ok) {
        const post = await response.json();
        const postsWithHashtag = { ...post, hashtags: extractHashtags(newPost) };
        setPosts([postsWithHashtag, ...posts]);
        setNewPost('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    const token = localStorage.getItem('auth_token');
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const action = post.liked ? 'unlike' : 'like';
    try {
      const response = await fetch(`/api/posts?action=${action}&postId=${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: data.likes } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <span className="text-3xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-4 py-1 rounded-sm shadow-[4px_4px_0px_0px_rgba(213,0,249,0.3)] font-headline">
            Nexus
          </span>
          <div className="flex items-center gap-6 text-primary">
            <button className="hover:text-primary hover:bg-zinc-800/50 transition-all p-2 rounded-full">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>
            <button onClick={() => router.push('/profile')} className="hover:text-primary hover:bg-zinc-800/50 transition-all p-2 rounded-full">
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-20">
        {/* Side Navigation */}
        <nav className="hidden md:flex flex-col h-[calc(100vh-5rem)] w-64 bg-surface border-r border-zinc-800/20 fixed left-0 py-8 gap-6 z-40 overflow-y-auto">
          <div className="px-6 mb-4">
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="avatar-ring">
                <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClSH9Q7nncb6hIbYUZjvavwuAtTrOqvcMh1rAU_bc_EBBOCR0Nbjj6GfUAT2CPITYWbXop1eYqf24Xjqakqa3H_LUAwxtZoFCNT51e7pZhQqYIKaLjkgsGhDibrrYlOA03kM4AtoXG-cS3CDzpnVsFEXvG5TQpFj17eaJ1Hnn3QALMZWU9mCZyGu3tzamU5ZNi-LLeVmRYtXF0QwaFQCAQZtcq-Lk8VMKSApLxH7cKBonKEc174msDiUU6e2QjaQG4jdb921IsZiio" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface">The Voyager</h3>
                <p className="text-xs text-primary font-label tracking-widest uppercase">Digital Alchemist</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 font-label uppercase tracking-widest text-xs">
            <a className="flex items-center gap-4 text-primary bg-surface-container-high -rotate-1 py-3 px-6 shadow-[-4px_4px_0px_0px_rgba(213,0,249,0.3)]" href="/">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Feed</span>
            </a>
            <a className="nav-item" href="/discover">
              <span className="material-symbols-outlined">explore</span>
              <span>Discover</span>
            </a>
            <a className="nav-item" href="/chat">
              <span className="material-symbols-outlined">chat_bubble</span>
              <span>Messages</span>
            </a>
            <a className="nav-item" href="/wall">
              <span className="material-symbols-outlined">book</span>
              <span>Grimoire</span>
            </a>
            <a className="nav-item" href="/opportunities">
              <span className="material-symbols-outlined">work</span>
              <span>Opportunities</span>
            </a>
            <a className="nav-item" href="/settings">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </a>
          </div>
          
          <div className="mt-auto px-6">
            <button className="btn-primary w-full">
              New Entry
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="w-full md:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Composer Section */}
            <section className="card-surface p-6 md:p-8 relative mt-4">
              <div className="absolute -top-3 -left-2 bg-secondary-container text-on-secondary-container px-3 py-1 font-headline italic font-bold text-sm marker-bg rotate-2">
                Jot down thoughts...
              </div>
              <textarea
                className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant/50 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant font-body resize-none py-4 mt-2"
                placeholder="What is resonating in the void?"
                rows={3}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-4 text-secondary">
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">image</span>
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">mic</span>
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">location_on</span>
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={loading || !newPost.trim()}
                  className="btn-secondary"
                >
                  {loading ? 'Scribing...' : 'Scribe'}
                </button>
              </div>
            </section>

            {/* Trending Section */}
            <div className="relative inline-block mt-8 mb-4">
              <div className="absolute inset-0 bg-primary-container marker-bg -rotate-2 scale-110 opacity-80"></div>
              <h2 className="relative text-3xl font-headline font-black italic text-on-primary-container px-4 py-1">
                Trending Scribbles
              </h2>
            </div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <p>No posts yet. Be the first to scribe!</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <article
                  key={post.id}
                  className={index === 0 ? 'card-glow' : 'card-surface'}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                        <img alt="Avatar" className="w-full h-full object-cover" src={post.avatar || 'https://via.placeholder.com/40'} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-primary">{post.author}</h4>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(post.createdAt).toLocaleDateString()}
                          {post.verified && <span className="ml-1">✓</span>}
                        </p>
                      </div>
                    </div>
                    <button className="text-outline-variant hover:text-primary">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-lg leading-relaxed text-on-surface/90 font-body mb-4">
                      {post.content}
                    </p>
                    
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.hashtags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag-secondary">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-6 text-on-surface-variant font-label text-sm border-t border-outline-variant/20 pt-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 hover:text-secondary transition-colors group ${post.liked ? 'text-secondary' : ''}`}
                    >
                      <span className="material-symbols-outlined group-hover:-translate-y-1 transition-transform">
                        favorite
                      </span>
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => { setSelectedPostId(post.id); setShowComments(true); }}
                      className="flex items-center gap-2 hover:text-secondary transition-colors group"
                    >
                      <span className="material-symbols-outlined group-hover:-translate-y-1 transition-transform">chat_bubble</span>
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-secondary transition-colors group ml-auto">
                      <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">share</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Comments Modal */}
      {showComments && selectedPostId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowComments(false)}>
          <div className="bg-black border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-outline-variant p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Comments</h2>
              <button onClick={() => setShowComments(false)} className="text-zinc-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-zinc-500 text-center">Comments feature coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}