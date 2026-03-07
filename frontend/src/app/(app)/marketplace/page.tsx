'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type MarketplaceOpportunity, type MarketplaceStats, type OpportunityFilters } from '@/lib/api';

const LEVEL_NAMES = ['Newcomer', 'Rising', 'Established', 'Expert', 'Legend'];
const LEVEL_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
const CATEGORIES = ['All', 'Development', 'Art', 'Community', 'Marketing', 'Content', 'Leadership'];

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.07)', borderRadius: '10px' }} />
        <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }} />
      </div>
      <div style={{ height: '24px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '0.75rem' }} />
      <div style={{ height: '40px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '1.5rem' }} />
      <div style={{ height: '40px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }} />
    </div>
  );
}

export default function MarketplacePage() {
  const [opportunities, setOpportunities] = useState<MarketplaceOpportunity[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'reward'>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch current user profile from backend (not stale localStorage)
    const userResult = await api.persona.getMyProfile();
    if (userResult.data) {
      setUserProfile(userResult.data);
      // Also update localStorage to keep it in sync
      if (userResult.data.id) {
        try {
          const stored = localStorage.getItem('valueskins_user');
          if (stored) {
            const user = JSON.parse(stored);
            user.persona_id = userResult.data.id;
            localStorage.setItem('valueskins_user', JSON.stringify(user));
          }
        } catch { /* non-critical */ }
      }
    }

    const filters: OpportunityFilters = { status: 'open' };
    if (selectedCategory !== 'All') filters.category = selectedCategory;

    const [oppsResult, statsResult] = await Promise.all([
      api.marketplace.getOpportunities(filters),
      api.marketplace.getStats(),
    ]);

    if (oppsResult.error) {
      setError(oppsResult.error);
    } else {
      setOpportunities(oppsResult.data?.opportunities ?? []);
    }

    if (statsResult.data) {
      setStats(statsResult.data);
    }

    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sorted = [...opportunities].sort((a, b) =>
    sortBy === 'reward'
      ? parseFloat(b.reward_amount) - parseFloat(a.reward_amount)
      : b.id - a.id
  );

  const formatReward = (amount: string, token: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? `${amount} ${token}` : num >= 1000 ? `${(num / 1000).toFixed(0)}K ${token}` : `${num} ${token}`;
  };

  const handleApply = async (id: number) => {
    if (!userProfile?.id) {
      setApplyError('You must set up a persona before applying. Visit your profile to get started.');
      return;
    }
    setApplyingTo(id);
    setApplyError(null);
    const result = await api.marketplace.applyToOpportunity(id, userProfile.id, '');
    if (result.error) {
      setApplyError(result.error);
    } else {
      setOpportunities(prev =>
        prev.map(opp => opp.id === id ? { ...opp, can_apply: false, application_count: opp.application_count + 1 } : opp)
      );
    }
    setApplyingTo(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div style={{ maxWidth: '1400px', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Opportunity Marketplace</h1>
        <p style={{ color: '#a1a1aa' }}>Level-gated opportunities from verified brands</p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(139,92,246,0.05)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.1)' }}>
          {stats ? (
            <>
              <div><span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>${parseFloat(stats.total_volume || '0').toLocaleString()}</span> <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Total Value</span></div>
              <div><span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.active_opportunities}</span> <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Active</span></div>
              <div><span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.completed_deals}</span> <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Completed</span></div>
            </>
          ) : (
            <div style={{ height: '32px', width: '300px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }} />
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '0.5rem 1rem', background: selectedCategory === cat ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedCategory === cat ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: selectedCategory === cat ? 'white' : '#a1a1aa', cursor: 'pointer' }}>{cat}</button>
        ))}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'reward')} style={{ marginLeft: 'auto', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}>
          <option value="newest">Newest</option>
          <option value="reward">Highest Reward</option>
        </select>
      </div>

      {applyError && (
        <div style={{ maxWidth: '1400px', margin: '0 auto 1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{applyError}</span>
          <button onClick={() => setApplyError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {error ? (
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Failed to load opportunities</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={loadData} style={{ padding: '0.75rem 1.5rem', background: 'rgba(139,92,246,0.2)', border: '1px solid #8b5cf6', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Try Again</button>
        </div>
      ) : (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : sorted.length === 0
              ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#a1a1aa' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <p>No opportunities found for this category.</p>
                </div>
              )
              : sorted.map(opp => {
                const userLevel = userProfile?.id ? (userProfile.level ?? 1) : 0;
                const isLocked = userLevel < opp.required_level;
                return (
                  <div key={opp.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(opp.brand_name || '?').charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{opp.brand_name || 'Unknown Brand'} {opp.brand_verified && <span style={{ color: '#3b82f6' }}>✓</span>}</span>
                      </div>
                      <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '100px', fontSize: '0.75rem', color: '#8b5cf6' }}>{opp.category}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{opp.title}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{opp.description}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ color: '#71717a', fontSize: '0.75rem' }}>REWARD</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatReward(opp.reward_amount, opp.reward_currency)}</div>
                      </div>
                      <div>
                        <div style={{ color: '#71717a', fontSize: '0.75rem' }}>LEVEL</div>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, background: `${LEVEL_COLORS[opp.required_level - 1]}20`, color: LEVEL_COLORS[opp.required_level - 1] }}>★ {opp.required_level} {LEVEL_NAMES[opp.required_level - 1] ?? 'Unknown'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#71717a', fontSize: '0.85rem' }}>{opp.application_count} applicants</span>
                      {!opp.can_apply ? (
                        <button disabled style={{ padding: '0.75rem 1.5rem', background: 'rgba(34,197,94,0.2)', border: 'none', borderRadius: '10px', color: '#22c55e', fontWeight: 600 }}>✓ Applied</button>
                      ) : isLocked ? (
                        <button disabled style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', color: '#71717a', fontWeight: 600 }}>🔒 Level {opp.required_level}</button>
                      ) : (
                        <button onClick={() => handleApply(opp.id)} disabled={applyingTo === opp.id} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{applyingTo === opp.id ? 'Applying...' : 'Apply Now'}</button>
                      )}
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}
    </div>
  );
}
