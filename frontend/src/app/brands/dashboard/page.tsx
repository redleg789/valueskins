'use client';

import { useState } from 'react';

const MOCK_STATS = {
    activeOpportunities: 3,
    totalApplications: 127,
    completedDeals: 12,
    totalSpend: '45,000',
    avgResponseTime: '2.4h',
    topCreators: [
        { name: 'Alex Rivera', level: 5, profession: 'Digital Artist', deals: 3 },
        { name: 'Jordan Chen', level: 4, profession: 'Developer', deals: 2 },
        { name: 'Sam Taylor', level: 4, profession: 'Content Creator', deals: 2 },
    ],
};

const MOCK_OPPORTUNITIES = [
    { id: 1, title: 'NFT Artist for Q2 Campaign', status: 'active', applications: 47, budget: '15,000', deadline: '2026-02-28' },
    { id: 2, title: 'Community Manager', status: 'active', applications: 89, budget: '8,000', deadline: '2026-03-15' },
    { id: 3, title: 'Technical Content Writer', status: 'filled', applications: 23, budget: '5,000', deadline: '2026-02-20' },
];

export default function BrandDashboard() {
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const apiKey = 'vs_live_abc123def456';

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🏢 Brand Dashboard</h1>
                        <p style={{ color: '#a1a1aa' }}>Manage your opportunities and creator relationships</p>
                    </div>
                    <button style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>+ New Opportunity</button>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Active Opportunities', value: MOCK_STATS.activeOpportunities, color: '#8b5cf6' },
                        { label: 'Total Applications', value: MOCK_STATS.totalApplications, color: '#06b6d4' },
                        { label: 'Completed Deals', value: MOCK_STATS.completedDeals, color: '#22c55e' },
                        { label: 'Total Spend', value: '$' + MOCK_STATS.totalSpend, color: '#f59e0b' },
                        { label: 'Avg Response', value: MOCK_STATS.avgResponseTime, color: '#ec4899' },
                    ].map((stat, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Opportunities */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Your Opportunities</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {MOCK_OPPORTUNITIES.map(opp => (
                                <div key={opp.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{opp.title}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', color: '#71717a', fontSize: '0.85rem' }}>
                                            <span>{opp.applications} applications</span>
                                            <span>${opp.budget}</span>
                                            <span>Due {new Date(opp.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', background: opp.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)', color: opp.status === 'active' ? '#22c55e' : '#8b5cf6' }}>{opp.status}</span>
                                        <button style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>View</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* API Key */}
                        <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>🔑 API Access</h3>
                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                                <code style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{apiKeyVisible ? apiKey : '••••••••••••••••'}</code>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setApiKeyVisible(!apiKeyVisible)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>{apiKeyVisible ? 'Hide' : 'Show'}</button>
                                <button style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>Regenerate</button>
                            </div>
                        </div>

                        {/* Top Creators */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>⭐ Top Creators</h3>
                            {MOCK_STATS.topCreators.map((creator, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{creator.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#71717a' }}>L{creator.level} {creator.profession}</div>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#22c55e' }}>{creator.deals} deals</span>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: 'white', textAlign: 'left', cursor: 'pointer' }}>📋 View API Docs</button>
                                <button style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: 'white', textAlign: 'left', cursor: 'pointer' }}>🔍 Search Creators</button>
                                <button style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: 'white', textAlign: 'left', cursor: 'pointer' }}>📊 View Analytics</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
