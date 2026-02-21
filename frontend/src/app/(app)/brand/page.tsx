'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS } from '@/lib/professions';
import {
  MOCK_BRAND,
  MOCK_CAMPAIGNS,
  MOCK_BRAND_DASHBOARD,
  MOCK_CREATOR_DISCOVERY,
  Campaign,
  getCampaignStatusInfo,
  formatNumber,
} from '@/lib/brand';
import { formatCurrency } from '@/lib/deals';
import { VERIFICATION_BADGES } from '@/lib/verification';

/*
 * PATENT-RELEVANT: B2B Brand Management Dashboard
 * ──────────────────────────────────────────────────────────────────────────
 * This is the BRAND VIEW of the marketplace:
 * - Create campaigns
 * - Discover and vet creators
 * - Track ROI
 * - Manage active deals
 *
 * REVENUE MODEL: Brands pay 15% platform fee on all creator payments.
 */

type Tab = 'overview' | 'campaigns' | 'discover' | 'history';

export default function BrandDashboardPage() {
  const router = useRouter();
  const { activePlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const platformConfig = PLATFORM_CONFIGS[activePlatform];
  const accentColor = platformConfig.primaryColor;

  const brand = MOCK_BRAND;
  const dashboard = MOCK_BRAND_DASHBOARD;

  return (
    <PlatformLayout title="Brand Dashboard">
      <div style={{ padding: '0' }}>
        {/* Brand Header */}
        <div style={{
          padding: '16px',
          background: `linear-gradient(135deg, ${accentColor}20, transparent)`,
          borderBottom: '1px solid var(--ig-separator)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#fff',
              fontWeight: 700,
            }}>
              {brand.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{brand.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                {brand.industry} • {brand.size.charAt(0).toUpperCase() + brand.size.slice(1)}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <MetricCard
              label="Total Spent"
              value={formatCurrency(dashboard.totalSpent)}
              color={accentColor}
            />
            <MetricCard
              label="Total Reach"
              value={formatNumber(dashboard.totalReach)}
              color="#0095f6"
            />
            <MetricCard
              label="Avg ROI"
              value={`${dashboard.averageROI}x`}
              color="#10b981"
            />
            <MetricCard
              label="Creators"
              value={String(dashboard.totalCreatorsWorkedWith)}
              color="#f59e0b"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--ig-separator)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {(['overview', 'campaigns', 'discover', 'history'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                minWidth: 80,
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--ig-text-primary)' : 'var(--ig-text-tertiary)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '16px' }}>
          {activeTab === 'overview' && (
            <OverviewTab dashboard={dashboard} accentColor={accentColor} />
          )}
          {activeTab === 'campaigns' && (
            <CampaignsTab campaigns={MOCK_CAMPAIGNS} accentColor={accentColor} />
          )}
          {activeTab === 'discover' && (
            <DiscoverTab creators={MOCK_CREATOR_DISCOVERY} accentColor={accentColor} />
          )}
          {activeTab === 'history' && (
            <HistoryTab accentColor={accentColor} />
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '10px 8px',
      background: 'var(--ig-card)',
      borderRadius: 8,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function OverviewTab({
  dashboard,
  accentColor,
}: {
  dashboard: typeof MOCK_BRAND_DASHBOARD;
  accentColor: string;
}) {
  return (
    <div>
      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button style={{
          flex: 1,
          padding: '14px',
          background: accentColor,
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          + New Campaign
        </button>
        <button style={{
          flex: 1,
          padding: '14px',
          background: 'var(--ig-card)',
          color: 'var(--ig-text-primary)',
          border: '1px solid var(--ig-separator)',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Find Creators
        </button>
      </div>

      {/* Pending Applications */}
      <div style={{
        padding: '14px',
        background: '#f59e0b15',
        borderRadius: 12,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
        }}>
          {dashboard.pendingApplications}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Pending Applications</div>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
            Creators waiting for your review
          </div>
        </div>
        <button style={{
          padding: '8px 16px',
          background: '#f59e0b',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Review
        </button>
      </div>

      {/* Top Performer */}
      {dashboard.topCreator && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Top Performer</div>
          <div style={{
            padding: '14px',
            background: 'var(--ig-card)',
            borderRadius: 12,
            border: '1px solid var(--ig-separator)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20 }}>👑</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{dashboard.topCreator.name}</div>
              <div style={{ fontSize: 12, color: '#10b981' }}>{dashboard.topCreator.roi}x ROI</div>
            </div>
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              color: accentColor,
              border: `1px solid ${accentColor}`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Rebook
            </button>
          </div>
        </div>
      )}

      {/* Spend Trend */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Monthly Spend</div>
        <div style={{
          background: 'var(--ig-card)',
          borderRadius: 12,
          padding: '14px',
          border: '1px solid var(--ig-separator)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 80,
            gap: 8,
          }}>
            {dashboard.spendTrend.map((point, i) => {
              const maxAmount = Math.max(...dashboard.spendTrend.map(p => p.amount));
              const height = (point.amount / maxAmount) * 100;
              return (
                <div key={point.month} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${height}%`,
                    minHeight: 8,
                    background: i === dashboard.spendTrend.length - 1 ? accentColor : `${accentColor}50`,
                    borderRadius: 4,
                    marginBottom: 6,
                  }} />
                  <div style={{ fontSize: 9, color: 'var(--ig-text-tertiary)' }}>{point.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Campaigns Summary */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Campaign Status</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <StatusCard label="Active" value={dashboard.activeCampaigns} color="#10b981" />
          <StatusCard label="Draft" value={dashboard.draftCampaigns} color="#737373" />
          <StatusCard label="Completed" value={dashboard.completedCampaigns} color={accentColor} />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1,
      padding: '14px',
      background: `${color}15`,
      borderRadius: 10,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function CampaignsTab({
  campaigns,
  accentColor,
}: {
  campaigns: Campaign[];
  accentColor: string;
}) {
  return (
    <div>
      <button style={{
        width: '100%',
        padding: '14px',
        background: accentColor,
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: 16,
      }}>
        + Create New Campaign
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {campaigns.map((campaign, i) => (
          <CampaignCard key={campaign.id} campaign={campaign} accentColor={accentColor} index={i} />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({
  campaign,
  accentColor,
  index,
}: {
  campaign: Campaign;
  accentColor: string;
  index: number;
}) {
  const statusInfo = getCampaignStatusInfo(campaign.status);
  const budgetPercent = (campaign.spentBudget / campaign.totalBudget) * 100;

  return (
    <div style={{
      background: 'var(--ig-card)',
      borderRadius: 12,
      border: '1px solid var(--ig-separator)',
      padding: 14,
      animation: `fadeIn 0.25s ease-out ${index * 0.05}s both`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{campaign.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>
            {campaign.objective.charAt(0).toUpperCase() + campaign.objective.slice(1)}
          </div>
        </div>
        <div style={{
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          background: statusInfo.bgColor,
          color: statusInfo.color,
        }}>
          {statusInfo.label}
        </div>
      </div>

      {/* Slots & Applications */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{
          flex: 1,
          padding: '10px',
          background: 'var(--ig-elevated)',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {campaign.filledSlots}/{campaign.totalSlots}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Slots Filled</div>
        </div>
        <div style={{
          flex: 1,
          padding: '10px',
          background: campaign.pendingApplications > 0 ? '#f59e0b15' : 'var(--ig-elevated)',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: campaign.pendingApplications > 0 ? '#f59e0b' : 'inherit' }}>
            {campaign.pendingApplications}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Pending</div>
        </div>
        <div style={{
          flex: 1,
          padding: '10px',
          background: 'var(--ig-elevated)',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
            {campaign.roi}x
          </div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>ROI</div>
        </div>
      </div>

      {/* Budget Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Budget Used</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            {formatCurrency(campaign.spentBudget)} / {formatCurrency(campaign.totalBudget)}
          </span>
        </div>
        <div style={{
          height: 4,
          background: 'var(--ig-separator)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${budgetPercent}%`,
            background: accentColor,
            borderRadius: 2,
          }} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{formatNumber(campaign.totalReach)}</div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Reach</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{formatNumber(campaign.totalEngagement)}</div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Engagements</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{formatNumber(campaign.totalConversions)}</div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Conversions</div>
        </div>
      </div>

      {/* Action */}
      <button style={{
        width: '100%',
        padding: '10px',
        background: 'transparent',
        color: accentColor,
        border: `1px solid ${accentColor}`,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        View Details
      </button>
    </div>
  );
}

function DiscoverTab({
  creators,
  accentColor,
}: {
  creators: typeof MOCK_CREATOR_DISCOVERY;
  accentColor: string;
}) {
  const [filters, setFilters] = useState({
    category: 'all',
    minLevel: 1,
    minFollowers: 0,
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          style={{
            padding: '8px 12px',
            background: 'var(--ig-card)',
            border: '1px solid var(--ig-separator)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--ig-text-primary)',
          }}
        >
          <option value="all">All Categories</option>
          <option value="Tech">Tech</option>
          <option value="Fitness">Fitness</option>
          <option value="Finance">Finance</option>
        </select>
        <select
          value={filters.minLevel}
          onChange={(e) => setFilters({ ...filters, minLevel: parseInt(e.target.value) })}
          style={{
            padding: '8px 12px',
            background: 'var(--ig-card)',
            border: '1px solid var(--ig-separator)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--ig-text-primary)',
          }}
        >
          <option value="1">Level 1+</option>
          <option value="2">Level 2+</option>
          <option value="3">Level 3+</option>
          <option value="4">Level 4+</option>
          <option value="5">Level 5 Only</option>
        </select>
      </div>

      {/* Creator Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {creators.map((creator, i) => (
          <CreatorDiscoveryCard key={creator.id} creator={creator} accentColor={accentColor} index={i} />
        ))}
      </div>
    </div>
  );
}

function CreatorDiscoveryCard({
  creator,
  accentColor,
  index,
}: {
  creator: typeof MOCK_CREATOR_DISCOVERY[0];
  accentColor: string;
  index: number;
}) {
  const verificationBadge = VERIFICATION_BADGES[creator.verificationLevel];
  const levelColors: Record<number, string> = {
    1: '#a8a8a8', 2: '#58c322', 3: '#0095f6', 4: '#a855f7', 5: '#f59e0b',
  };
  const levelColor = levelColors[creator.level] || '#a8a8a8';

  return (
    <div style={{
      background: 'var(--ig-card)',
      borderRadius: 12,
      border: '1px solid var(--ig-separator)',
      padding: 14,
      animation: `fadeIn 0.25s ease-out ${index * 0.05}s both`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${levelColor}88, ${levelColor})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>L{creator.level}</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{creator.name}</span>
            <span style={{
              fontSize: 12,
              padding: '2px 6px',
              background: verificationBadge.bgColor,
              color: verificationBadge.color,
              borderRadius: 4,
            }}>
              {verificationBadge.icon}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
            @{creator.username} • {creator.profession}
          </div>
        </div>

        <div style={{
          padding: '4px 10px',
          background: `${accentColor}20`,
          color: accentColor,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
        }}>
          {creator.matchScore}%
        </div>
      </div>

      {/* Platform Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {creator.platforms.map(p => (
          <div
            key={p.platform}
            style={{
              flex: 1,
              padding: '8px',
              background: 'var(--ig-elevated)',
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>{formatNumber(p.followers)}</div>
            <div style={{ fontSize: 9, color: 'var(--ig-text-tertiary)' }}>
              {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Match Reasons */}
      <div style={{ marginBottom: 12 }}>
        {creator.matchReasons.slice(0, 2).map((reason, i) => (
          <div key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: 'var(--ig-elevated)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--ig-text-secondary)',
            marginRight: 6,
            marginBottom: 4,
          }}>
            <span style={{ color: '#10b981' }}>✓</span>
            {reason}
          </div>
        ))}
      </div>

      {/* Pricing & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Est. Rate</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(creator.estimatedRate)}</div>
          <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>
            {creator.levelMultiplier}x multiplier
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--ig-text-primary)',
            border: '1px solid var(--ig-separator)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            View Profile
          </button>
          <button style={{
            padding: '10px 16px',
            background: accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ accentColor }: { accentColor: string }) {
  // Mock completed campaigns history
  const completedCampaigns = [
    { id: '1', name: 'Summer Launch 2023', roi: 4.2, spent: 2500000, reach: 1200000 },
    { id: '2', name: 'Q4 Brand Awareness', roi: 3.1, spent: 1800000, reach: 850000 },
    { id: '3', name: 'Product Reviews Q3', roi: 2.8, spent: 950000, reach: 420000 },
  ];

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Completed Campaigns</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {completedCampaigns.map((campaign, i) => (
          <div
            key={campaign.id}
            style={{
              padding: '14px',
              background: 'var(--ig-card)',
              borderRadius: 10,
              border: '1px solid var(--ig-separator)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: `fadeIn 0.25s ease-out ${i * 0.05}s both`,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{campaign.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                {formatCurrency(campaign.spent)} spent • {formatNumber(campaign.reach)} reach
              </div>
            </div>
            <div style={{
              padding: '6px 12px',
              background: '#10b98120',
              color: '#10b981',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
            }}>
              {campaign.roi}x ROI
            </div>
          </div>
        ))}
      </div>

      <button style={{
        width: '100%',
        padding: '12px',
        background: 'transparent',
        color: accentColor,
        border: `1px solid ${accentColor}`,
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 16,
      }}>
        Export Full Report
      </button>
    </div>
  );
}
