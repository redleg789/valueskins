'use client';

import { useState, useEffect } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { api } from '@/lib/api';

/**
 * PRICING AUTHORITY DASHBOARD
 *
 * Answers the critical question: "What am I worth?"
 * - Market benchmarks (p25, median, p75) by niche
 * - Personal valuation based on profile
 * - Market trends
 */

export default function PricingPage() {
  const [category, setCategory] = useState('tech');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('reel');
  const [level, setLevel] = useState(3);

  const [benchmark, setBenchmark] = useState<any>(null);
  const [myWorth, setMyWorth] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['tech', 'fashion', 'fitness', 'crypto', 'finance', 'entertainment'];
  const platforms = ['instagram', 'tiktok', 'youtube'];
  const contentTypes = ['reel', 'post', 'story', 'video', 'carousel'];
  const levels = [1, 2, 3, 4, 5];

  useEffect(() => {
    const loadBenchmark = async () => {
      setLoading(true);
      try {
        const res = await api.pricing.getBenchmark({ category, platform, content_type: contentType, level });
        if (res.data) setBenchmark(res.data.benchmark);
      } catch (err) {
        console.error('Failed to load benchmark:', err);
      }
      setLoading(false);
    };

    loadBenchmark();
  }, [category, platform, contentType, level]);

  useEffect(() => {
    const loadMyWorth = async () => {
      try {
        const res = await api.pricing.getMyWorth();
        if (res.data) setMyWorth(res.data.valuation);
      } catch (err) {
        console.error('Failed to load personal valuation:', err);
      }
    };

    loadMyWorth();
  }, []);

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <PlatformLayout title="Pricing Authority">
      <div style={{ padding: 16, maxWidth: 1200 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>What's the Market Paying?</h2>
          <p style={{ color: 'var(--ig-text-secondary)', fontSize: 14 }}>
            Industry benchmarks based on {benchmark?.data_points || 0} completed deals. Updated weekly.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--ig-card)',
                border: '1px solid var(--ig-separator)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--ig-text-primary)',
              }}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--ig-card)',
                border: '1px solid var(--ig-separator)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--ig-text-primary)',
              }}
            >
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--ig-card)',
                border: '1px solid var(--ig-separator)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--ig-text-primary)',
              }}
            >
              {contentTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--ig-card)',
                border: '1px solid var(--ig-separator)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--ig-text-primary)',
              }}
            >
              {levels.map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
        </div>

        {/* Benchmark Card */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ig-text-tertiary)' }}>Loading benchmark...</div>
        ) : benchmark ? (
          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 24, border: '1px solid var(--ig-separator)', marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 20 }}>
              Market Range: {category.toUpperCase()} • {platform.toUpperCase()} • {contentType} • Level {level}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--ig-elevated)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>25th Percentile</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ig-blue)' }}>
                  {formatCurrency(benchmark.p25_rate_cents)}
                </div>
              </div>

              <div style={{ background: 'var(--ig-elevated)', padding: 16, borderRadius: 10, textAlign: 'center', border: '2px solid var(--ig-blue)' }}>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>Median (Recommended)</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ig-blue)' }}>
                  {formatCurrency(benchmark.median_rate_cents)}
                </div>
              </div>

              <div style={{ background: 'var(--ig-elevated)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>75th Percentile</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ig-blue)' }}>
                  {formatCurrency(benchmark.p75_rate_cents)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--ig-separator)' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>Trend</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  {benchmark.trend === 'rising' && '📈 Rising'}
                  {benchmark.trend === 'stable' && '➡️ Stable'}
                  {benchmark.trend === 'falling' && '📉 Falling'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>Change (30 days)</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: benchmark.change_last_month_pct > 0 ? '#10b981' : '#ef4444' }}>
                  {benchmark.change_last_month_pct > 0 ? '+' : ''}{benchmark.change_last_month_pct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>Sample Size</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{benchmark.data_points} deals</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Personal Valuation */}
        {myWorth && (
          <div style={{ background: 'linear-gradient(135deg, var(--ig-blue)20, transparent)', borderRadius: 12, padding: 24, border: '1px solid var(--ig-separator)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Your Valuation</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>Recommended Rate</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ig-blue)' }}>
                  {formatCurrency(myWorth.recommended_rate_cents)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>Trust Score Impact</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{myWorth.trust_score}/100</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>Based on</div>
                <div style={{ fontSize: 13 }}>
                  {myWorth.completed_deals} completed deals<br/>
                  Avg: {formatCurrency(myWorth.avg_deal_cents)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
}
