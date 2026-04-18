'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, LeaderboardCreator } from '@/lib/api';

const LEVEL_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function LeaderboardPage() {
    const [creators, setCreators] = useState<LeaderboardCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        const result = await api.admin.getLeaderboard(50, 0);
        if (result.data) {
            setCreators(result.data.leaderboard);
        } else {
            setError(result.error || 'Failed to load leaderboard');
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    const getLevel = (score: number | null): number => {
        if (!score) return 1;
        if (score >= 9000) return 5;
        if (score >= 7000) return 4;
        if (score >= 5000) return 3;
        if (score >= 2000) return 2;
        return 1;
    };

    if (loading) return <div style={{ padding: '2rem', color: '#71717a', minHeight: '100vh', background: '#0a0a0f' }}>Loading leaderboard...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ef4444', minHeight: '100vh', background: '#0a0a0f' }}>{error}</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Leaderboard</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Top creators ranked by verified skills and achievements</p>

                {/* Top 3 Podium */}
                {creators.length >= 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '3rem' }}>
                        {[creators[1], creators[0], creators[2]].map((user, i) => {
                            const level = getLevel(user.reputation_score);
                            const medalColors = ['#C0C0C0', '#FFD700', '#CD7F32'];
                            const isFirst = i === 1;
                            const height = isFirst ? '200px' : '160px';
                            return (
                                <div key={user.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${medalColors[i]}`, marginBottom: '1rem', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${LEVEL_COLORS[level - 1]}, ${LEVEL_COLORS[level - 1]}80)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', border: `3px solid ${medalColors[i]}` }}>
                                            {(user.display_name || user.username).charAt(0)}
                                        </div>
                                    )}
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{user.display_name || user.username}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '0.5rem' }}>@{user.username}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: LEVEL_COLORS[level - 1] }}>{(user.reputation_score || 0).toLocaleString()}</div>
                                    <div style={{ width: '120px', height, background: `linear-gradient(180deg, ${medalColors[i]}40, transparent)`, borderRadius: '8px 8px 0 0', marginTop: '1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1rem' }}>
                                        <span style={{ fontSize: '2rem' }}>{['', '', ''][i]}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Full List */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 120px 100px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#71717a', fontSize: '0.85rem' }}>
                        <span>Rank</span><span>Creator</span><span>Level</span><span>Score</span><span>Deals</span>
                    </div>
                    {creators.map((user, i) => {
                        const level = getLevel(user.reputation_score);
                        return (
                            <div key={user.user_id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 120px 100px', padding: '1rem 1.5rem', borderBottom: i < creators.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: user.rank <= 3 ? `${['#FFD700', '#C0C0C0', '#CD7F32'][user.rank - 1]}08` : 'transparent' }}>
                                <span style={{ fontWeight: 700, color: user.rank <= 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][user.rank - 1] : 'white' }}>#{user.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '36px', height: '36px', background: `linear-gradient(135deg, ${LEVEL_COLORS[level - 1]}, ${LEVEL_COLORS[level - 1]}80)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                            {(user.display_name || user.username).charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{user.display_name || user.username}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#71717a' }}>@{user.username}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '0.25rem 0.5rem', background: `${LEVEL_COLORS[level - 1]}20`, color: LEVEL_COLORS[level - 1], borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>L{level}</span>
                                <span style={{ fontWeight: 600 }}>{(user.reputation_score || 0).toLocaleString()}</span>
                                <span style={{ color: '#22c55e' }}>{user.total_deals || 0}</span>
                            </div>
                        );
                    })}
                    {creators.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>No creators on the leaderboard yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
