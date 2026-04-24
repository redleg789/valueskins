'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Discover() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'creators' | 'brands' | 'trending'>('creators');
  const [creators, setCreators] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    // Fetch creators
    const fetchCreators = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/discover/creators', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCreators(data.creators || []);
        }
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      }
    };

    // Fetch brands
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/discover/brands', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setBrands(data.brands || []);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };

    // Fetch trending
    const fetchTrending = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/discover/trending', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTrending(data.trending || []);
        }
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      }
    };

    fetchCreators();
    fetchBrands();
    fetchTrending();

    // Connect to real-time trending
    const token = localStorage.getItem('auth_token');
    const eventSource = new EventSource(`/api/realtime/trending?token=${token}`);

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trending_hashtags') {
          setTrending(data.trending);
        } else if (data.type === 'trending_creators') {
          setCreators(data.creators);
        }
      } catch (error) {
        console.error('Failed to parse trending event:', error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

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
            <a className="nav-item-active" href="/discover">
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
            <a className="nav-item" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="w-full md:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-headline font-black italic mb-8">Discover</h1>

            {/* Search Bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="Search creators, brands, or hashtags..."
                className="w-full bg-surface-container px-6 py-4 pl-14 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0 text-lg"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">search</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-outline-variant pb-4">
              <button
                onClick={() => setActiveTab('creators')}
                className={`px-6 py-2 font-headline font-bold transition-colors ${activeTab === 'creators' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Creators
              </button>
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-6 py-2 font-headline font-bold transition-colors ${activeTab === 'brands' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Brands
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-6 py-2 font-headline font-bold transition-colors ${activeTab === 'trending' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Trending
              </button>
            </div>

            {/* Content */}
            {activeTab === 'creators' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creators.map((creator, index) => (
                  <div key={index} className="card-surface p-6 text-center hover:bg-surface-container-high transition-colors cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-surface-container-highest overflow-hidden mx-auto mb-4">
                      <img alt={creator.name} className="w-full h-full object-cover" src={creator.avatar} />
                    </div>
                    <h3 className="font-headline font-bold text-primary mb-1">{creator.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-2">{creator.handle}</p>
                    <p className="text-xs font-label uppercase tracking-widest text-secondary mb-3">{creator.niche}</p>
                    <p className="text-sm text-on-surface-variant">{creator.followers} followers</p>
                    <button className="btn-secondary w-full mt-4">Follow</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'brands' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {brands.map((brand, index) => (
                  <div key={index} className="card-surface p-6 text-center hover:bg-surface-container-high transition-colors cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-surface-container-highest overflow-hidden mx-auto mb-4">
                      <img alt={brand.name} className="w-full h-full object-cover" src={brand.avatar} />
                    </div>
                    <h3 className="font-headline font-bold text-primary mb-1">{brand.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-2">{brand.handle}</p>
                    <p className="text-xs font-label uppercase tracking-widest text-secondary mb-3">{brand.type}</p>
                    <p className="text-sm text-on-surface-variant">{brand.followers} followers</p>
                    <button className="btn-secondary w-full mt-4">Connect</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trending' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trending.map((tag, index) => (
                  <div key={index} className="card-surface p-6 hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-between">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-primary mb-1">{tag.title}</h3>
                      <p className="text-sm text-on-surface-variant">{tag.posts} posts</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-secondary">trending_up</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}