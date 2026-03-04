'use client';

import { useState, useEffect } from 'react';

/**
 * TWO-SIDED REPUTATION SYSTEM
 * Creators rate brands AND brands rate creators
 * Builds trust through bidirectional feedback
 */

export default function ReputationSystemPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<any>(null);

  useEffect(() => {
    // Load ratings from API
    setLoading(false);
    // Mock data
    setRatings([
      {
        id: 1,
        from_name: 'TechBrand Inc',
        from_type: 'brand',
        to_name: 'Alex Chen',
        rating: 5,
        category: 'professionalism',
        review: 'Incredibly professional and responsive. Delivered early and exceeded expectations.',
        deal_id: 101,
        created_at: '2024-02-28T10:00:00Z',
        verified: true,
      },
      {
        id: 2,
        from_name: 'Alex Chen',
        from_type: 'creator',
        to_name: 'FashionCorp',
        rating: 4,
        category: 'communication',
        review: 'Good communication overall, but some revision requests came late.',
        deal_id: 102,
        created_at: '2024-02-25T15:00:00Z',
        verified: true,
      },
    ]);
  }, [activeTab]);

  const ratingCategories = [
    { key: 'professionalism', label: 'Professionalism', icon: '🎯' },
    { key: 'communication', label: 'Communication', icon: '💬' },
    { key: 'delivery_quality', label: 'Delivery Quality', icon: '✨' },
    { key: 'reliability', label: 'Reliability', icon: '⏰' },
    { key: 'fairness', label: 'Fairness', icon: '⚖️' },
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 3.5) return '#f59e0b';
    return '#ef4444';
  };

  const filteredRatings = activeTab === 'received'
    ? ratings.filter(r => r.from_type === 'brand')
    : ratings.filter(r => r.from_type === 'creator');

  const avgRating = filteredRatings.length > 0
    ? (filteredRatings.reduce((sum, r) => sum + r.rating, 0) / filteredRatings.length).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>⭐ Two-Sided Reputation</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
            {activeTab === 'received'
              ? 'Ratings from brands you\'ve worked with'
              : 'Ratings you\'ve given to brands'}
          </p>
        </div>

        {/* Stats Card */}
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), transparent)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                Average Rating ({activeTab === 'received' ? 'from brands' : 'given by you'})
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: getRatingColor(parseFloat(avgRating.toString())),
              }}>
                {avgRating} ⭐
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                Total Ratings
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                {filteredRatings.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                5-Star Ratings
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981' }}>
                {filteredRatings.filter(r => r.rating === 5).length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {['received', 'given'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '1rem 2rem',
                background: activeTab === tab ? 'transparent' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
                color: activeTab === tab ? 'white' : '#a1a1aa',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: '0.95rem',
              }}
            >
              {tab === 'received' ? '📥 Ratings Received' : '📤 Ratings Given'}
            </button>
          ))}
        </div>

        {/* Ratings List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
            Loading ratings...
          </div>
        ) : filteredRatings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No ratings yet</div>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
              {activeTab === 'received'
                ? 'Ratings from brands will appear here after deals complete'
                : 'You haven\'t rated any brands yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredRatings.map((rating, i) => (
              <div
                key={rating.id}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedRating(selectedRating?.id === rating.id ? null : rating)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                      {rating.from_name}
                      {rating.verified && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#10b981' }}>✓ Verified</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                      {rating.from_type === 'brand' ? '🏢 Brand' : '👤 Creator'} • Deal #{rating.deal_id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: getRatingColor(rating.rating),
                    }}>
                      {rating.rating}⭐
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                      {new Date(rating.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div style={{ marginBottom: '0.75rem' }}>
                  {ratingCategories.map(cat => (
                    cat.key === rating.category && (
                      <span
                        key={cat.key}
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.2)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {cat.icon} {cat.label}
                      </span>
                    )
                  ))}
                </div>

                {/* Review */}
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  color: '#e5e7eb',
                  lineHeight: 1.6,
                }}>
                  {rating.review}
                </div>

                {/* Expanded Details */}
                {selectedRating?.id === rating.id && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      {ratingCategories.map(cat => (
                        <div key={cat.key}>
                          <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>
                            {cat.icon} {cat.label}
                          </div>
                          <div style={{
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: '80%',
                              background: '#8b5cf6',
                              borderRadius: '3px',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {activeTab === 'given' && (
                      <div style={{ marginTop: '1rem' }}>
                        <button style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.2)',
                          borderRadius: '6px',
                          color: '#8b5cf6',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}>
                          Edit Rating
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Leave Rating Section */}
        {activeTab === 'given' && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '12px',
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>⭐ Leave a Rating</h3>
            <p style={{ color: '#a1a1aa', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Share your experience with a brand you've worked with
            </p>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}>
              Rate a Brand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
