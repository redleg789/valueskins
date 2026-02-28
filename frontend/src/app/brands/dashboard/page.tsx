'use client';

import { useState, useEffect } from 'react';
import { api, MarketplaceOpportunity, MarketplaceStats } from '@/lib/api';

export default function BrandDashboard() {
    const [stats, setStats] = useState<MarketplaceStats | null>(null);
    const [opportunities, setOpportunities] = useState<MarketplaceOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const [statsResult, oppsResult] = await Promise.all([
                api.marketplace.getStats(),
                api.marketplace.getOpportunities(),
            ]);

            if (statsResult.data) setStats(statsResult.data);
            if (oppsResult.data) setOpportunities(oppsResult.data.opportunities || []);
            if (statsResult.error && oppsResult.error) setError(statsResult.error || oppsResult.error || 'Failed to load dashboard');
            setLoading(false);
        })();
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: '#71717a', minHeight: '100vh', background: '#0a0a0f' }}>Loading dashboard...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ef4444', minHeight: '100vh', background: '#0a0a0f' }}>{error}</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Brand Dashboard</h1>
                        <p style={{ color: '#a1a1aa' }}>Manage your opportunities and creator relationships</p>
                    </div>
                    <button style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>+ New Opportunity</button>
                </div>

                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { label: 'Active Opportunities', value: stats.active_opportunities, color: '#8b5cf6' },
                            { label: 'Completed Deals', value: stats.completed_deals, color: '#22c55e' },
                            { label: 'Total Volume', value: stats.total_volume, color: '#f59e0b' },
                            { label: 'Avg Deal Size', value: stats.avg_deal_size, color: '#06b6d4' },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                                <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Your Opportunities</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {opportunities.map(opp => (
                            <div key={opp.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{opp.title}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#71717a', fontSize: '0.85rem' }}>
                                        <span>{opp.application_count} applications</span>
                                        <span>{opp.reward_amount} {opp.reward_currency}</span>
                                        <span>Due {new Date(opp.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', background: opp.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)', color: opp.status === 'open' ? '#22c55e' : '#8b5cf6' }}>{opp.status}</span>
                                    <button style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>View</button>
                                </div>
                            </div>
                        ))}
                        {opportunities.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                No opportunities yet. Create your first one!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
