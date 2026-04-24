'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreatorDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userType = localStorage.getItem('user_type');
      if (!token || userType !== 'creator') {
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
    { label: 'Followers', value: '12.4K', icon: 'group' },
    { label: 'Views', value: '89.2K', icon: 'visibility' },
    { label: 'Engagement', value: '4.8%', icon: 'trending_up' },
    { label: 'Earnings', value: '$2,340', icon: 'payments' },
  ];

  const opportunities = [
    { brand: 'Artisan Studios', type: 'Paid Collab', budget: '$500 - $1,000', deadline: '2 days left' },
    { brand: 'Neon Gallery', type: 'Art Exchange', budget: '$200', deadline: '5 days left' },
    { brand: 'Creative Co', type: 'Sponsorship', budget: '$1,500 - $3,000', deadline: '1 week left' },
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
                <img alt="User Profile" className="w-full h-full object-cover" src="https://via.placeholder.com/48" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface">The Voyager</h3>
                <p className="text-xs text-primary font-label tracking-widest uppercase">Creator</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 font-label uppercase tracking-widest text-xs">
            <a className="nav-item-active" href="/creator/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="nav-item" href="/creator/opportunities">
              <span className="material-symbols-outlined">work</span>
              <span>Opportunities</span>
            </a>
            <a className="nav-item" href="/creator/analytics">
              <span className="material-symbols-outlined">analytics</span>
              <span>Analytics</span>
            </a>
            <a className="nav-item" href="/">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Feed</span>
            </a>
            <a className="nav-item" href="/wall">
              <span className="material-symbols-outlined">book</span>
              <span>My Grimoire</span>
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="w-full md:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-headline font-black italic mb-8">Creator Dashboard</h1>

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

            {/* Opportunities Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline font-bold">Available Opportunities</h2>
                <a href="/creator/opportunities" className="text-primary hover:text-primary-dim transition-colors font-headline">
                  View All
                </a>
              </div>

              <div className="space-y-4">
                {opportunities.map((opp, index) => (
                  <div key={index} className="card-surface p-6 hover:bg-surface-container-high transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline font-bold text-lg text-primary">{opp.brand}</h3>
                        <p className="text-sm text-on-surface-variant mt-1">{opp.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-headline font-bold text-secondary">{opp.budget}</p>
                        <p className="text-xs text-error mt-1">{opp.deadline}</p>
                      </div>
                    </div>
                    <button className="btn-secondary mt-4 w-full">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-surface p-6">
                <h3 className="font-headline font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="btn-primary w-full">Update Profile</button>
                  <button className="btn-secondary w-full">Create New Post</button>
                </div>
              </div>
              <div className="card-surface p-6">
                <h3 className="font-headline font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">favorite</span>
                    <span>Your post received 50 new likes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">person_add</span>
                    <span>+23 new followers this week</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">comment</span>
                    <span>Artisan Studios commented on your post</span>
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