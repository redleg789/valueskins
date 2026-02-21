'use client';

/**
 * Growth Analytics Dashboard
 * 
 * BLOCKER: Track viral metrics to prove K-factor > 1
 */

const MOCK_METRICS = {
    overview: {
        totalUsers: 12847,
        weeklyGrowth: 23.4,
        dailyActive: 3421,
        retention7d: 68.2,
    },
    viral: {
        kFactor: 1.34,
        referralRate: 42,
        avgReferrals: 2.1,
        viralCoeff: 0.89,
    },
    revenue: {
        totalVolume: 2400000,
        platformRevenue: 120000,
        avgDealSize: 12400,
        completedDeals: 89,
    },
    funnel: {
        visitors: 50000,
        signups: 12847,
        activated: 8234,
        converted: 3421,
    },
};

export default function AnalyticsPage() {
    const formatCurrency = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>📈 Growth Analytics</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Real-time metrics for billion-dollar trajectory</p>

                {/* Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Users', value: MOCK_METRICS.overview.totalUsers.toLocaleString(), change: '+' + MOCK_METRICS.overview.weeklyGrowth + '%', color: '#8b5cf6' },
                        { label: 'K-Factor', value: MOCK_METRICS.viral.kFactor.toFixed(2), change: MOCK_METRICS.viral.kFactor > 1 ? '🔥 Viral!' : 'Growing', color: '#22c55e' },
                        { label: 'Platform Revenue', value: formatCurrency(MOCK_METRICS.revenue.platformRevenue), change: '+$24K this week', color: '#f59e0b' },
                        { label: '7-Day Retention', value: MOCK_METRICS.overview.retention7d + '%', change: 'Excellent', color: '#06b6d4' },
                    ].map((m, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                            <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{m.label}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                            <div style={{ fontSize: '0.85rem', color: '#22c55e', marginTop: '0.5rem' }}>{m.change}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Viral Metrics */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>🚀 Viral Metrics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>K-Factor</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{MOCK_METRICS.viral.kFactor}</div>
                                <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>Above 1 = Viral 🎯</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Referral Rate</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{MOCK_METRICS.viral.referralRate}%</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Users who refer</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Avg Referrals/User</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#06b6d4' }}>{MOCK_METRICS.viral.avgReferrals}</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Referrals made</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Viral Coefficient</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{MOCK_METRICS.viral.viralCoeff}</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Compound growth</div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Metrics */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>💰 Revenue Metrics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Total GMV</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(MOCK_METRICS.revenue.totalVolume)}</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Deal volume</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Platform Revenue</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(MOCK_METRICS.revenue.platformRevenue)}</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>5% take rate</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Avg Deal Size</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>${(MOCK_METRICS.revenue.avgDealSize / 1000).toFixed(1)}K</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Per opportunity</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <div style={{ color: '#71717a', fontSize: '0.8rem' }}>Completed Deals</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#06b6d4' }}>{MOCK_METRICS.revenue.completedDeals}</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Transactions</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>📉 Conversion Funnel</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '200px' }}>
                        {[
                            { label: 'Visitors', value: MOCK_METRICS.funnel.visitors, pct: 100 },
                            { label: 'Signups', value: MOCK_METRICS.funnel.signups, pct: (MOCK_METRICS.funnel.signups / MOCK_METRICS.funnel.visitors) * 100 },
                            { label: 'Activated', value: MOCK_METRICS.funnel.activated, pct: (MOCK_METRICS.funnel.activated / MOCK_METRICS.funnel.visitors) * 100 },
                            { label: 'Converted', value: MOCK_METRICS.funnel.converted, pct: (MOCK_METRICS.funnel.converted / MOCK_METRICS.funnel.visitors) * 100 },
                        ].map((stage, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{(stage.value / 1000).toFixed(1)}K</div>
                                <div style={{ width: '100%', height: `${stage.pct * 1.8}px`, background: `linear-gradient(180deg, #8b5cf6, #8b5cf6${Math.floor(40 + stage.pct * 0.6).toString(16)})`, borderRadius: '8px 8px 0 0' }} />
                                <div style={{ marginTop: '0.75rem', color: '#71717a', fontSize: '0.85rem' }}>{stage.label}</div>
                                <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>{stage.pct.toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
