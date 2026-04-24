'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Deal {
  id: string;
  brandName: string;
  brandLogo?: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  platforms: string[];
  requiredLevel: number;
  applicantCount: number;
  status: string;
  applicationDeadline: string;
}

interface Application {
  id: string;
  dealId: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export default function Opportunities() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [pitch, setPitch] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }

    const fetchDeals = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/integrations/valueskins-deals', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDeals(data.deals || []);
          setFilteredDeals(data.deals || []);
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      }
    };

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/integrations/valueskins-sync', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch_applications' }),
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      }
    };

    fetchDeals();
    fetchApplications();
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (selectedPlatform === 'all') {
      setFilteredDeals(deals);
    } else {
      setFilteredDeals(deals.filter(deal => deal.platforms.includes(selectedPlatform)));
    }
  }, [selectedPlatform, deals]);

  const handleApply = async () => {
    if (!selectedDeal || !pitch.trim()) {
      alert('Please provide a pitch');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/integrations/valueskins-apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selectedDeal.id,
          pitch,
          portfolioLinks: portfolioLinks.filter(l => l.trim()),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setPitch('');
        setPortfolioLinks(['']);
        setShowApplicationModal(false);
        setTimeout(() => setSubmitted(false), 3000);

        // Refresh applications
        const appResponse = await fetch('/api/integrations/valueskins-sync', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch_applications' }),
        });
        if (appResponse.ok) {
          const data = await appResponse.json();
          setApplications(data);
        }
      }
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  const isApplied = (dealId: string) => applications.some(app => app.dealId === dealId);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading opportunities...</div>
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
          <span className="text-3xl font-black italic text-primary font-headline">Opportunities</span>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Filters */}
          <div className="mb-8 card-surface p-6">
            <h2 className="text-lg font-headline font-bold mb-4">Filter by Platform</h2>
            <div className="flex gap-3 flex-wrap">
              {['all', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter'].map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-primary text-surface'
                      : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Deals List */}
          <div className="space-y-6">
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                No opportunities found for selected filters
              </div>
            ) : (
              filteredDeals.map(deal => {
                const applied = isApplied(deal.id);
                return (
                  <div key={deal.id} className="card-surface p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {deal.brandLogo && (
                            <img src={deal.brandLogo} alt={deal.brandName} className="w-10 h-10 rounded-full" />
                          )}
                          <div>
                            <p className="text-sm text-on-surface-variant">{deal.brandName}</p>
                            <h3 className="text-xl font-headline font-bold">{deal.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {deal.currency} {(deal.budget / 100).toLocaleString()}
                        </div>
                        <p className="text-xs text-on-surface-variant">{deal.applicantCount} applicants</p>
                      </div>
                    </div>

                    <p className="text-on-surface/90 mb-4">{deal.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {deal.platforms.map(platform => (
                        <span key={platform} className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">
                          {platform}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4 items-center text-sm text-on-surface-variant mb-4">
                      <span>Min Level: {deal.requiredLevel}</span>
                      <span>Deadline: {new Date(deal.applicationDeadline).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowApplicationModal(true);
                      }}
                      disabled={applied || deal.status !== 'active'}
                      className={`btn-primary ${(applied || deal.status !== 'active') && 'opacity-50 cursor-not-allowed'}`}
                    >
                      {applied ? '✓ Applied' : deal.status === 'active' ? 'Apply Now' : 'Closed'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Application Modal */}
          {showApplicationModal && selectedDeal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-surface-container rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div className="sticky top-0 flex justify-between items-center p-6 bg-surface-container-high border-b border-outline-variant/20">
                  <h3 className="text-lg font-headline font-bold">Apply for {selectedDeal.title}</h3>
                  <button onClick={() => setShowApplicationModal(false)} className="text-primary text-2xl leading-none">×</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-headline mb-2">Your Pitch</label>
                    <textarea
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Tell the brand why you're the perfect fit for this opportunity"
                      className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-headline mb-2">Portfolio Links</label>
                    <div className="space-y-2">
                      {portfolioLinks.map((link, i) => (
                        <input
                          key={i}
                          type="url"
                          value={link}
                          onChange={(e) => {
                            const newLinks = [...portfolioLinks];
                            newLinks[i] = e.target.value;
                            setPortfolioLinks(newLinks);
                          }}
                          placeholder="https://..."
                          className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50 focus:border-primary"
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setPortfolioLinks([...portfolioLinks, ''])}
                      className="text-sm text-primary hover:underline mt-2"
                    >
                      + Add another link
                    </button>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={handleApply} className="btn-primary flex-1">Submit Application</button>
                    <button onClick={() => setShowApplicationModal(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>

                  {submitted && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded px-4 py-3 text-green-100 text-sm">
                      ✓ Application submitted! Check your dashboard for updates.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
