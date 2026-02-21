'use client';

import { useState } from 'react';
import {
  MOCK_COLLECTIVE,
  MOCK_AUCTION,
  MOCK_MARKET_RATES,
  formatCurrency,
  calculateCollectivePower,
} from '@/lib/collective';

type Tab = 'guild' | 'auctions' | 'rates';

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
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #262626',
      }}>
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
  const collective = MOCK_COLLECTIVE;
  const power = calculateCollectivePower(collective);

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
            🎮
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{collective.name}</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              {collective.totalMembers.toLocaleString()} members
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Combined Reach</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {(collective.totalCombinedFollowers / 1e6).toFixed(1)}M
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Avg Deal</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {formatCurrency(collective.stats.avgDealValue)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Rate Boost</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fef08a' }}>
              +{collective.stats.avgRateIncrease}%
            </div>
          </div>
        </div>
      </div>

      {/* Your Membership */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Your Membership</div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '14px' }}>Council Member</div>
            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>15.5% voting power</div>
          </div>
          <div style={{
            background: 'rgba(234, 179, 8, 0.2)',
            color: '#fbbf24',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            ⭐ Council
          </div>
        </div>
      </div>

      {/* Minimum Rates */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Guild Minimum Rates</div>
        <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
          These are the minimum rates all guild members agree to charge. Brands can't lowball us.
        </p>

        {collective.minimumRates.map(rate => (
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
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{rate.contentType}</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{rate.perMetric}</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(rate.minRate)}
            </div>
          </div>
        ))}
      </div>

      {/* Blacklisted Brands */}
      {collective.blacklistedBrands.length > 0 && (
        <div style={{
          background: '#1c1c1e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#ef4444' }}>
            ⚠️ Blacklisted Brands
          </div>

          {collective.blacklistedBrands.map(brand => (
            <div key={brand.brandId} style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{brand.brandName}</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>{brand.reason}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                Voted: {brand.votesFor} for / {brand.votesAgainst} against
              </div>
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
          {formatCurrency(collective.treasury.balance)}
        </div>
        <div style={{ fontSize: '13px', color: '#8e8e8e' }}>
          For legal defense, strike funds, and guild operations
        </div>
      </div>
    </>
  );
}

function AuctionsTab() {
  const auction = MOCK_AUCTION;
  const timeLeft = auction.endTime.getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <>
      {/* Create Auction CTA */}
      <button style={{
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        border: 'none',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '20px',
        cursor: 'pointer',
      }}>
        + Create Your Own Auction
      </button>

      {/* Live Auction */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #f97316)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontWeight: 'bold' }}>🔥 LIVE AUCTION</span>
          <span style={{ fontSize: '14px' }}>
            {hoursLeft}h {minutesLeft}m left
          </span>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '50%',
            }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{auction.creatorName}</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>{auction.contentType}</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '4px' }}>
              Current Bid
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(auction.currentBid)}
            </div>
            <div style={{ fontSize: '13px', color: '#8e8e8e' }}>
              {auction.uniqueBidders} brands competing
            </div>
          </div>

          {/* Bid History */}
          <div style={{
            background: '#262626',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '8px' }}>
              Recent Bids
            </div>
            {auction.bids.slice(-3).reverse().map(bid => (
              <div key={bid.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #333',
              }}>
                <span style={{ fontWeight: bid.status === 'active' ? 'bold' : 'normal' }}>
                  {bid.brandName}
                </span>
                <span style={{ color: bid.status === 'active' ? '#10b981' : '#8e8e8e' }}>
                  {formatCurrency(bid.amount)}
                </span>
              </div>
            ))}
          </div>

          {auction.buyNowPrice && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>
                Buy Now Price
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {formatCurrency(auction.buyNowPrice)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        background: '#1c1c1e',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>How Auctions Work</div>
        <div style={{ fontSize: '13px', color: '#8e8e8e', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>1. Set your terms</strong> - Define what you're offering and minimum price
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#fff' }}>2. Brands compete</strong> - Multiple brands bid against each other
          </p>
          <p>
            <strong style={{ color: '#fff' }}>3. You choose</strong> - Accept the highest bid or set a Buy Now price
          </p>
        </div>
      </div>
    </>
  );
}

function RatesTab() {
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
          Real-time rates based on {MOCK_MARKET_RATES.reduce((sum, r) => sum + r.dataPoints, 0).toLocaleString()} deals.
          Never get lowballed again.
        </p>
      </div>

      {MOCK_MARKET_RATES.map((rate, i) => (
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
              <div style={{ fontWeight: 'bold' }}>{rate.contentType}</div>
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                {rate.category} • {rate.platform}
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
              {rate.trend === 'rising' ? '↑' : rate.trend === 'falling' ? '↓' : '→'} {Math.abs(rate.changeLastMonth)}%
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            fontSize: '11px',
          }}>
            {[1, 2, 3, 4, 5].map(level => {
              const levelKey = `level${level}` as keyof typeof rate.rates;
              const levelRate = rate.rates[levelKey];
              return (
                <div key={level} style={{
                  background: '#262626',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#8e8e8e', marginBottom: '4px' }}>L{level}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                    {formatCurrency(levelRate.median)}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            fontSize: '11px',
            color: '#8e8e8e',
            marginTop: '8px',
            textAlign: 'right',
          }}>
            Based on {rate.dataPoints.toLocaleString()} deals
          </div>
        </div>
      ))}
    </>
  );
}
