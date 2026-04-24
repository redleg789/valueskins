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
  createdAt: string;
  phone?: string;
  portfolioUrl?: string;
  socialLinks?: { instagram?: string; youtube?: string; tiktok?: string; linkedin?: string };
  companyName?: string;
  creatorNiche?: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  mediaUrls?: string[];
}

export default function Profile() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    avatar: '',
    banner: '',
    phone: '',
    portfolioUrl: '',
  });
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [followerType, setFollowerType] = useState<'followers' | 'following'>('followers');
  const [saved, setSaved] = useState(false);

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
          setEditForm({
            name: data.name,
            bio: data.bio || '',
            avatar: data.avatar || '',
            banner: data.banner || '',
            phone: data.phone || '',
            portfolioUrl: data.portfolioUrl || '',
          });
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
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
          <span className="text-3xl font-black italic text-primary font-headline">Profile</span>
          <button onClick={() => router.push('/settings')} className="text-primary hover:text-primary-dim transition-colors">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </header>

      <div className="pt-20 pb-8">
        {user && (
          <>
            {/* Banner */}
            <div className="bg-gradient-to-b from-primary/20 to-transparent h-40 relative">
              {editForm.banner && (
                <img src={editForm.banner} alt="Banner" className="w-full h-full object-cover" />
              )}
              {isEditing && (
                <input
                  type="url"
                  value={editForm.banner}
                  onChange={(e) => setEditForm({ ...editForm, banner: e.target.value })}
                  placeholder="Banner URL"
                  className="absolute bottom-2 left-4 right-4 bg-surface-container-highest px-3 py-2 rounded text-sm border border-outline-variant/50"
                />
              )}
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                <div className="w-32 h-32 rounded-full bg-surface-container-highest border-4 border-surface overflow-hidden flex-shrink-0">
                  <img alt="Profile" className="w-full h-full object-cover" src={editForm.avatar || 'https://via.placeholder.com/128'} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-headline font-black italic text-primary">{editForm.name}</h1>
                    {user.verified && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full uppercase font-label">✓ Verified</span>}
                  </div>
                  <p className="text-on-surface-variant mb-2">@{user.handle}</p>
                  <p className="text-lg text-on-surface/90 mb-4">{editForm.bio || 'No bio yet'}</p>

                  {editForm.portfolioUrl && (
                    <p className="text-sm text-primary mb-4">
                      <a href={editForm.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Portfolio
                      </a>
                    </p>
                  )}

                  {editForm.phone && <p className="text-sm text-on-surface-variant mb-4">{editForm.phone}</p>}

                  <p className="text-xs text-on-surface-variant mb-6">Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>

                  {/* Stats */}
                  <div className="flex gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user.followers}</div>
                      <div className="text-xs text-on-surface-variant uppercase cursor-pointer hover:text-primary" onClick={() => { setShowFollowersList(true); setFollowerType('followers'); }}>
                        Followers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{user.following}</div>
                      <div className="text-xs text-on-surface-variant uppercase cursor-pointer hover:text-primary" onClick={() => { setShowFollowersList(true); setFollowerType('following'); }}>
                        Following
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{posts.length}</div>
                      <div className="text-xs text-on-surface-variant uppercase">Posts</div>
                    </div>
                  </div>

                  <button onClick={() => setIsEditing(!isEditing)} className="btn-primary">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="card-surface p-6 mb-8 space-y-4">
                  <h2 className="text-lg font-headline font-bold mb-4">Edit Profile</h2>

                  <div>
                    <label className="block text-sm font-headline mb-2">Display Name</label>
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

                  <div>
                    <label className="block text-sm font-headline mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-headline mb-2">Portfolio URL</label>
                    <input
                      type="url"
                      value={editForm.portfolioUrl}
                      onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                      className="w-full bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={handleSaveProfile} className="btn-primary flex-1">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>

                  {saved && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded px-4 py-3 text-green-100 text-sm">
                      ✓ Profile updated successfully
                    </div>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-outline-variant/20 mb-6">
                <div className="flex gap-8">
                  {['posts', 'media', 'likes', 'saved'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`py-4 px-2 font-headline font-bold transition-colors capitalize ${
                        activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">No posts yet</div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="card-surface p-6">
                        <p className="text-lg leading-relaxed mb-4">{post.content}</p>
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {post.mediaUrls.map((url, i) => (
                              <img key={i} src={url} alt="Post media" className="rounded w-full h-40 object-cover" />
                            ))}
                          </div>
                        )}
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

              {activeTab === 'media' && (
                <div className="grid grid-cols-3 gap-4">
                  {posts.filter(p => p.mediaUrls && p.mediaUrls.length > 0).length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-on-surface-variant">No media yet</div>
                  ) : (
                    posts
                      .filter(p => p.mediaUrls && p.mediaUrls.length > 0)
                      .flatMap(p => p.mediaUrls!.map(url => ({ url, postId: p.id })))
                      .map((item, i) => (
                        <img key={i} src={item.url} alt="Media" className="rounded w-full h-40 object-cover cursor-pointer hover:opacity-80" />
                      ))
                  )}
                </div>
              )}

              {activeTab === 'likes' && (
                <div className="text-center py-12 text-on-surface-variant">Liked posts appear here</div>
              )}

              {activeTab === 'saved' && (
                <div className="text-center py-12 text-on-surface-variant">Saved posts appear here</div>
              )}
            </div>

            {/* Followers Modal */}
            {showFollowersList && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-surface-container rounded-lg max-w-sm w-full mx-4 max-h-96 overflow-y-auto">
                  <div className="sticky top-0 flex justify-between items-center p-6 bg-surface-container-high border-b border-outline-variant/20">
                    <h3 className="text-lg font-headline font-bold">{followerType === 'followers' ? 'Followers' : 'Following'}</h3>
                    <button onClick={() => setShowFollowersList(false)} className="text-primary text-2xl leading-none">×</button>
                  </div>
                  <div className="p-6 space-y-4">
                    {followerType === 'followers' ? (
                      <div className="text-center text-on-surface-variant">
                        <p>Followers list will load from database</p>
                        <p className="text-sm">{user.followers} followers total</p>
                      </div>
                    ) : (
                      <div className="text-center text-on-surface-variant">
                        <p>Following list will load from database</p>
                        <p className="text-sm">{user.following} following total</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
