'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Deal {
  id: string;
  brandName: string;
  title: string;
  description: string;
  budget: number;
  platforms: string[];
  status: string;
  deadline: string;
  applicantCount: number;
}

export default function DealBoard() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [platform, setPlatform] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch deals from ValueSkins API
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/v1/deals?status=OPEN', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDeals(data.deals || []);
          setFilteredDeals(data.deals || []);
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        // Fallback: show demo deals
        setDeals([
          { id: '1', brandName: 'TechBrand Co', title: '3 Instagram Reels', description: 'Product showcase', budget: 2500, platforms: ['Instagram'], status: 'OPEN', deadline: '2026-06-01', applicantCount: 12 },
          { id: '2', brandName: 'Beauty Corp', title: 'TikTok Campaign (5 videos)', description: 'Trending sound integration', budget: 5000, platforms: ['TikTok'], status: 'OPEN', deadline: '2026-06-15', applicantCount: 45 },
          { id: '3', brandName: 'Fitness Brands', title: 'YouTube Long-form Review', description: '8-10 min honest review', budget: 3500, platforms: ['YouTube'], status: 'OPEN', deadline: '2026-07-01', applicantCount: 8 },
        ]);
        setFilteredDeals([
          { id: '1', brandName: 'TechBrand Co', title: '3 Instagram Reels', description: 'Product showcase', budget: 2500, platforms: ['Instagram'], status: 'OPEN', deadline: '2026-06-01', applicantCount: 12 },
          { id: '2', brandName: 'Beauty Corp', title: 'TikTok Campaign (5 videos)', description: 'Trending sound integration', budget: 5000, platforms: ['TikTok'], status: 'OPEN', deadline: '2026-06-15', applicantCount: 45 },
          { id: '3', brandName: 'Fitness Brands', title: 'YouTube Long-form Review', description: '8-10 min honest review', budget: 3500, platforms: ['YouTube'], status: 'OPEN', deadline: '2026-07-01', applicantCount: 8 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [router]);

  useEffect(() => {
    let filtered = deals;
    if (platform !== 'all') {
      filtered = filtered.filter(d => d.platforms.includes(platform));
    }
    if (search) {
      filtered = filtered.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.brandName.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredDeals(filtered);
  }, [platform, search, deals]);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <h1 className="text-xl font-bold">Deal Board</h1>
          <button onClick={() => router.push('/')} className="text-sm text-outline hover:text-on-surface">← Dashboard</button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface placeholder-outline focus:outline-none focus:border-primary mb-4"
          />
          <div className="flex gap-2">
            {['all', 'Instagram', 'TikTok', 'YouTube', 'Twitter'].map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  platform === p ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant'
                }`}
              >
                {p === 'all' ? 'All Platforms' : p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading deals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <div
                key={deal.id}
                onClick={() => router.push(`/deals/${deal.id}`)}
                className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-outline uppercase tracking-wider">{deal.brandName}</p>
                    <h3 className="text-lg font-bold">{deal.title}</h3>
                  </div>
                  <span className="text-primary text-sm font-semibold">${deal.budget}</span>
                </div>

                <p className="text-sm text-outline mb-4">{deal.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {deal.platforms.map(p => (
                    <span key={p} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-outline pt-4 border-t border-outline-variant/20">
                  <span>Due: {deal.deadline}</span>
                  <span>{deal.applicantCount} applied</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/deals/${deal.id}`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90"
                >
                  View & Apply
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-outline">No deals found. Try adjusting filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
