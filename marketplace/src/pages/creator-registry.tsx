'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  niche: string;
  audience: number;
  rating: number;
  platforms: string[];
  avgRate: number;
  completedDeals: number;
  credentialStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
}

export default function CreatorRegistry() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [niche, setNiche] = useState('all');
  const [audienceMin, setAudienceMin] = useState(0);
  const [ratingMin, setRatingMin] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch creators from ValueSkins
    const fetchCreators = async () => {
      try {
        const response = await fetch('/api/v1/creators?credential=VERIFIED', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCreators(data.creators || []);
          setFilteredCreators(data.creators || []);
        }
      } catch (error) {
        // Demo creators
        const demoCreators = [
          { id: '1', name: 'Alex Chen', handle: '@techreviewsalmost', avatar: '', niche: 'Tech', audience: 245000, rating: 4.8, platforms: ['YouTube', 'TikTok'], avgRate: 2500, completedDeals: 12, credentialStatus: 'VERIFIED' as const },
          { id: '2', name: 'Sarah Fitness', handle: '@sarahfitlife', avatar: '', niche: 'Fitness', audience: 128000, rating: 4.7, platforms: ['Instagram', 'TikTok'], avgRate: 1800, completedDeals: 8, credentialStatus: 'VERIFIED' as const },
          { id: '3', name: 'Marcus Beauty', handle: '@beautybeatsmarcus', avatar: '', niche: 'Beauty', audience: 456000, rating: 4.9, platforms: ['Instagram', 'YouTube'], avgRate: 3500, completedDeals: 24, credentialStatus: 'VERIFIED' as const },
          { id: '4', name: 'Priya Fashion', handle: '@piyastyle', avatar: '', niche: 'Fashion', audience: 178000, rating: 4.6, platforms: ['Instagram', 'TikTok'], avgRate: 2200, completedDeals: 15, credentialStatus: 'VERIFIED' as const },
          { id: '5', name: 'Jordan Gaming', handle: '@jordanplays', avatar: '', niche: 'Gaming', audience: 512000, rating: 4.5, platforms: ['Twitch', 'YouTube'], avgRate: 4000, completedDeals: 9, credentialStatus: 'VERIFIED' as const },
        ];
        setCreators(demoCreators);
        setFilteredCreators(demoCreators);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [router]);

  useEffect(() => {
    let filtered = creators;
    if (niche !== 'all') {
      filtered = filtered.filter(c => c.niche === niche);
    }
    if (audienceMin > 0) {
      filtered = filtered.filter(c => c.audience >= audienceMin);
    }
    if (ratingMin > 0) {
      filtered = filtered.filter(c => c.rating >= ratingMin);
    }
    setFilteredCreators(filtered);
  }, [niche, audienceMin, ratingMin, creators]);

  const niches = ['Tech', 'Fitness', 'Beauty', 'Fashion', 'Gaming', 'Food', 'Travel'];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <h1 className="text-xl font-bold">Creator Registry</h1>
          <button onClick={() => router.push('/')} className="text-sm text-outline">← Dashboard</button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        {/* Filters */}
        <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-4">Filter Creators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-outline block mb-2">Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="all">All Niches</option>
                {niches.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-outline block mb-2">Min Audience</label>
              <select
                value={audienceMin}
                onChange={(e) => setAudienceMin(Number(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={0}>Any Size</option>
                <option value={50000}>50K+</option>
                <option value={100000}>100K+</option>
                <option value={250000}>250K+</option>
                <option value={500000}>500K+</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-outline block mb-2">Min Rating</label>
              <select
                value={ratingMin}
                onChange={(e) => setRatingMin(Number(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
                <option value={4.8}>4.8+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="text-center py-12">Loading creators...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map(creator => (
              <div
                key={creator.id}
                onClick={() => router.push(`/creator/${creator.id}`)}
                className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{creator.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{creator.name}</h3>
                    <p className="text-xs text-outline">{creator.handle}</p>
                  </div>
                  {creator.credentialStatus === 'VERIFIED' && (
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">✓ Verified</span>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p><span className="text-outline">Niche:</span> {creator.niche}</p>
                  <p><span className="text-outline">Audience:</span> {(creator.audience / 1000).toFixed(0)}K followers</p>
                  <p><span className="text-outline">Avg Rate:</span> ${creator.avgRate}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-outline pt-4 border-t border-outline-variant/20 mb-4">
                  <span>⭐ {creator.rating}</span>
                  <span>{creator.completedDeals} deals done</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {creator.platforms.map(p => (
                    <span key={p} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {p}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/creator/${creator.id}`);
                  }}
                  className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90"
                >
                  View & Contact
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-outline">No creators found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
