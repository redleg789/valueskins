'use client';

import { useState, useEffect } from 'react';
import { api, PlatformStats } from '@/lib/api';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const result = await api.admin.getPlatformStats();
            if (result.data) {
                setStats(result.data);
            } else {
                setError(result.error || 'Failed to load stats');
            }
            setLoading(false);
        })();
    }, []);

    const formatCurrency = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

    if (loading) return <div style={{ padding: '2rem', color: '#71717a' }}>Loading analytics...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;
    if (!stats) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Growth Analytics</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
                    Real-time platform metrics
                    {stats.last_refreshed_at && <span style={{ fontSize: '0.8rem', marginLeft: '1rem' }}>Last refreshed: {new Date(stats.last_refreshed_at).toLocaleString()}</span>}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Users', value: stats.total_users.toLocaleString(), color: '#8b5cf6' },
                        { label: 'Total Personas', value: stats.total_personas.toLocaleString(), color: '#06b6d4' },
                        { label: 'Active Skins', value: stats.total_skins.toLocaleString(), color: '#22c55e' },
                    ].map((m, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                            <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{m.label}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                        <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Volume (GMV)</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(stats.total_volume)}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                        <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Platform Revenue</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#22c55e' }}>{formatCurrency(stats.total_revenue)}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                        <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Completed Deals</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6' }}>{stats.total_deals.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
