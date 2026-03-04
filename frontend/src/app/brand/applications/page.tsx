'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * BRAND: APPLICATIONS INBOX
 * Brands review and manage creator applications for opportunities
 */

export default function BrandApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    // Mock data
    setApplications([
      {
        id: 1,
        creator_name: 'Alex Chen',
        creator_avatar: 'A',
        creator_followers: 125000,
        opportunity_title: 'TechBrand Product Review',
        category: 'Tech Reviewer',
        status: 'pending',
        applied_at: '2024-03-02T10:00:00Z',
        proposal: 'I\'d love to create a detailed review of your latest product. I have experience with tech reviews.',
        engagement_rate: 4.2,
        trust_score: 92,
        verified: true,
      },
      {
        id: 2,
        creator_name: 'Sarah Kim',
        creator_avatar: 'S',
        creator_followers: 85000,
        opportunity_title: 'TechBrand Product Review',
        category: 'Content Creator',
        status: 'pending',
        applied_at: '2024-03-01T15:30:00Z',
        proposal: 'Great opportunity! I create engaging content for tech products.',
        engagement_rate: 5.8,
        trust_score: 88,
        verified: true,
      },
    ]);
  }, [filter]);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleApprove = async (appId: number) => {
    // API call would happen here
    setApplications(applications.map(app =>
      app.id === appId ? { ...app, status: 'approved' } : app
    ));
    setSelectedApp(null);
  };

  const handleReject = async (appId: number) => {
    // API call would happen here
    setApplications(applications.map(app =>
      app.id === appId ? { ...app, status: 'rejected' } : app
    ));
    setSelectedApp(null);
  };

  const handleOpenDealRoom = (appId: number) => {
    // Would create a deal room from application
    router.push('/brand/deals');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📥 Creator Applications</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Review and manage applications from creators interested in your opportunities</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Pending', count: 2, color: '#f59e0b' },
            { label: 'Approved', count: 4, color: '#10b981' },
            { label: 'Rejected', count: 1, color: '#ef4444' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, marginBottom: '0.25rem' }}>
                {stat.count}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          {/* Applications List */}
          <div>
            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: filter === f ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: filter === f ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: filter === f ? 600 : 400,
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Applications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
              {filteredApplications.map(app => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={{
                    padding: '1rem',
                    background: selectedApp?.id === app.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedApp?.id === app.id ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}>
                      {app.creator_avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{app.creator_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{app.category}</div>
                    </div>
                    {app.verified && <span style={{ fontSize: '0.9rem', color: '#10b981' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Application Details */}
          {selectedApp ? (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              {/* Creator Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                  }}>
                    {selectedApp.creator_avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedApp.creator_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                      👥 {selectedApp.creator_followers.toLocaleString()} followers
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Engagement Rate</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{selectedApp.engagement_rate}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Trust Score</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{selectedApp.trust_score}/100</div>
                  </div>
                </div>
              </div>

              {/* Proposal */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Creator's Proposal</h3>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: '#e5e7eb',
                }}>
                  {selectedApp.proposal}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApp.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    ✓ Approve & Open Deal
                  </button>
                  <button
                    onClick={() => handleReject(selectedApp.id)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              )}

              {selectedApp.status === 'approved' && (
                <button
                  onClick={() => handleOpenDealRoom(selectedApp.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Go to Deal Room
                </button>
              )}

              {selectedApp.status === 'rejected' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}>
                  ✗ Application Rejected
                </div>
              )}

              {/* View Profile Link */}
              <button
                onClick={() => router.push(`/profile/${selectedApp.creator_name}`)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '8px',
                  color: '#8b5cf6',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                View Full Profile
              </button>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px dashed rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#a1a1aa',
              minHeight: '300px',
            }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                <div>Select an application to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
