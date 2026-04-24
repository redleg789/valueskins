'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function Profile() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [saved, setSaved] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', avatar: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setEditForm({ name: data.name, bio: data.bio || '', avatar: data.avatar || '' });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    const fetchUserPosts = async () => {
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

    fetchProfile();
    fetchUserPosts();
    setReady(true);
  }, [router]);

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updated = await response.json();
        setUser({ ...user!, ...updated });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
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
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <button onClick={() => router.push('/')} className="text-primary hover:text-primary-dim transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <span className="text-3xl font-black italic text-primary font-headline">Nexus</span>
          <button onClick={() => router.push('/settings')} className="text-primary hover:text-primary-dim transition-colors">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </header>

      <div className="pt-20 pb-8">
        {user && (
          <>
            <div className="bg-gradient-to-b from-primary/20 to-transparent h-32"></div>

            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
              <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                <div className="w-32 h-32 rounded-full bg-surface-container-highest border-4 border-surface overflow-hidden flex-shrink-0">
                  <img alt="Profile" className="w-full h-full object-cover" src={user.avatar || 'https://via.placeholder.com/128'} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-headline font-black italic text-primary">{user.name}</h1>
                    {user.verified && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full uppercase font-label">Verified</span>}
                  </div>
                  <p className="text-on-surface-variant mb-4">@{user.handle}</p>
                  <p className="text-lg text-on-surface/90 mb-6">{user.bio || 'No bio yet'}</p>

                  <div className="flex gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user.followers}</div>
                      <div className="text-xs text-on-surface-variant uppercase">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user.following}</div>
                      <div className="text-xs text-on-surface-variant uppercase">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user.posts}</div>
                      <div className="text-xs text-on-surface-variant uppercase">Posts</div>
                    </div>
                  </div>

                  <button onClick={() => setIsEditing(!isEditing)} className="btn-primary">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="card-surface p-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-headline mb-2">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-headline mb-2">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0 resize-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-headline mb-2">Avatar URL</label>
                      <input
                        type="url"
                        value={editForm.avatar}
                        onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        className="w-full bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0"
                      />
                    </div>
                    <button onClick={handleSaveProfile} className="btn-secondary w-full">Save Changes</button>
                  </div>
                </div>
              )}

              <div className="border-b border-outline-variant/20 mb-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`py-4 px-2 font-headline font-bold transition-colors ${
                      activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`py-4 px-2 font-headline font-bold transition-colors ${
                      activeTab === 'saved' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    Saved
                  </button>
                </div>
              </div>

              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">No posts yet</div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="card-surface p-6">
                        <p className="text-lg leading-relaxed mb-4">{post.content}</p>
                        <div className="flex gap-6 text-sm text-on-surface-variant">
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">favorite</span>
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">chat_bubble</span>
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="space-y-6">
                  {saved.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">No saved posts yet</div>
                  ) : (
                    saved.map(post => (
                      <div key={post.id} className="card-surface p-6">
                        <p className="text-lg leading-relaxed mb-4">{post.content}</p>
                        <div className="flex gap-6 text-sm text-on-surface-variant">
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">favorite</span>
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">chat_bubble</span>
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
