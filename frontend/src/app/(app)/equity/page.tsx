'use client';

import { useState } from 'react';
import {
  MOCK_CREATOR_EQUITY,
  MOCK_EQUITY_POOL,
  getEquityDashboardData,
  TIER_MULTIPLIERS,
  formatCurrency,
} from '@/lib/equity';

export default function EquityPage() {
  const [showExitScenarios, setShowExitScenarios] = useState(false);
  const dashboardData = getEquityDashboardData(MOCK_CREATOR_EQUITY, MOCK_EQUITY_POOL);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #262626',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1))',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Your Equity
        </h1>
        <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
          You own a piece of Valueskins. The more you contribute, the more you earn.
        </p>
      </div>

      {/* Token Balance Card */}
      <div style={{ padding: '20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
            Your Tokens
          </div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '8px' }}>
            {dashboardData.account.tokens.vested.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            + {dashboardData.account.tokens.unvested.toLocaleString()} unvested
          </div>

          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Current Value</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${(dashboardData.account.tokens.vested * MOCK_EQUITY_POOL.pricePerToken).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Ownership</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {dashboardData.ownershipPercentage.toFixed(4)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Tier</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {dashboardData.account.tier}
              </div>
            </div>
          </div>
        </div>

        {/* Tier Benefits */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>
            {dashboardData.account.tier} Tier Benefits
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.2)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
            }}>
              <span style={{ color: '#a78bfa' }}>
                {TIER_MULTIPLIERS[dashboardData.account.tier]}x
              </span> earning rate
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
            }}>
              Quarterly dividends
            </div>
          </div>
        </div>

        {/* Dividends Section */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <div style={{ fontWeight: 'bold' }}>Dividends</div>
            <div style={{ color: '#10b981', fontSize: '14px' }}>
              Next: {formatCurrency(dashboardData.account.dividends.nextEstimatedPayout)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{
              background: '#262626',
              borderRadius: '8px',
              padding: '12px',
            }}>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Earned</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {formatCurrency(dashboardData.account.dividends.totalEarned)}
              </div>
            </div>
            <div style={{
              background: '#262626',
              borderRadius: '8px',
              padding: '12px',
            }}>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Last Payout</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {formatCurrency(dashboardData.account.dividends.lastPayout)}
              </div>
            </div>
          </div>
        </div>

        {/* Exit Scenarios */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
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
            <span>💰 What if Valueskins exits?</span>
            <span>{showExitScenarios ? '▲' : '▼'}</span>
          </button>

          {showExitScenarios && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#8e8e8e', fontSize: '13px', marginBottom: '16px' }}>
                10% of any exit goes to creator token holders. Here's what you'd earn:
              </p>
              {dashboardData.exitScenarios.map((scenario, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#262626',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{scenario.name}</div>
                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                      Exit: ${(scenario.exitValueUsd / 1e9).toFixed(1)}B
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                      ${scenario.yourEstimatedPayout.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8e8e8e' }}>your payout</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vesting Schedule */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Vesting Schedule</div>

          {dashboardData.nextVestingEvent && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
            }}>
              <div style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '4px' }}>
                Next Vesting
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>
                  +{dashboardData.nextVestingEvent.tokens} tokens
                </span>
                <span style={{ color: '#8e8e8e' }}>
                  {dashboardData.nextVestingEvent.vestDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {dashboardData.account.tokens.vestingSchedule
            .filter(e => e.status === 'vested')
            .slice(-3)
            .map((event, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #262626',
                fontSize: '14px',
              }}>
                <span>+{event.tokens} tokens</span>
                <span style={{ color: '#10b981' }}>✓ Vested</span>
              </div>
            ))}
        </div>

        {/* Pool Stats */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Creator Equity Pool</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Pool Value</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                ${(MOCK_EQUITY_POOL.poolValueUsd / 1e6).toFixed(1)}M
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Token Price</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                ${MOCK_EQUITY_POOL.pricePerToken.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Holders</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {MOCK_EQUITY_POOL.totalCreatorsHolding.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Next Dividend</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {MOCK_EQUITY_POOL.nextDividendDate.toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#262626',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#8e8e8e',
          }}>
            🔗 Pool address: {MOCK_EQUITY_POOL.totalTokensIssued > 0 ? '0x7a3b...4f2e' : 'Coming soon'}
            <br />
            All tokens are on-chain and verifiable.
          </div>
        </div>
      </div>
    </div>
  );
}
