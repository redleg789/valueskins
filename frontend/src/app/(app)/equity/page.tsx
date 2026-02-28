'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, EquityDashboard } from '@/lib/api';

const TIER_MULTIPLIERS: Record<string, number> = {
  Bronze: 1,
  Silver: 1.5,
  Gold: 2,
  Platinum: 3,
  Diamond: 5,
};

const EXIT_SCENARIOS = [
  { name: 'Conservative', exitValueUsd: 1_000_000_000 },
  { name: 'Moderate', exitValueUsd: 5_000_000_000 },
  { name: 'Optimistic', exitValueUsd: 10_000_000_000 },
  { name: 'Moonshot', exitValueUsd: 50_000_000_000 },
] as const;

/** Convert cents to a formatted dollar string */
function formatCents(cents: number): string {
  return '$' + (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function EquityPage() {
  const [showExitScenarios, setShowExitScenarios] = useState(false);
  const [data, setData] = useState<EquityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.equity.getMyEquity();
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load equity data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquity();
  }, [fetchEquity]);

  if (loading) {
    return (
      <div
        style={{
          background: '#000',
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #262626',
              borderTop: '3px solid #8b5cf6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
            Loading your equity...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          background: '#000',
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>!</div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            Something went wrong
          </p>
          <p style={{ color: '#8e8e8e', fontSize: '14px', marginBottom: '20px' }}>
            {error ?? 'Unable to load equity data. Please try again.'}
          </p>
          <button
            onClick={fetchEquity}
            style={{
              background: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { account, vesting_events, pool, ownership_pct } = data;

  const pricePerToken = pool ? pool.price_per_token_cents / 100 : 0;
  const currentValueDollars = account.vested_tokens * pricePerToken;
  const tierMultiplier = TIER_MULTIPLIERS[account.tier] ?? account.multiplier;

  // Revenue share percentage for exit scenario calculations (defaults to 10%)
  const revenueSharePct = pool ? pool.revenue_share_pct : 10;

  const exitScenarios = EXIT_SCENARIOS.map((scenario) => {
    const creatorPool = scenario.exitValueUsd * (revenueSharePct / 100);
    const yourPayout = creatorPool * (ownership_pct / 100);
    return {
      name: scenario.name,
      exitValueUsd: scenario.exitValueUsd,
      yourEstimatedPayout: Math.round(yourPayout),
    };
  });

  const nextVestingEvent = vesting_events.find((e) => e.status === 'pending');
  const vestedEvents = vesting_events
    .filter((e) => e.status === 'vested')
    .slice(-3);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #262626',
          background:
            'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1))',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Your Equity
        </h1>
        <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
          You own a piece of Valueskins. The more you contribute, the more you
          earn.
        </p>
      </div>

      {/* Token Balance Card */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
            Your Tokens
          </div>
          <div
            style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '8px' }}
          >
            {account.vested_tokens.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            + {account.unvested_tokens.toLocaleString()} unvested
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Current Value</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${currentValueDollars.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Ownership</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {ownership_pct.toFixed(4)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Tier</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {account.tier}
              </div>
            </div>
          </div>
        </div>

        {/* Tier Benefits */}
        <div
          style={{
            background: '#1c1c1e',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>
            {account.tier} Tier Benefits
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <span style={{ color: '#a78bfa' }}>{tierMultiplier}x</span> earning
              rate
            </div>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              Quarterly dividends
            </div>
          </div>
        </div>

        {/* Dividends Section */}
        <div
          style={{
            background: '#1c1c1e',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>Dividends</div>
            {pool && pool.next_dividend_at && (
              <div style={{ color: '#10b981', fontSize: '14px' }}>
                Next:{' '}
                {new Date(pool.next_dividend_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div
              style={{
                background: '#262626',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                Total Earned
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {formatCents(account.dividends.total_earned)}
              </div>
            </div>
            <div
              style={{
                background: '#262626',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                Last Payout
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {formatCents(account.dividends.last_payout)}
              </div>
            </div>
          </div>
        </div>

        {/* Exit Scenarios */}
        <div
          style={{
            background: '#1c1c1e',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setShowExitScenarios(!showExitScenarios)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            <span>What if Valueskins exits?</span>
            <span>{showExitScenarios ? '\u25B2' : '\u25BC'}</span>
          </button>

          {showExitScenarios && (
            <div style={{ marginTop: '16px' }}>
              <p
                style={{
                  color: '#8e8e8e',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {revenueSharePct}% of any exit goes to creator token holders.
                Here's what you'd earn:
              </p>
              {exitScenarios.map((scenario, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#262626',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {scenario.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                      Exit: ${(scenario.exitValueUsd / 1e9).toFixed(1)}B
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#10b981',
                      }}
                    >
                      ${scenario.yourEstimatedPayout.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8e8e8e' }}>
                      your payout
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vesting Schedule */}
        <div
          style={{
            background: '#1c1c1e',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>
            Vesting Schedule
          </div>

          {nextVestingEvent && (
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#a78bfa',
                  marginBottom: '4px',
                }}
              >
                Next Vesting
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span style={{ fontWeight: 'bold' }}>
                  +{nextVestingEvent.tokens} tokens
                </span>
                <span style={{ color: '#8e8e8e' }}>
                  {new Date(nextVestingEvent.vest_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {vestedEvents.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #262626',
                fontSize: '14px',
              }}
            >
              <span>+{event.tokens} tokens</span>
              <span style={{ color: '#10b981' }}>Vested</span>
            </div>
          ))}
        </div>

        {/* Pool Stats */}
        {pool && (
          <div
            style={{
              background: '#1c1c1e',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>
              Creator Equity Pool
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Pool Value
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  ${(pool.pool_value_cents / 100 / 1e6).toFixed(1)}M
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Token Price
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  ${(pool.price_per_token_cents / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Total Holders
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {pool.total_creators_holding.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Next Dividend
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {pool.next_dividend_at
                    ? new Date(pool.next_dividend_at).toLocaleDateString()
                    : 'TBD'}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#262626',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#8e8e8e',
              }}
            >
              Revenue share: {pool.revenue_share_pct}% allocated to creators
              <br />
              Total revenue allocated:{' '}
              {formatCents(pool.total_revenue_allocated_cents)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
