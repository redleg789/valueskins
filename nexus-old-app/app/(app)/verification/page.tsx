'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, VerificationData } from '@/lib/api';

const BADGE_CONFIG: Record<number, { name: string; icon: string; color: string; bgColor: string; description: string }> = {
    1: { name: 'New Creator', icon: '🌱', color: '#6b7280', bgColor: 'rgba(107,114,128,0.2)', description: 'Just getting started' },
    2: { name: 'Linked', icon: '🔗', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.2)', description: 'Social accounts connected' },
    3: { name: 'Verified', icon: '✓', color: '#10b981', bgColor: 'rgba(16,185,129,0.2)', description: 'Identity verified' },
    4: { name: 'Trusted', icon: '⭐', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.2)', description: '3+ deals, 4.5+ rating' },
    5: { name: 'Elite', icon: '💎', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.2)', description: '20+ deals, 4.8+ rating' },
};

export default function VerificationPage() {
    const [data, setData] = useState<VerificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await api.verification.getMyVerification();
        if (res.data) setData(res.data);
        else setError(res.error || 'Failed to load verification');
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#8e8e8e', padding: '20px' }}>Loading verification...</div>;
    if (error || !data) return <div style={{ background: '#000', minHeight: '100vh', color: '#ef4444', padding: '20px' }}>{error}</div>;

    const badge = BADGE_CONFIG[data.verification_level] || BADGE_CONFIG[1];
    const trustScore = data.trust_score;
    const b = data.trust_breakdown;

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            {/* Trust Score Header */}
            <div style={{
                padding: '24px 16px', textAlign: 'center',
                background: `linear-gradient(135deg, ${badge.color}20, transparent)`,
                borderBottom: '1px solid #262626',
            }}>
                <div style={{
                    width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%',
                    background: `conic-gradient(${badge.color} ${trustScore * 3.6}deg, #262626 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}>
                    <div style={{
                        width: 84, height: 84, borderRadius: '50%', background: '#000',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{trustScore}</div>
                        <div style={{ fontSize: 10, color: '#8e8e8e' }}>Trust Score</div>
                    </div>
                </div>

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', background: badge.bgColor, borderRadius: 20, marginBottom: 8,
                }}>
                    <span style={{ fontSize: 18 }}>{badge.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: badge.color }}>{badge.name}</span>
                </div>
                <p style={{ fontSize: 13, color: '#8e8e8e' }}>{badge.description}</p>
            </div>

            {/* Trust Score Breakdown */}
            <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Trust Score Breakdown</div>
                <div style={{ background: '#1c1c1e', borderRadius: 12, padding: 14 }}>
                    <ScoreBar label="Verification Level" value={b.verification} max={25} color={badge.color} />
                    <ScoreBar label="Deal Completion" value={b.completion} max={25} color="#3b82f6" />
                    <ScoreBar label="Average Rating" value={b.rating} max={25} color="#f59e0b" />
                    <ScoreBar label="Authenticity" value={b.authenticity} max={25} color="#10b981" isLast />
                </div>
            </div>

            {/* Verification Progress */}
            <div style={{ padding: '0 16px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Verification Progress</div>
                {([1, 2, 3, 4, 5] as number[]).map(level => {
                    const b = BADGE_CONFIG[level];
                    const isComplete = data.verification_level >= level;
                    const isCurrent = data.verification_level === level - 1;
                    return (
                        <div key={level} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                            background: isComplete ? `${b.color}10` : isCurrent ? '#1c1c1e' : 'transparent',
                            borderRadius: 10, marginBottom: 8,
                            border: isCurrent ? `1px solid ${b.color}` : '1px solid transparent',
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                background: isComplete ? b.color : '#262626',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {isComplete ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                ) : (
                                    <span style={{ fontSize: 14, color: '#8e8e8e' }}>{b.icon}</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: isComplete ? b.color : '#fff' }}>{b.name}</div>
                                    {isComplete && (
                                        <span style={{ fontSize: 10, color: b.color, background: `${b.color}20`, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Complete</span>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 2 }}>{b.description}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Linked Accounts */}
            <div style={{ padding: '0 16px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Linked Accounts</div>
                <div style={{ background: '#1c1c1e', borderRadius: 12, overflow: 'hidden' }}>
                    {data.linked_accounts.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#8e8e8e', fontSize: 13 }}>No accounts linked yet</div>
                    ) : data.linked_accounts.map((account, i) => (
                        <div key={account.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                            borderBottom: i < data.linked_accounts.length - 1 ? '1px solid #262626' : 'none',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', background: '#262626',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                            }}>🔗</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>@{account.username || account.platform}</div>
                                <div style={{ fontSize: 12, color: '#8e8e8e' }}>{account.platform}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fraud Alerts */}
            {data.fraud_signals.length > 0 && (
                <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#ef4444' }}>Account Alerts</div>
                    {data.fraud_signals.map(flag => (
                        <div key={flag.id} style={{
                            padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 10, marginBottom: 8,
                            border: '1px solid rgba(239,68,68,0.3)',
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
                                {flag.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </div>
                            <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 4 }}>
                                Severity: {flag.severity} | {flag.resolved_at ? 'Resolved' : 'Unresolved'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div style={{ padding: '0 16px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your Track Record</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <StatCard label="Completed Deals" value={String(data.deals_completed)} color="#10b981" />
                    <StatCard label="Avg Rating" value={data.avg_rating.toFixed(1)} color="#f59e0b" />
                </div>
            </div>
        </div>
    );
}

function ScoreBar({ label, value, max, color, isLast }: { label: string; value: number; max: number; color: string; isLast?: boolean }) {
    const percent = Math.round((value / max) * 100);
    return (
        <div style={{ marginBottom: isLast ? 0 : 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#8e8e8e' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}/{max}</span>
            </div>
            <div style={{ height: 6, background: '#262626', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 3 }} />
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ padding: 14, background: '#1c1c1e', borderRadius: 10, border: '1px solid #262626' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#8e8e8e', marginTop: 2 }}>{label}</div>
        </div>
    );
}
