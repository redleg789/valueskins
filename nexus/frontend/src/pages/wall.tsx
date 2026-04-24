'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface GrimoireEntry {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  type: string;
  likes: number;
  views: number;
}

export default function Wall() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<GrimoireEntry[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    // Fetch grimoire entries
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/grimoire', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      }
    };

    fetchProfile();
    fetchEntries();
    setReady(true);
  }, [router]);

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
            <button className="hover:text-primary hover:bg-zinc-800/50 transition-all p-2 rounded-full">
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Side Navigation */}
        <nav className="hidden md:flex flex-col h-[calc(100vh-5rem)] w-64 bg-surface border-r border-zinc-800/20 fixed left-0 py-8 gap-6 z-40 overflow-y-auto">
          <div className="px-6 mb-4">
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="avatar-ring">
                <img alt="User Profile" className="w-full h-full object-cover" src="https://via.placeholder.com/48" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface">The Voyager</h3>
                <p className="text-xs text-primary font-label tracking-widest uppercase">Digital Alchemist</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 font-label uppercase tracking-widest text-xs">
            <a className="nav-item" href="/">
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
            <a className="nav-item-active" href="/wall">
              <span className="material-symbols-outlined">book</span>
              <span>Grimoire</span>
            </a>
            <a className="nav-item" href="#">
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
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="card-surface p-8 mb-8 relative overflow-hidden">
              <div className="absolute -top-3 -right-3 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-surface-container-highest overflow-hidden border-4 border-primary/30">
                    <img alt="Profile" className="w-full h-full object-cover" src={userProfile?.avatar || 'https://via.placeholder.com/96'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-headline font-black italic text-primary">{userProfile?.name || 'Loading...'}</h1>
                      {userProfile?.verified && <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full font-label uppercase tracking-widest">Verified</span>}
                    </div>
                    <p className="text-sm text-on-surface-variant mb-4">@{userProfile?.handle || 'user'}</p>
                    <p className="text-lg text-on-surface/90 mb-4">
                      {userProfile?.bio || 'No bio yet'}
                    </p>
                    <div className="flex gap-6 text-sm">
                      <span><strong className="text-primary">{userProfile?.followers || 0}</strong> Followers</span>
                      <span><strong className="text-primary">{userProfile?.following || 0}</strong> Following</span>
                      <span><strong className="text-primary">{entries.length}</strong> Entries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Entry Banner */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-primary-container marker-bg -rotate-2 scale-110 opacity-80"></div>
              <h2 className="relative text-3xl font-headline font-black italic text-on-primary-container px-4 py-2">
                My Entries
              </h2>
            </div>

            {/* Entries Grid */}
            <div className="space-y-6">
              {entries.map((entry) => (
                <article key={entry.id} className="card-surface p-6 hover:bg-surface-container-high transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-label uppercase tracking-widest text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">
                          {entry.type}
                        </span>
                        <span className="text-xs text-on-surface-variant">{entry.date}</span>
                      </div>
                      <h3 className="text-xl font-headline font-bold text-primary group-hover:text-primary-dim transition-colors mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-on-surface-variant mb-4">{entry.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-secondary">favorite</span>
                          {entry.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-secondary">visibility</span>
                          1.2K
                        </span>
                      </div>
                    </div>
                    <button className="text-outline-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}