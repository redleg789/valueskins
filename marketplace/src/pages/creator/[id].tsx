'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Creator {
  id: string;
  name: string;
  handle: string;
  niche: string;
  audience: number;
  rating: number;
  platforms: string[];
  avgRate: number;
  completedDeals: number;
  bio: string;
  credentialStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  portfolio: { id: string; title: string; brand: string; deal: string }[];
  reviews: { brand: string; rating: number; feedback: string }[];
}

export default function CreatorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews'>('overview');

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchCreator = async () => {
      try {
        const response = await fetch(`/api/v1/creators/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCreator(data);
        }
      } catch (error) {
        // Demo creator
        const demoCreator = {
          id: '1',
          name: 'Alex Chen',
          handle: '@techreviewsalmost',
          niche: 'Tech',
          audience: 245000,
          rating: 4.8,
          platforms: ['YouTube', 'TikTok'],
          avgRate: 2500,
          completedDeals: 12,
          bio: 'Honest tech reviews. I don\'t accept BS products. Testing new gadgets and giving real opinions for my community.',
          credentialStatus: 'VERIFIED' as const,
          portfolio: [
            { id: '1', title: 'Laptop Review', brand: 'TechCorp', deal: 'Professional 10-min YouTube review' },
            { id: '2', title: 'Phone Unboxing', brand: 'MobileMax', deal: 'TikTok unboxing series (5 vids)' },
            { id: '3', title: 'App Demo', brand: 'StartupXYZ', deal: '3 Instagram Reels' },
          ],
          reviews: [
            { brand: 'TechCorp', rating: 5, feedback: 'Excellent work. Honest review that resonated with audience.' },
            { brand: 'MobileMax', rating: 4.8, feedback: 'Professional, on-time, great engagement.' },
            { brand: 'StartupXYZ', rating: 4.9, feedback: 'Exceeded expectations. Strong ROI.' },
          ],
        };
        setCreator(demoCreator);
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [id, router]);

  if (loading) return <div className="min-h-screen bg-surface" />;
  if (!creator) return <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center">Creator not found</div>;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <h1 className="text-xl font-bold">{creator.name}</h1>
          <button onClick={() => router.back()} className="text-sm text-outline">← Back</button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto pb-12">
        {/* Profile Header */}
        <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl text-primary font-bold">
                {creator.name[0]}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{creator.name}</h2>
                <p className="text-outline mb-2">{creator.handle}</p>
                <div className="flex gap-2">
                  {creator.credentialStatus === 'VERIFIED' && (
                    <span className="text-xs bg-success/20 text-success px-3 py-1 rounded-full font-semibold">✓ Verified Credential</span>
                  )}
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">{creator.niche}</span>
                </div>
              </div>
            </div>

            <button className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90">
              Post Campaign for This Creator
            </button>
          </div>

          <p className="text-on-surface mb-8 text-lg">{creator.bio}</p>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-outline mb-2">Audience</p>
              <p className="text-2xl font-bold">{(creator.audience / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-sm text-outline mb-2">Rating</p>
              <p className="text-2xl font-bold">⭐ {creator.rating}</p>
            </div>
            <div>
              <p className="text-sm text-outline mb-2">Avg Rate</p>
              <p className="text-2xl font-bold">${creator.avgRate}</p>
            </div>
            <div>
              <p className="text-sm text-outline mb-2">Deals Done</p>
              <p className="text-2xl font-bold">{creator.completedDeals}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-outline-variant/20">
          {(['overview', 'portfolio', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-outline'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Why Brands Choose {creator.name}</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-success">✓</span>
                    <span>Verified audience of {(creator.audience / 1000).toFixed(0)}K engaged followers</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-success">✓</span>
                    <span>Proven track record: {creator.completedDeals} successful deals</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-success">✓</span>
                    <span>Consistent quality: {creator.rating}/5 average rating</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-success">✓</span>
                    <span>Transparent pricing: ${creator.avgRate} standard rate</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-success">✓</span>
                    <span>Professional across {creator.platforms.join(', ')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Platforms</h3>
                <div className="flex gap-3">
                  {creator.platforms.map(p => (
                    <span key={p} className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-semibold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 sticky top-24">
                <button className="w-full px-4 py-3 bg-primary text-on-primary rounded-lg font-semibold mb-3 hover:opacity-90">
                  Send Message
                </button>
                <button className="w-full px-4 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10">
                  View All Deals
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Past Work</h3>
            <div className="grid grid-cols-2 gap-6">
              {creator.portfolio.map(item => (
                <div key={item.id} className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 hover:border-primary cursor-pointer transition-colors">
                  <div className="aspect-video bg-surface rounded-lg mb-4 flex items-center justify-center text-outline">
                    [Portfolio Item]
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-outline mb-2">Brand: {item.brand}</p>
                  <p className="text-xs text-outline">{item.deal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Brand Reviews ({creator.reviews.length})</h3>
            <div className="space-y-4">
              {creator.reviews.map((review, i) => (
                <div key={i} className="bg-surface-container border border-outline-variant/20 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold">{review.brand}</p>
                    <span className="text-primary font-bold">⭐ {review.rating}</span>
                  </div>
                  <p className="text-on-surface">{review.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
