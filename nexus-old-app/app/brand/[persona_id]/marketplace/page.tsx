'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const LEVEL_NAMES = ['Newcomer', 'Rising', 'Established', 'Expert', 'Legend'];
const LEVEL_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

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

interface CreatorProfile {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  level?: number;
  score?: number;
}

interface Opportunity {
  opportunity_id: number;
  brand_name: string;
  title: string;
  description?: string;
  campaign_type: string;
  required_profession: string;
  min_level: number;
  compensation_type: string;
  reward_amount?: number;
  reward_currency: string;
  match_score: number;
}

export default function BrandMarketplacePage() {
  const params = useParams();
  const router = useRouter();
  const personaId = params?.persona_id ? parseInt(params.persona_id as string) : null;

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingOffer, setSendingOffer] = useState<number | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  const formatReward = (amount: number | undefined, currency: string) => {
    if (!amount) return `Barter ${currency}`;
    const num = parseFloat(amount.toString());
    return isNaN(num) ? `${amount} ${currency}` : num >= 1000 ? `${(num / 1000).toFixed(0)}K ${currency}` : `${num} ${currency}`;
  };

  const loadData = useCallback(async () => {
    if (!personaId) {
      setError('Invalid persona ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch creator profile (public data)
      const profileResult = await api.persona.getPersona(personaId);
      if (profileResult.error) {
        setError('Creator profile not found');
        setLoading(false);
        return;
      }

      if (profileResult.data) {
        setCreatorProfile(profileResult.data);
      }

      // Fetch matched opportunities for this persona
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const oppsResult = await fetch(`${apiBaseUrl}/matching/persona/${personaId}/opportunities?limit=100`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(r => r.json());

      if (oppsResult.error) {
        setError(oppsResult.error);
        setOpportunities([]);
        setProfessions([]);
      } else {
        setOpportunities(oppsResult.opportunities || []);
        setProfessions(oppsResult.professions_matched || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creator marketplace');
      setOpportunities([]);
    }

    setLoading(false);
  }, [personaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendOffer = async (opportunityId: number) => {
    setSendingOffer(opportunityId);
    setOfferError(null);

    try {
      // In production, this would create a deal room via:
      // POST /deal-rooms { opportunity_id, creator_persona_id }
      setTimeout(() => {
        setSendingOffer(null);
        alert(`Offer sent! Navigate to deal rooms to chat with ${creatorProfile?.display_name || 'this creator'}`);
      }, 1000);
    } catch (err) {
      setOfferError(err instanceof Error ? err.message : 'Failed to send offer');
      setSendingOffer(null);
    }
  };

  if (!personaId) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Invalid Creator Link</h1>
          <p style={{ color: '#a1a1aa' }}>This creator profile link is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Creator Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 3rem', padding: '2rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.07)', borderRadius: '12px' }} />
        ) : error && !creatorProfile ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
            <button onClick={loadData} style={{ padding: '0.75rem 1.5rem', background: 'rgba(139,92,246,0.2)', border: '1px solid #8b5cf6', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : creatorProfile ? (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '2.5rem' }}>
              {(creatorProfile.display_name || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{creatorProfile.display_name || creatorProfile.username}</h1>
              <p style={{ color: '#a1a1aa', marginBottom: '1rem' }}>@{creatorProfile.username}</p>
              {professions.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {professions.map(prof => (
                    <span key={prof} style={{ padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', fontSize: '0.9rem', color: '#8b5cf6' }}>
                      {prof}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Opportunities Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
          Matching Opportunities
        </h2>

        {offerError && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', color: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{offerError}</span>
            <button onClick={() => setOfferError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : opportunities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', color: '#a1a1aa' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <p>No matching opportunities found for this creator's ValuSkins.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Creator skills don't align with current open opportunities.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {opportunities.map(opp => (
              <div key={opp.opportunity_id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {(opp.brand_name || '?').charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{opp.brand_name || 'Unknown'}</span>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '100px', fontSize: '0.75rem', color: '#8b5cf6' }}>
                    {opp.campaign_type}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{opp.title}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{opp.description || 'No description provided'}</p>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>REWARD</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {formatReward(opp.reward_amount, opp.reward_currency)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#71717a', fontSize: '0.75rem' }}>MIN LEVEL</div>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, background: `${LEVEL_COLORS[opp.min_level - 1]}20`, color: LEVEL_COLORS[opp.min_level - 1] }}>
                      ★ {opp.min_level} {LEVEL_NAMES[opp.min_level - 1] || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleSendOffer(opp.opportunity_id)}
                    disabled={sendingOffer === opp.opportunity_id}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: sendingOffer === opp.opportunity_id ? 'default' : 'pointer',
                      opacity: sendingOffer === opp.opportunity_id ? 0.7 : 1
                    }}
                  >
                    {sendingOffer === opp.opportunity_id ? 'Sending...' : 'Send Offer'}
                  </button>
                  <button
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#a1a1aa',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
