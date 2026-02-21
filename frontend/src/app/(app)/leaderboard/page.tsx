'use client';

import { useState } from 'react';

const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Sarah Chen', profession: 'Developer', level: 5, score: 9847, earnings: '142,000', change: 0 },
    { rank: 2, name: 'Marcus Johnson', profession: 'Digital Artist', level: 5, score: 9654, earnings: '128,000', change: 1 },
    { rank: 3, name: 'Emma Wilson', profession: 'Content Creator', level: 5, score: 9521, earnings: '115,000', change: -1 },
    { rank: 4, name: 'Alex Rivera', profession: 'Digital Artist', level: 4, score: 8234, earnings: '87,000', change: 2 },
    { rank: 5, name: 'Jordan Lee', profession: 'Community Manager', level: 4, score: 7856, earnings: '72,000', change: 0 },
    { rank: 6, name: 'Taylor Kim', profession: 'Developer', level: 4, score: 7654, earnings: '68,000', change: -1 },
    { rank: 7, name: 'Casey Brown', profession: 'Musician', level: 4, score: 7432, earnings: '54,000', change: 3 },
    { rank: 8, name: 'Morgan Davis', profession: 'Writer', level: 4, score: 7123, earnings: '48,000', change: 0 },
    { rank: 9, name: 'Jamie Smith', profession: '3D Artist', level: 4, score: 6987, earnings: '45,000', change: -2 },
    { rank: 10, name: 'Riley Garcia', profession: 'Marketer', level: 3, score: 6754, earnings: '42,000', change: 1 },
];

const LEVEL_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
const PROFESSIONS = ['All', 'Developer', 'Digital Artist', 'Content Creator', 'Community Manager', 'Writer', 'Musician'];

export default function LeaderboardPage() {
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('monthly');
    const [profession, setProfession] = useState('All');

    const filtered = MOCK_LEADERBOARD.filter(u => profession === 'All' || u.profession === profession);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏆 Leaderboard</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Top creators ranked by verified skills and achievements</p>

                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['weekly', 'monthly', 'alltime'] as const).map(tf => (
                            <button key={tf} onClick={() => setTimeframe(tf)} style={{ padding: '0.5rem 1rem', background: timeframe === tf ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${timeframe === tf ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: timeframe === tf ? 'white' : '#a1a1aa', cursor: 'pointer', textTransform: 'capitalize' }}>{tf === 'alltime' ? 'All Time' : tf}</button>
                        ))}
                    </div>
                    <select value={profession} onChange={e => setProfession(e.target.value)} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}>
                        {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                {/* Top 3 Podium */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[filtered[1], filtered[0], filtered[2]].filter(Boolean).map((user, i) => {
                        const isFirst = i === 1;
                        const height = isFirst ? '200px' : '160px';
                        const medalColors = ['#C0C0C0', '#FFD700', '#CD7F32'];
                        return (
                            <div key={user.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${LEVEL_COLORS[user.level - 1]}, ${LEVEL_COLORS[user.level - 1]}80)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', border: `3px solid ${medalColors[i]}` }}>{user.name.charAt(0)}</div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{user.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '0.5rem' }}>{user.profession}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: LEVEL_COLORS[user.level - 1] }}>{user.score.toLocaleString()}</div>
                                <div style={{ width: '120px', height, background: `linear-gradient(180deg, ${medalColors[i]}40, transparent)`, borderRadius: '8px 8px 0 0', marginTop: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1rem' }}>
                                    <span style={{ fontSize: '2rem' }}>{['🥈', '🥇', '🥉'][i]}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Full List */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 150px 100px 120px 80px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#71717a', fontSize: '0.85rem' }}>
                        <span>Rank</span><span>Creator</span><span>Profession</span><span>Level</span><span>Score</span><span>Earnings</span>
                    </div>
                    {filtered.map((user, i) => (
                        <div key={user.rank} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 150px 100px 120px 80px', padding: '1rem 1.5rem', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: user.rank <= 3 ? `${['#FFD700', '#C0C0C0', '#CD7F32'][user.rank - 1]}08` : 'transparent' }}>
                            <span style={{ fontWeight: 700, color: user.rank <= 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][user.rank - 1] : 'white' }}>#{user.rank}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', background: `linear-gradient(135deg, ${LEVEL_COLORS[user.level - 1]}, ${LEVEL_COLORS[user.level - 1]}80)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{user.name.charAt(0)}</div>
                                <span style={{ fontWeight: 500 }}>{user.name}</span>
                                {user.change !== 0 && <span style={{ fontSize: '0.75rem', color: user.change > 0 ? '#22c55e' : '#ef4444' }}>{user.change > 0 ? '↑' : '↓'}{Math.abs(user.change)}</span>}
                            </div>
                            <span style={{ color: '#a1a1aa' }}>{user.profession}</span>
                            <span style={{ padding: '0.25rem 0.5rem', background: `${LEVEL_COLORS[user.level - 1]}20`, color: LEVEL_COLORS[user.level - 1], borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>L{user.level}</span>
                            <span style={{ fontWeight: 600 }}>{user.score.toLocaleString()}</span>
                            <span style={{ color: '#22c55e' }}>${user.earnings}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
