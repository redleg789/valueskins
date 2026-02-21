'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr:false prevents Recharts from running during SSR prerender,
// which avoids the "width(-1) height(-1)" warning caused by no DOM at build time.
const AnalyticsCharts = dynamic(
    () => import('./AnalyticsCharts').then(m => m.AnalyticsCharts),
    {
        ssr: false,
        loading: () => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ height: '282px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ height: '232px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }} />
                    <div style={{ height: '232px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }} />
                </div>
            </div>
        ),
    }
);

export default function AnalyticsPage() {
    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Analytics</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Track your reputation growth and engagement</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard label="Total Score" value="8,942" change="+32%" positive />
                <StatCard label="Level" value="4" change="+1" positive />
                <StatCard label="Followers" value="1.2k" change="+15%" positive />
                <StatCard label="Engagement Rate" value="4.8%" change="-0.2%" positive={false} />
            </div>

            <AnalyticsCharts />
        </div>
    );
}

function StatCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
    return (
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: positive ? '#22c55e' : '#ef4444' }}>{change}</div>
        </div>
    );
}
