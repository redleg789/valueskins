'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type CreatorProfile } from '@/lib/api';

const LEVEL_NAMES = ['Newcomer', 'Rising', 'Established', 'Expert', 'Legend'];
const LEVEL_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

function ProfileSkeleton() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                    <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: '32px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', marginBottom: '0.75rem', maxWidth: '300px' }} />
                        <div style={{ height: '16px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '0.5rem', maxWidth: '200px' }} />
                        <div style={{ height: '16px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', maxWidth: '400px' }} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[0,1,2,3].map(i => (
                        <div key={i} style={{ height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await api.persona.getMyProfile();
        if (result.error) {
            setError(result.error);
        } else if (result.data) {
            setProfile(result.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    if (loading) return <ProfileSkeleton />;

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <h2>Failed to load profile</h2>
                <p style={{ color: '#a1a1aa' }}>{error}</p>
                <button onClick={loadProfile} style={{ padding: '0.75rem 1.5rem', background: 'rgba(139,92,246,0.2)', border: '1px solid #8b5cf6', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Try Again</button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '3rem' }}>👤</div>
                <h2>Profile not found</h2>
                <p style={{ color: '#a1a1aa' }}>Complete your onboarding to set up your profile.</p>
                <a href="/onboarding" style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', borderRadius: '10px', color: 'white', textDecoration: 'none', fontWeight: 600 }}>Get Started</a>
            </div>
        );
    }

    const levelColor = LEVEL_COLORS[Math.min(profile.level - 1, LEVEL_COLORS.length - 1)] ?? '#6b7280';

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Profile Header */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '2rem', background: `linear-gradient(135deg, ${levelColor}15, transparent)`, border: `1px solid ${levelColor}30`, borderRadius: '20px' }}>
                    <div style={{ width: '120px', height: '120px', background: `linear-gradient(135deg, ${levelColor}, ${levelColor}80)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, flexShrink: 0 }}>
                        {profile.display_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{profile.display_name}</h1>
                            <span style={{ padding: '0.25rem 0.75rem', background: `${levelColor}20`, border: `1px solid ${levelColor}40`, borderRadius: '100px', fontSize: '0.85rem', color: levelColor, fontWeight: 600 }}>
                                L{profile.level} {LEVEL_NAMES[profile.level - 1] ?? 'Unknown'}
                            </span>
                        </div>
                        <p style={{ color: '#a1a1aa', marginBottom: '0.5rem' }}>{profile.handle}{profile.profession ? ` • ${profile.profession}` : ''}</p>
                        {profile.bio && <p style={{ marginBottom: '1rem' }}>{profile.bio}</p>}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {profile.badges.map(badge => (
                                <span key={badge} style={{ padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '100px', fontSize: '0.75rem', color: '#8b5cf6' }}>{badge}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, background: `linear-gradient(135deg, ${levelColor}, #06b6d4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{profile.score.toLocaleString()}</div>
                        <div style={{ color: '#71717a', fontSize: '0.9rem' }}>Total Score</div>
                        <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>Share Profile</button>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Earnings', value: '$' + profile.stats.total_earnings, color: '#22c55e' },
                        { label: 'Completed Deals', value: profile.stats.completed_deals, color: '#8b5cf6' },
                        { label: 'Avg Rating', value: profile.stats.avg_rating + '★', color: '#f59e0b' },
                        { label: 'Referrals', value: profile.stats.referrals, color: '#06b6d4' },
                    ].map((stat, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            <div style={{ color: '#71717a', fontSize: '0.85rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Score Breakdown */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Score Breakdown</h2>
                        {Object.entries(profile.score_breakdown).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                                    <span style={{ fontWeight: 600 }}>{value}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${value}%`, background: `linear-gradient(90deg, ${levelColor}, #06b6d4)`, borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                        <a href="/scoring" style={{ display: 'block', marginTop: '1rem', color: '#8b5cf6', fontSize: '0.9rem' }}>How is my score calculated? →</a>
                    </div>

                    {/* Recent Activity */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recent Activity</h2>
                        {profile.recent_activity.length === 0 ? (
                            <p style={{ color: '#71717a', textAlign: 'center', padding: '2rem 0' }}>No activity yet. Start by applying to opportunities!</p>
                        ) : (
                            profile.recent_activity.map((activity, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: i < profile.recent_activity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{activity.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#71717a' }}>{activity.date}</div>
                                    </div>
                                    {activity.amount && <span style={{ color: '#22c55e', fontWeight: 600 }}>{activity.amount}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Connected Platforms */}
                <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Connected Platforms</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {profile.connected_platforms.map(platform => (
                            <div key={platform} style={{ padding: '0.75rem 1.5rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#22c55e' }}>✓</span>
                                <span>{platform}</span>
                            </div>
                        ))}
                        <button style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '10px', color: '#a1a1aa', cursor: 'pointer' }}>+ Add Platform</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
