'use client';
// YouTube Demo — Product Sponsorship Marketplace (Ultra-Simple Workflow)
// Deal workflow: Brand sends offer → Creator accepts/rejects → Submits video link → Brand verifies → Pays
// NO script negotiation, NO escrow milestones — just payment on verified delivery

import React, { useState } from 'react';
import Link from 'next/link';

const C = {
  primary: '#FF0000', // YouTube red
  bg: '#000000',
  surface: '#000000',
  surfaceAlt: '#121212',
  card: '#1A1A1A',
  text: '#F5F5F5',
  textSecondary: '#A8A8A8',
  textMuted: '#666666',
  border: '#262626',
  success: '#00D46A',
  successBg: 'rgba(0,212,106,0.08)',
  successBorder: 'rgba(0,212,106,0.25)',
  warning: '#FFAB00',
  warningBg: 'rgba(255,171,0,0.08)',
  warningBorder: 'rgba(255,171,0,0.25)',
  danger: '#ED4956',
  dangerBg: 'rgba(237,73,86,0.08)',
  dangerBorder: 'rgba(237,73,86,0.25)',
  accent: '#FF0000',
  accentBg: 'rgba(255,0,0,0.08)',
  accentBorder: 'rgba(255,0,0,0.25)',
};

// Mock YouTube channels
const YOUTUBE_CHANNELS = [
  {
    name: 'TechFlow Reviews', handle: '@techflowreviews', subscribers: '2.3M', category: 'Tech',
    avgViews: '890K', videoLength: '12-15m', sponsored: ['Apple', 'Samsung', 'GoPro'], rate: '$5,500',
  },
  {
    name: 'Unboxing Daily', handle: '@unboxingdaily', subscribers: '1.8M', category: 'Gadgets',
    avgViews: '1.2M', videoLength: '8-12m', sponsored: ['Amazon', 'Best Buy'], rate: '$4,200',
  },
  {
    name: 'Fitness Guru', handle: '@fitnessguru', subscribers: '950K', category: 'Fitness',
    avgViews: '450K', videoLength: '10-20m', sponsored: ['Nike', 'MyProtein', 'Fitbit'], rate: '$3,500',
  },
];

// Mock sponsorship opportunities
const SPONSORSHIP_OPPORTUNITIES = [
  {
    brand: 'Apple Watch', category: 'Tech',
    product: 'Apple Watch Series 9 with Sport Band',
    budget: '$5,500', deadline: '2026-04-15',
    requirement: 'Unboxing + 2-week lifestyle test (12-15 min video). Feature fitness tracking, cellular connectivity.',
    videoLength: '12-15 minutes', placement: 'opening + mid-roll + outro',
    exclusivity: '60 days (no competing smartwatches)',
    usageRights: 'Brand can reshare 30-sec clip in ads for 6 months',
  },
  {
    brand: 'DJI Mini 4 Pro', category: 'Gadgets',
    product: 'DJI Mini 4 Pro Drone with fly case',
    budget: '$4,800', deadline: '2026-04-30',
    requirement: 'Aerial photography tutorial + creative demo (10-12 min video). Include 4K footage samples.',
    videoLength: '10-12 minutes', placement: 'opening + demo footage',
    exclusivity: '45 days (no other drones)',
    usageRights: 'Brand can use footage in marketing materials',
  },
];

