'use client';

import { useState } from 'react';
import {
  MOCK_INSURANCE,
  MOCK_PROTECTION_POOL,
  INSURANCE_TIERS,
  formatCurrency,
  getPoolHealthStatus,
  getClaimStatusColor,
} from '@/lib/insurance';

type Tab = 'coverage' | 'claims' | 'pool';

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('coverage');
  const policy = MOCK_INSURANCE;
  const pool = MOCK_PROTECTION_POOL;
  const healthStatus = getPoolHealthStatus(pool.healthScore);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #262626',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.1))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              Creator Protection
            </h1>
            <p style={{ color: '#8e8e8e', fontSize: '14px' }}>
              Your safety net. Non-payment, income drops, legal defense.
            </p>
          </div>
          <div style={{
            background: policy.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: policy.status === 'active' ? '#10b981' : '#ef4444',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            {policy.status === 'active' ? '✓ Protected' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #262626',
      }}>
        {(['coverage', 'claims', 'pool'] as Tab[]).map(tab => (
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
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'coverage' && <CoverageTab policy={policy} />}
        {activeTab === 'claims' && <ClaimsTab policy={policy} />}
        {activeTab === 'pool' && <PoolTab pool={pool} healthStatus={healthStatus} />}
      </div>
    </div>
  );
}

function CoverageTab({ policy }: { policy: typeof MOCK_INSURANCE }) {
  const tierInfo = INSURANCE_TIERS[policy.tier];

  return (
    <>
      {/* Policy Card */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
          {policy.tier} Protection
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
          Up to {formatCurrency(policy.coverage.nonPaymentMax)}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Policy ID</div>
            <div style={{ fontSize: '13px' }}>{policy.policyId}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Renews</div>
            <div style={{ fontSize: '13px' }}>{policy.renewalDate.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Your Coverage</div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span>Non-Payment Protection</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(policy.coverage.nonPaymentMax)}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
            Brand doesn't pay? We cover it.
          </div>
        </div>

        <div style={{ borderTop: '1px solid #262626', paddingTop: '12px', marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span>Income Protection</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(policy.coverage.incomeProtectionMonthly)}/mo</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
            Sudden income drop? We help bridge the gap.
          </div>
        </div>

        <div style={{ borderTop: '1px solid #262626', paddingTop: '12px', marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span>Legal Defense</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(policy.coverage.legalDefenseMax)}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
            False claims or platform disputes? We fund your defense.
          </div>
        </div>

        <div style={{ borderTop: '1px solid #262626', paddingTop: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span>Emergency Fund</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(policy.coverage.emergencyFundMax)}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
            Life happens. We're here to help.
          </div>
        </div>
      </div>

      {/* Contributions */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Your Contributions</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Contributed</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {formatCurrency(policy.contributions.totalContributed)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Last Contribution</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {formatCurrency(policy.contributions.lastContribution)}
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#8e8e8e',
        }}>
          2% of each deal automatically goes to the protection pool
        </div>
      </div>

      {/* Upgrade Options */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Upgrade Coverage</div>

        {Object.entries(INSURANCE_TIERS)
          .filter(([tier]) => tier !== policy.tier && tier !== 'Basic')
          .slice(0, 2)
          .map(([tier, info]) => (
            <div key={tier} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#262626',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{tier}</div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                  Up to {formatCurrency(info.nonPaymentMax)}
                </div>
              </div>
              <button style={{
                background: '#8b5cf6',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
              }}>
                {formatCurrency(info.monthlyPremium)}/mo
              </button>
            </div>
          ))}
      </div>
    </>
  );
}

function ClaimsTab({ policy }: { policy: typeof MOCK_INSURANCE }) {
  return (
    <>
      {/* File Claim CTA */}
      <button style={{
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #ef4444, #f97316)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '20px',
        cursor: 'pointer',
      }}>
        File a Claim
      </button>

      {/* Claims Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {formatCurrency(policy.totalClaimsPaid)}
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Paid to You</div>
        </div>
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {policy.eligibility.claimsLast12Months}/3
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Claims This Year</div>
        </div>
      </div>

      {/* Claims History */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Claims History</div>

        {policy.claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8e8e8e' }}>
            No claims filed yet
          </div>
        ) : (
          policy.claims.map(claim => (
            <div key={claim.id} style={{
              padding: '12px',
              background: '#262626',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px',
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {claim.type.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                    {claim.submittedAt.toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  background: `${getClaimStatusColor(claim.status)}20`,
                  color: getClaimStatusColor(claim.status),
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                }}>
                  {claim.status}
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '8px' }}>
                {claim.description}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
              }}>
                <span>Requested: {formatCurrency(claim.amount)}</span>
                {claim.amountApproved && (
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    Paid: {formatCurrency(claim.amountApproved)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function PoolTab({ pool, healthStatus }: { pool: typeof MOCK_PROTECTION_POOL; healthStatus: { status: string; color: string } }) {
  return (
    <>
      {/* Pool Health */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '8px' }}>
          Pool Health
        </div>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: healthStatus.color,
          marginBottom: '8px',
        }}>
          {pool.healthScore}%
        </div>
        <div style={{
          background: `${healthStatus.color}20`,
          color: healthStatus.color,
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'inline-block',
          textTransform: 'capitalize',
        }}>
          {healthStatus.status}
        </div>
      </div>

      {/* Pool Stats */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Pool Stats</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Balance</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {formatCurrency(pool.totalBalance)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Runway</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {pool.runwayMonths} months
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Policies</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {pool.totalPolicies.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Approval Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {pool.claimApprovalRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Transparency */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Full Transparency</div>
        <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
          The protection pool is managed on-chain. Anyone can verify.
        </div>

        <div style={{
          background: '#262626',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '12px',
          wordBreak: 'break-all',
        }}>
          🔗 {pool.onChainAddress}
        </div>

        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#8e8e8e',
        }}>
          Last audited: {pool.lastAudit.toLocaleDateString()}
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>How It's Funded</div>
        <div style={{ fontSize: '13px', color: '#8e8e8e', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>{pool.contributionRate}% of every deal</strong> goes
            into the protection pool automatically.
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>Creators vote on claims</strong> - the community
            decides who gets paid.
          </p>
          <p>
            <strong style={{ color: '#fff' }}>On-chain governance</strong> - everything is
            transparent and verifiable.
          </p>
        </div>
      </div>
    </>
  );
}
