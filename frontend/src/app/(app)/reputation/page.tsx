'use client';

import { useState, useEffect } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { api } from '@/lib/api';

/**
 * PORTABLE REPUTATION PASSPORT
 *
 * Ed25519-signed, verifiable by brands.
 * Creators can share this with any platform.
 * No vendor lock-in.
 */

export default function ReputationPage() {
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPassport = async () => {
      setLoading(true);
      try {
        const res = await api.reputation.exportPassport();
        if (res.data) setPassport(res.data.passport);
      } catch (err) {
        console.error('Failed to load passport:', err);
      }
      setLoading(false);
    };

    loadPassport();
  }, []);

  const handleCopy = () => {
    const url = `${window.location.origin}/verify/${passport.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const json = JSON.stringify(passport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reputation-passport-${passport.id}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  if (loading) {
    return <PlatformLayout title="Reputation"><div style={{ padding: 20 }}>Loading...</div></PlatformLayout>;
  }

  return (
    <PlatformLayout title="Reputation Passport">
      <div style={{ padding: 16, maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>📜 Your Reputation Passport</h2>
          <p style={{ color: 'var(--ig-text-secondary)', fontSize: 14 }}>
            Cryptographically signed. Verifiable by any brand. Portable across platforms.
          </p>
        </div>

        {passport && (
          <>
            {/* Main Card */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              borderRadius: 16,
              padding: 32,
              color: 'white',
              marginBottom: 24,
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
            }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎖️</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{passport.creator_name}</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Verified Creator • {passport.export_version > 1 ? `${passport.export_version} updates` : 'Initial passport'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Deals Completed</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{passport.deal_count}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Completion Rate</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{passport.completion_rate_pct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>On-Time Delivery</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{passport.on_time_rate_pct}%</div>
                </div>
              </div>

              <div style={{ fontSize: 12, opacity: 0.8 }}>
                🔐 Signed: {new Date(passport.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Share Options */}
            <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 20, border: '1px solid var(--ig-separator)', marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Share Your Passport</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'var(--ig-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copied' : '📋 Copy Link'}
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'var(--ig-separator)',
                    color: 'var(--ig-text-secondary)',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📥 Download JSON
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 20, border: '1px solid var(--ig-separator)', marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Reputation Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>Average Deal Value</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    ${(passport.avg_deal_cents / 100).toLocaleString('en-US')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>Testimonials</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{passport.testimonial_count} reviews</div>
                </div>
              </div>
            </div>

            {/* Trust Scores */}
            {passport.trust_scores_snapshot && (
              <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 20, border: '1px solid var(--ig-separator)' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Trust Scores</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(passport.trust_scores_snapshot).map(([key, value]: [string, any]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</div>
                      <div style={{
                        width: 200,
                        height: 8,
                        background: 'var(--ig-separator)',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${value}%`,
                          background: value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, padding: 16, background: 'var(--ig-elevated)', borderRadius: 12, fontSize: 12, color: 'var(--ig-text-secondary)', lineHeight: 1.6 }}>
          <strong>What is a Reputation Passport?</strong><br/>
          A cryptographically signed record of your deal history, completion rates, and trust scores.
          Unlike other platforms, your reputation is portable and verifiable — no vendor lock-in.
          Share it with brands, other platforms, or agencies to prove your track record.
        </div>
      </div>
    </PlatformLayout>
  );
}
