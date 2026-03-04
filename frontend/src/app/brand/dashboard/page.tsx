'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * BRAND DASHBOARD
 * ROI tracking, deal pipeline, and AI-ranked creator recommendations
 */

export default function BrandDashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'creators'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setDashboardData({
      deals: {
        active: 3,
        completed: 8,
        total_spent_cents: 400000,
      },
      roi: {
        total_impressions: 2450000,
        total_clicks: 89300,
        estimated_value_cents: 1200000,
        roi_percentage: 300,
      },
      deals_by_status: [
        { status: 'in_progress', count: 3, color: '#3b82f6' },
        { status: 'completed', count: 8, color: '#10b981' },
        { status: 'pending_approval', count: 1, color: '#f59e0b' },
      ],
      top_creators: [
        {
          id: 1,
          name: 'Alex Chen',
          category: 'Tech Reviewer',
          followers: 125000,
          engagement_rate: 4.2,
          match_score: 92,
          previous_deals: 2,
          verification: 'verified',
        },
        {
          id: 2,
          name: 'Sarah Kim',
          category: 'Content Creator',
          followers: 85000,
          engagement_rate: 5.8,
          match_score: 88,
          previous_deals: 1,
          verification: 'verified',
        },
        {
          id: 3,
          name: 'Jordan Lee',
          category: 'Lifestyle Influencer',
          followers: 156000,
          engagement_rate: 3.5,
          match_score: 85,
          previous_deals: 0,
          verification: 'pending',
        },
      ],
    });
  }, []);

  const handleViewOpportunities = () => {
    router.push('/brand/opportunities');
  };

  const handleCreateOpportunity = () => {
    router.push('/brand/opportunities/create');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📊 Brand Dashboard</h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
              Track campaign ROI and discover AI-ranked creators
            </p>
          </div>
          <button
            onClick={handleCreateOpportunity}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            + Create Opportunity
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {['overview', 'roi', 'creators'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab ? 'white' : '#a1a1aa',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: '0.95rem',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'overview' && '📈 Overview'}
              {tab === 'roi' && '💰 ROI Analytics'}
              {tab === 'creators' && '👥 AI Creator Matching'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {[
                { label: 'Active Deals', value: dashboardData.deals.active, color: '#3b82f6' },
                { label: 'Completed Deals', value: dashboardData.deals.completed, color: '#10b981' },
                {
                  label: 'Total Spent',
                  value: `$${(dashboardData.deals.total_spent_cents / 100).toLocaleString()}`,
                  color: '#f59e0b',
                },
                {
                  label: 'Est. Campaign Value',
                  value: `$${(dashboardData.roi.estimated_value_cents / 100).toLocaleString()}`,
                  color: '#8b5cf6',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Deal Status Breakdown */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Deal Pipeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.deals_by_status.map((status: any) => (
                  <div key={status.status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>{status.status.replace(/_/g, ' ')}</span>
                      <span style={{ fontWeight: 700, color: status.color }}>{status.count}</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(status.count / dashboardData.deals.total_spent_cents) * 100 * 10}%`,
                        background: status.color,
                        borderRadius: '4px',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'roi' && (
          <>
            {/* ROI Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {[
                {
                  label: 'Total Impressions',
                  value: (dashboardData.roi.total_impressions / 1000000).toFixed(1) + 'M',
                  color: '#3b82f6',
                },
                {
                  label: 'Total Clicks',
                  value: (dashboardData.roi.total_clicks / 1000).toFixed(0) + 'K',
                  color: '#10b981',
                },
                {
                  label: 'Click-Through Rate',
                  value: ((dashboardData.roi.total_clicks / dashboardData.roi.total_impressions) * 100).toFixed(2) + '%',
                  color: '#f59e0b',
                },
                {
                  label: 'ROI',
                  value: dashboardData.roi.roi_percentage + '%',
                  color: '#8b5cf6',
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                    {metric.label}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: metric.color }}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            {/* ROI Breakdown */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>ROI by Campaign</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                Detailed campaign performance will be available after deal completion
              </p>
            </div>
          </>
        )}

        {activeTab === 'creators' && (
          <>
            {/* AI Recommendation Info */}
            <div style={{
              padding: '1rem',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}>
              🤖 <strong>AI-Powered Matching:</strong> These creators are ranked by fit with your brand preferences, budget, and deal history. Highest match scores at the top.
            </div>

            {/* Recommended Creators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
              {dashboardData.top_creators.map((creator: any) => (
                <div
                  key={creator.id}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Creator Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {creator.name}
                        {creator.verification === 'verified' && (
                          <span style={{ marginLeft: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>✓</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                        {creator.category}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: creator.match_score >= 90 ? '#10b981' : creator.match_score >= 85 ? '#f59e0b' : '#3b82f6',
                    }}>
                      {creator.match_score}%
                    </div>
                  </div>

                  {/* Metrics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Followers</div>
                      <div style={{ fontWeight: 700 }}>👥 {(creator.followers / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Engagement</div>
                      <div style={{ fontWeight: 700 }}>{creator.engagement_rate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Track Record</div>
                      <div style={{ fontWeight: 700 }}>{creator.previous_deals} deals</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Status</div>
                      <div style={{
                        fontWeight: 700,
                        color: creator.verification === 'verified' ? '#10b981' : '#f59e0b',
                      }}>
                        {creator.verification}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => router.push(`/brand/profile/${creator.id}`)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => router.push(`/brand/invite/${creator.id}`)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={handleViewOpportunities}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              View All Creators
            </button>
          </>
        )}
      </div>
    </div>
  );
}
