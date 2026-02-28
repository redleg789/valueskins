'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, CollectiveDetail, MarketRate } from '@/lib/api';

type Tab = 'guild' | 'auctions' | 'rates';

function cents(n: number): string {
  return '$' + (n / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export default function CollectivePage() {
  const [activeTab, setActiveTab] = useState<Tab>('guild');

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #262626',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.1))',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Creator Collective
        </h1>
        <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
          Negotiate together. Win together. Brands compete for YOU.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #262626' }}>
        {(['guild', 'auctions', 'rates'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
              color: activeTab === tab ? '#fff' : '#8e8e8e',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'guild' ? '⚔️ Guild' : tab === 'auctions' ? '🔥 Auctions' : '📊 Rates'}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'guild' && <GuildTab />}
        {activeTab === 'auctions' && <AuctionsTab />}
        {activeTab === 'rates' && <RatesTab />}
      </div>
    </div>
  );
}

function GuildTab() {
  const [collective, setCollective] = useState<CollectiveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollective = useCallback(async () => {
    setLoading(true);
    setError(null);

    const listResult = await api.collective.listCollectives();
    if (listResult.error || !listResult.data) {
      setError(listResult.error ?? 'Failed to load collectives.');
      setLoading(false);
      return;
    }

    const collectives = listResult.data.collectives;
    if (collectives.length === 0) {
      setError('No collectives found.');
      setLoading(false);
      return;
    }

    const detailResult = await api.collective.getCollective(collectives[0].id);
    if (detailResult.error || !detailResult.data) {
      setError(detailResult.error ?? 'Failed to load collective details.');
      setLoading(false);
      return;
    }

    setCollective(detailResult.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCollective();
  }, [fetchCollective]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#8e8e8e' }}>
        Loading guild data...
      </div>
    );
  }

  if (error || !collective) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        color: '#ef4444',
        textAlign: 'center',
      }}>
        {error ?? 'No collective data available.'}
        <button
          onClick={fetchCollective}
          style={{
            display: 'block',
            margin: '12px auto 0',
            padding: '8px 16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Guild Card */}
      <div style={{
        background: 'linear-gradient(135deg, #ef4444, #f97316)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            ⚔️
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{collective.name}</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              {collective.total_members.toLocaleString()} members
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Combined Reach</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {(collective.total_combined_followers / 1e6).toFixed(1)}M
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Avg Deal</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {cents(collective.stats.avg_deal_value_cents)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Rate Boost</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fef08a' }}>
              +{collective.stats.avg_rate_increase_pct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Your Membership */}
      {collective.my_role && (
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Your Membership</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', textTransform: 'capitalize' }}>{collective.my_role}</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                {collective.voting_threshold}% voting threshold
              </div>
            </div>
            <div style={{
              background: 'rgba(234, 179, 8, 0.2)',
              color: '#fbbf24',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
            }}>
              ⭐ {collective.my_role}
            </div>
          </div>
        </div>
      )}

      {/* Minimum Rates */}
      {collective.minimum_rates.length > 0 && (
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Guild Minimum Rates</div>
          <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
            These are the minimum rates all guild members agree to charge. Brands can&apos;t lowball us.
          </p>

          {collective.minimum_rates.map(rate => (
            <div key={rate.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#262626',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {rate.content_type}
                  {rate.platform ? ` · ${rate.platform}` : ''}
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{rate.per_metric}</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                {cents(rate.min_rate_cents)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blacklisted Brands */}
      {collective.blacklisted_brands.length > 0 && (
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#ef4444' }}>
            ⚠️ Blacklisted Brands
          </div>

          {collective.blacklisted_brands.map(brand => (
            <div key={brand.id} style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{brand.brand_name}</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>{brand.reason}</div>
              {brand.blacklisted_until && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                  Until: {new Date(brand.blacklisted_until).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Treasury */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Guild Treasury</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          {cents(collective.treasury_balance_cents)}
        </div>
        <div style={{ fontSize: '13px', color: '#8e8e8e' }}>
          For legal defense, strike funds, and guild operations
        </div>
      </div>
    </>
  );
}

function AuctionsTab() {
  return (
    <>
      {/* Create Auction CTA */}
      <button
        disabled
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '20px',
          cursor: 'not-allowed',
          opacity: 0.6,
        }}
      >
        + Create Your Own Auction
      </button>

      {/* Coming Soon */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '40px 24px',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
          Auctions Coming Soon
        </div>
        <p style={{ fontSize: '14px', color: '#8e8e8e', lineHeight: '1.6' }}>
          Brand sponsorship auctions are in development. Soon you&apos;ll be able to let brands compete for your content slots in real time.
        </p>
      </div>

      {/* How It Works */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>How Auctions Will Work</div>
        <div style={{ fontSize: '13px', color: '#8e8e8e', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>1. Set your terms</strong> — Define what you&apos;re offering and minimum price
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>2. Brands compete</strong> — Multiple brands bid against each other
          </p>
          <p>
            <strong style={{ color: '#fff' }}>3. You choose</strong> — Accept the highest bid or set a Buy Now price
          </p>
        </div>
      </div>
    </>
  );
}

function RatesTab() {
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await api.collective.getMarketRates();
    if (result.error || !result.data) {
      setError(result.error ?? 'Failed to load market rates.');
      setLoading(false);
      return;
    }

    setRates(result.data.rates);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#8e8e8e' }}>
        Loading market rates...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        color: '#ef4444',
        textAlign: 'center',
      }}>
        {error}
        <button
          onClick={fetchRates}
          style={{
            display: 'block',
            margin: '12px auto 0',
            padding: '8px 16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalDataPoints = rates.reduce((sum, r) => sum + r.data_points, 0);

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1))',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          📊 Market Rate Intelligence
        </div>
        <p style={{ fontSize: '13px', color: '#8e8e8e' }}>
          Real-time rates based on {totalDataPoints.toLocaleString()} deals.
          Never get lowballed again.
        </p>
      </div>

      {rates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#8e8e8e', fontSize: '14px' }}>
          No market rate data available yet.
        </div>
      )}

      {rates.map((rate, i) => (
        <div key={i} style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{rate.content_type}</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                {rate.category} · {rate.platform} · Level {rate.level}
              </div>
            </div>
            <div style={{
              background: rate.trend === 'rising' ? 'rgba(16, 185, 129, 0.2)' :
                         rate.trend === 'falling' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)',
              color: rate.trend === 'rising' ? '#10b981' :
                     rate.trend === 'falling' ? '#ef4444' : '#6b7280',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
            }}>
              {rate.trend === 'rising' ? '↑' : rate.trend === 'falling' ? '↓' : '→'}{' '}
              {Math.abs(rate.change_last_month_pct).toFixed(1)}%
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            fontSize: '11px',
          }}>
            <div style={{
              background: '#262626',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#8e8e8e', marginBottom: '4px' }}>Min</div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                {cents(rate.min_rate_cents)}
              </div>
            </div>
            <div style={{
              background: '#262626',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <div style={{ color: '#10b981', marginBottom: '4px' }}>Median</div>
              <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#10b981' }}>
                {cents(rate.median_rate_cents)}
              </div>
            </div>
            <div style={{
              background: '#262626',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#8e8e8e', marginBottom: '4px' }}>Max</div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                {cents(rate.max_rate_cents)}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '8px', textAlign: 'right' }}>
            Based on {rate.data_points.toLocaleString()} deals
          </div>
        </div>
      ))}
    </>
  );
}
