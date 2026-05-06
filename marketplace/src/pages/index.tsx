'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const type = typeof window !== 'undefined' ? localStorage.getItem('user_type') : null;

    if (!token) {
      router.push('/auth/login');
      return;
    }

    setUserType(type || 'CREATOR');
    setReady(true);
  }, [router]);

  if (!ready) return <div className="min-h-screen bg-surface" />;

  const isDarkMode = true;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-surface text-on-surface' : 'bg-white text-black'}`}>
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <h1 className="text-2xl font-bold">ValueSkins Marketplace</h1>
          <button onClick={() => { localStorage.clear(); router.push('/auth/login'); }} className="px-4 py-2 bg-red-600 rounded-lg">
            Logout
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto">
        {userType === 'CREATOR' ? (
          <div>
            <h2 className="text-3xl font-bold mb-8">Creator Dashboard</h2>
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/20">
                <p className="text-sm text-outline mb-2">Active Deals</p>
                <p className="text-4xl font-bold">0</p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/20">
                <p className="text-sm text-outline mb-2">Total Earned</p>
                <p className="text-4xl font-bold">$0</p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/20">
                <p className="text-sm text-outline mb-2">Credential Status</p>
                <p className="text-sm font-semibold text-warning">Pending</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/deal-board')}
              className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90"
            >
              Browse Opportunities
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-8">Brand Dashboard</h2>
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/20">
                <p className="text-sm text-outline mb-2">Active Campaigns</p>
                <p className="text-4xl font-bold">0</p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/20">
                <p className="text-sm text-outline mb-2">Total Spent</p>
                <p className="text-4xl font-bold">$0</p>
              </div>
              <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/20">
                <p className="text-sm text-outline mb-2">Creators Contacted</p>
                <p className="text-4xl font-bold">0</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/deals/create')}
              className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90"
            >
              Post a Campaign
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