export default function YouTubeDemoPage() {
  const [activeView, setActiveView] = useState<'browse' | 'channel' | 'deals'>('browse');
  const [selectedChannel, setSelectedChannel] = useState<typeof YOUTUBE_CHANNELS[0] | null>(null);
  const [activeSponsorship, setActiveSponsorship] = useState<typeof SPONSORSHIP_OPPORTUNITIES[0] | null>(null);
  const [dealState, setDealState] = useState<'pending' | 'accepted' | 'in_progress' | 'delivered' | 'verified' | 'completed'>('pending');
  const [videoLink, setVideoLink] = useState('');
  const [deals, setDeals] = useState<Array<{ id: number; sponsor: typeof SPONSORSHIP_OPPORTUNITIES[0]; state: string; rate: string }>>([]);

  const acceptSponsorship = () => {
    if (!activeSponsorship || !selectedChannel) return;
    setDeals([...deals, { id: Date.now(), sponsor: activeSponsorship, state: 'accepted', rate: activeSponsorship.budget }]);
    setDealState('in_progress');
  };

  const submitVideo = () => {
    if (!videoLink.match(/youtube\.com\/(watch|youtu\.be)/)) return;
    setDealState('delivered');
  };

  const verifyVideo = () => {
    setDealState('verified');
    setTimeout(() => setDealState('completed'), 1500);
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0' }}>YouTube Sponsorship</h1>
            <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0 }}>Product sponsors match with creators. No negotiation. Just payment on verified delivery.</p>
          </div>
          <Link href="/demo/instagram" style={{ padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            Back to Instagram
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {(['browse', 'channel', 'deals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              style={{
                padding: '10px 16px',
                background: activeView === tab ? C.primary : 'transparent',
                border: `1px solid ${activeView === tab ? C.primary : C.border}`,
                color: activeView === tab ? '#fff' : C.textSecondary,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              {tab === 'browse' && 'Browse Sponsorships'}
              {tab === 'channel' && 'Your Channel'}
              {tab === 'deals' && `Active Deals (${deals.length})`}
            </button>
          ))}
        </div>

        {/* Browse Sponsorships */}
        {activeView === 'browse' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {SPONSORSHIP_OPPORTUNITIES.map((opp, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{opp.brand}</div>
                    <div style={{ fontSize: '12px', color: C.textSecondary }}>{opp.category}</div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: C.primary }}>{opp.budget}</div>
                </div>

                <div style={{ background: C.surfaceAlt, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>Product</div>
                  <div style={{ fontSize: '13px', color: C.text }}>{opp.product}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { label: 'Video Length', value: opp.videoLength },
                    { label: 'Deadline', value: new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                    { label: 'Exclusivity', value: opp.exclusivity },
                    { label: 'Usage Rights', value: opp.usageRights },
                  ].map(row => (
                    <div key={row.label} style={{ background: C.surfaceAlt, borderRadius: '6px', padding: '8px' }}>
                      <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600, marginBottom: '2px' }}>{row.label}</div>
                      <div style={{ fontSize: '11px', color: C.text, fontWeight: 500 }}>{row.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '12px', lineHeight: 1.4 }}>{opp.requirement}</div>

                <button
                  onClick={() => {
                    setActiveSponsorship(opp);
                    setActiveView('channel');
                  }}
                  style={{
                    width: '100%',
                    background: C.primary,
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Apply as Creator
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Your Channel */}
        {activeView === 'channel' && (
          <div style={{ maxWidth: '600px' }}>
            {!selectedChannel ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {YOUTUBE_CHANNELS.map((ch, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedChannel(ch)}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>{ch.name}</div>
                      <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '4px' }}>
                        {ch.subscribers} subscribers • {ch.avgViews} avg views
                      </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: C.primary }}>{ch.rate}/video</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedChannel(null)} style={{ marginBottom: '16px', background: 'none', border: 'none', color: C.primary, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  ← Change channel
                </button>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>{selectedChannel.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600, marginBottom: '4px' }}>SUBSCRIBERS</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: C.text }}>{selectedChannel.subscribers}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: C.textMuted, fontWeight: 600, marginBottom: '4px' }}>AVG VIEWS</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: C.text }}>{selectedChannel.avgViews}</div>
                    </div>
                  </div>

                  {activeSponsorship && (
                    <>
                      <div style={{ background: C.surfaceAlt, borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{activeSponsorship.brand}</div>
                        <div style={{ fontSize: '11px', color: C.textSecondary }}>{activeSponsorship.product}</div>
                      </div>

                      {dealState === 'pending' && (
                        <>
                          <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '12px', lineHeight: 1.5 }}>{activeSponsorship.requirement}</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={acceptSponsorship}
                              style={{
                                flex: 1,
                                background: C.primary,
                                border: 'none',
                                color: '#fff',
                                padding: '10px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '13px',
                              }}
                            >
                              Accept {activeSponsorship.budget}
                            </button>
                            <button
                              onClick={() => {
                                setActiveSponsorship(null);
                                setActiveView('browse');
                              }}
                              style={{
                                flex: 1,
                                background: 'transparent',
                                border: `1px solid ${C.border}`,
                                color: C.textSecondary,
                                padding: '10px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '13px',
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        </>
                      )}

                      {dealState === 'in_progress' && (
                        <div>
                          <div style={{ background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: C.accent, marginBottom: '8px' }}>Film & Submit</div>
                            <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '8px' }}>Record your video and submit the YouTube link below</div>
                            <input
                              type="text"
                              value={videoLink}
                              onChange={e => setVideoLink(e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              style={{
                                width: '100%',
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                                borderRadius: '6px',
                                color: C.text,
                                padding: '8px 10px',
                                fontSize: '11px',
                                marginBottom: '8px',
                                boxSizing: 'border-box',
                              }}
                            />
                            <button
                              disabled={!videoLink.match(/youtube\.com\/(watch|youtu\.be)/)}
                              onClick={submitVideo}
                              style={{
                                width: '100%',
                                background: videoLink.match(/youtube\.com\/(watch|youtu\.be)/) ? C.primary : C.border,
                                border: 'none',
                                color: '#fff',
                                padding: '8px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: videoLink.match(/youtube\.com\/(watch|youtu\.be)/) ? 'pointer' : 'not-allowed',
                                opacity: videoLink.match(/youtube\.com\/(watch|youtu\.be)/) ? 1 : 0.5,
                                fontSize: '12px',
                              }}
                            >
                              Submit Video
                            </button>
                          </div>
                        </div>
                      )}

                      {dealState === 'delivered' && (
                        <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.success, marginBottom: '4px' }}>Video Submitted</div>
                          <div style={{ fontSize: '11px', color: C.textSecondary }}>Awaiting brand verification. Usually takes 24-48 hours.</div>
                        </div>
                      )}

                      {dealState === 'verified' && (
                        <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.success, marginBottom: '4px' }}>✓ Verified</div>
                          <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '10px' }}>{activeSponsorship.budget} paid to your account</div>
                        </div>
                      )}

                      {dealState === 'completed' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✓</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: C.success, marginBottom: '4px' }}>Deal Complete</div>
                          <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '16px' }}>Brand approved. Payment transferred.</div>
                          <button
                            onClick={() => {
                              setActiveSponsorship(null);
                              setDealState('pending');
                              setVideoLink('');
                              setActiveView('browse');
                            }}
                            style={{
                              background: C.primary,
                              border: 'none',
                              color: '#fff',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Browse More Sponsorships
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Deals */}
        {activeView === 'deals' && (
          <div style={{ maxWidth: '800px' }}>
            {deals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: C.card, borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: '14px', color: C.textSecondary }}>No active deals yet. Browse sponsorships to get started.</div>
              </div>
            ) : (
              deals.map(deal => (
                <div key={deal.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{deal.sponsor.brand}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: C.primary }}>{deal.rate}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px' }}>
                    Status: <strong style={{ textTransform: 'capitalize' }}>{deal.state}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: C.textMuted }}>{deal.sponsor.requirement}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
