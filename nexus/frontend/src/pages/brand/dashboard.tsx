'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function BrandDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userType = localStorage.getItem('user_type');
      if (!token || userType !== 'brand') {
        router.push('/auth/login');
        return;
      }
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  const stats = [
    { label: 'Active Campaigns', value: '3', icon: 'campaign' },
    { label: 'Creators Working', value: '12', icon: 'groups' },
    { label: 'Budget Used', value: '$4,200', icon: 'account_balance_wallet' },
    { label: 'Total Reach', value: '234K', icon: 'public' },
  ];

  const creators = [
    { name: 'The Voyager', handle: '@thevoyager', followers: '12.4K', rate: '$500/post', status: 'Active' },
    { name: 'Neon Dreams', handle: '@neondreams', followers: '8.9K', rate: '$200/post', status: 'Available' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-primary hover:text-primary-dim transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span className="text-3xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-4 py-1 rounded-sm shadow-[4px_4px_0px_0px_rgba(213,0,249,0.3)] font-headline">
              Nexus
            </span>
          </div>
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
                <img alt="Brand Profile" className="w-full h-full object-cover" src="https://via.placeholder.com/48" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface">Artisan Studios</h3>
                <p className="text-xs text-primary font-label tracking-widest uppercase">Brand</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 font-label uppercase tracking-widest text-xs">
            <a className="nav-item-active" href="/brand/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="nav-item" href="/brand/opportunities">
              <span className="material-symbols-outlined">work</span>
              <span>Campaigns</span>
            </a>
            <a className="nav-item" href="/brand/discover">
              <span className="material-symbols-outlined">explore</span>
              <span>Discover</span>
            </a>
            <a className="nav-item" href="/">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Feed</span>
            </a>
            <a className="nav-item" href="/chat">
              <span className="material-symbols-outlined">chat</span>
              <span>Messages</span>
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="w-full md:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-headline font-black italic mb-8">Brand Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="card-surface p-6">
                  <span className="material-symbols-outlined text-2xl text-secondary mb-2">{stat.icon}</span>
                  <p className="text-3xl font-headline font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Creators Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline font-bold">Connected Creators</h2>
                <a href="/brand/discover" className="text-primary hover:text-primary-dim transition-colors font-headline">
                  Discover More
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creators.map((creator, index) => (
                  <div key={index} className="card-surface p-6">
                    <div className="flex items-start gap-4">
                      <div className="avatar-ring">
                        <img alt={creator.name} className="w-full h-full object-cover" src="https://via.placeholder.com/48" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-headline font-bold text-lg text-primary">{creator.name}</h3>
                        <p className="text-sm text-on-surface-variant">{creator.handle}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-secondary">{creator.followers}</span>
                          <span className="text-on-surface-variant">|</span>
                          <span className="text-secondary">{creator.rate}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-label uppercase ${creator.status === 'Active' ? 'text-secondary' : 'text-primary'}`}>
                        {creator.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="btn-secondary flex-1">Message</button>
                      <button className="btn-primary flex-1">View Profile</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-surface p-6">
                <h3 className="font-headline font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="btn-primary w-full">Create Campaign</button>
                  <button className="btn-secondary w-full">Browse Creators</button>
                </div>
              </div>
              <div className="card-surface p-6">
                <h3 className="font-headline font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span>The Voyager completed collaboration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">thumb_up</span>
                    <span>Campaign engagement +45%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">message</span>
                    <span>New proposal from Neon Dreams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}