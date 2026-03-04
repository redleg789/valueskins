'use client';

import { useState, useEffect } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { api } from '@/lib/api';

/**
 * CREATOR CREDIT LINES
 *
 * Deterministic credit scoring based on:
 * - Completed deals
 * - Average deal value
 * - Trust score
 * - Months active
 *
 * Draw advances tied to active deals.
 */

export default function CreditPage() {
  const [credit, setCredit] = useState<any>(null);
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredit = async () => {
      setLoading(true);
      try {
        const res = await api.credit.getStatus();
        if (res.data) setCredit(res.data.credit_line);

        const advRes = await api.credit.getAdvances();
        if (advRes.data) setAdvances(advRes.data.advances);
      } catch (err) {
        console.error('Failed to load credit:', err);
      }
      setLoading(false);
    };

    loadCredit();
  }, []);

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const creditScoreBadge = (score: number) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent' };
    if (score >= 60) return { color: '#f59e0b', label: 'Good' };
    return { color: '#ef4444', label: 'Fair' };
  };

  if (loading) {
    return <PlatformLayout title="Credit Line"><div style={{ padding: 20 }}>Loading...</div></PlatformLayout>;
  }

  const badge = credit ? creditScoreBadge(credit.credit_score) : null;

  return (
    <PlatformLayout title="Creator Credit Line">
      <div style={{ padding: 16, maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>💳 Your Credit Line</h2>
          <p style={{ color: 'var(--ig-text-secondary)', fontSize: 14 }}>
            Draw advances based on your deal history and trust score.
          </p>
        </div>

        {/* Credit Score Card */}
        {credit && (
          <div style={{ background: 'linear-gradient(135deg, var(--ig-blue)20, transparent)', borderRadius: 12, padding: 24, border: '1px solid var(--ig-separator)', marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 8 }}>
                  CREDIT SCORE
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontSize: 40, fontWeight: 700 }}>{credit.credit_score}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: badge?.color, marginBottom: 4 }}>
                    {badge?.label}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 8 }}>
                  Based on {credit.completed_deals} deals
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 8 }}>
                  CREDIT LIMIT
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                  {formatCurrency(credit.credit_limit_cents)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                  <span>Used: {formatCurrency(credit.used_cents)}</span>
                  <span>Available: {formatCurrency(credit.available_cents)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 8 }}>
                  SCORE FACTORS
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  <div>✓ {credit.completed_deals} completed deals</div>
                  <div>✓ Avg {formatCurrency(credit.avg_deal_cents)}/deal</div>
                  <div>✓ {credit.months_active} months active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Advances */}
        {advances.length > 0 && (
          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 20, border: '1px solid var(--ig-separator)', marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Active Advances</div>
            {advances.map((adv, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 0',
                  borderBottom: i < advances.length - 1 ? '1px solid var(--ig-separator)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600 }}>
                    {formatCurrency(adv.amount_cents)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                    Status: {adv.status}
                  </div>
                </div>
                {adv.repayment_due_at && (
                  <div style={{ fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                    Due: {new Date(adv.repayment_due_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Score Explanation */}
        <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 20, border: '1px solid var(--ig-separator)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>How Your Score is Calculated</div>
          <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)', lineHeight: 1.8 }}>
            <p>Your credit score is completely deterministic and based on:</p>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              <li><strong>Deal completion rate:</strong> % of deals completed on time</li>
              <li><strong>Average deal value:</strong> Higher-value deals = stronger credit</li>
              <li><strong>Trust score:</strong> No ghosting, revision abuse, or disputes</li>
              <li><strong>Months active:</strong> Longer track record = higher credit</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              <strong>How to improve:</strong> Complete more deals, increase deal sizes, maintain perfect trust score.
            </p>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
