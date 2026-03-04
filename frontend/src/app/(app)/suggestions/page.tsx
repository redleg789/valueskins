'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';
import { api } from '@/lib/api';

/**
 * AI DEAL FLOW ENGINE
 *
 * Eliminates cold pitching.
 * Creators see "Brands Want You" — proactive matches ranked by fit.
 * No manual applications needed — one-click deal room opening.
 */

export default function SuggestionsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'dismissed'>('available');

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const res = await api.matching.getSuggestions({ status: filter === 'all' ? undefined : filter });
        if (res.data) setSuggestions(res.data.suggestions);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
      setLoading(false);
    };

    loadSuggestions();
  }, [filter]);

  const handleOpenDealRoom = async (suggestionId: number, brandUserId: number) => {
    try {
      const res = await api.deals.openFromSuggestion(suggestionId);
      if (res.error) throw new Error(res.error);
      router.push(`/deals/${res.data.deal_room_id}`);
    } catch (err: any) {
      alert('Failed to open deal room: ' + err.message);
    }
  };

  const handleDismiss = async (suggestionId: number) => {
    try {
      await api.matching.dismissSuggestion(suggestionId);
      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    } catch (err: any) {
      alert('Failed to dismiss: ' + err.message);
    }
  };

  return (
    <PlatformLayout title="Brands Want You">
      <div style={{ padding: 16, maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🎯 Brands Want You</h2>
          <p style={{ color: 'var(--ig-text-secondary)', fontSize: 14 }}>
            AI-matched opportunities. No cold pitching. Just deals aligned with your profile.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['available', 'dismissed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                background: filter === f ? 'var(--ig-blue)' : 'var(--ig-card)',
                color: filter === f ? 'white' : 'var(--ig-text-secondary)',
                border: '1px solid var(--ig-separator)',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Suggestions List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ig-text-tertiary)' }}>
            Loading suggestions...
          </div>
        ) : suggestions.length === 0 ? (
          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid var(--ig-separator)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No suggestions yet</div>
            <div style={{ fontSize: 14, color: 'var(--ig-text-secondary)' }}>
              Complete your profile and get verified to start receiving brand matches.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {suggestions.map((suggestion, i) => (
              <div
                key={suggestion.id}
                style={{
                  background: 'var(--ig-card)',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid var(--ig-separator)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  animation: `slideUp 0.3s ease-out ${i * 0.05}s both`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                    {suggestion.brand_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)', marginBottom: 8 }}>
                    {suggestion.opportunity_title || 'Collaboration opportunity'}
                  </div>

                  {/* Match Factors */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {suggestion.match_factors?.valueskin_match && (
                      <span style={{ fontSize: 12, background: 'var(--ig-blue)', color: 'white', padding: '4px 8px', borderRadius: 4 }}>
                        ✓ Matching profession
                      </span>
                    )}
                    {suggestion.match_factors?.price_fit && (
                      <span style={{ fontSize: 12, background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: 4 }}>
                        ✓ Your price range
                      </span>
                    )}
                    {suggestion.advance_compatible && (
                      <span style={{ fontSize: 12, background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: 4 }}>
                        ✓ Advance available
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                    Match score: {(suggestion.match_score * 100).toFixed(0)}%
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleOpenDealRoom(suggestion.id, suggestion.brand_user_id)}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--ig-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Open Deal
                  </button>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--ig-separator)',
                      color: 'var(--ig-text-secondary)',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </PlatformLayout>
  );
}
