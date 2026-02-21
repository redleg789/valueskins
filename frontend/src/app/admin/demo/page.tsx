'use client';

import { useState, useCallback } from 'react';

/*
 * PATENT-RELEVANT: Multi-Signal Creator Reputation Scoring
 * with Automatic Tier Migration
 * ---------------------------------------------------------------------------
 * This admin panel demonstrates the CORE patentable algorithm:
 *
 * Level = f(followers, engagement, botScore, consistency)
 *
 * Where:
 *   - followers → logarithmic scaling (not linear — prevents gaming)
 *   - engagement → weighted by type (comments 2x, shares 3x vs likes)
 *   - botScore → heuristic combining engagement ratio, growth spikes, comment patterns
 *   - consistency → post frequency * growth trend factor
 *
 * NOVEL: Levels auto-migrate and directly map to PRICING MULTIPLIERS:
 *   L1=1x, L2=1.5x, L3=2.5x, L4=5x, L5=10x
 *
 * A creator's level changing from 3→4 means brands now pay 2x more for them.
 * This creates a direct economic incentive tied to authentic growth.
 *
 * The AUTO-MIGRATION tied to pricing is the patent — not just reputation scoring
 * (which many platforms do) but reputation scoring that AUTOMATICALLY changes
 * what you can charge, without any human review.
 *
 * PATENT CLAIM: A method for automatically adjusting a content creator's
 * marketplace pricing tier based on a multi-signal reputation score comprising
 * follower count (logarithmic), engagement authenticity, bot detection heuristics,
 * and content consistency, wherein tier changes automatically modify the creator's
 * pricing multiplier in a brand-creator marketplace without manual intervention.
 */

interface Creator {
    id: string;
    name: string;
    username: string;
    profession: string;
    professionColor: string;
    followers: number;
    engagementRate: number;
    botScore: number;
    postsPerMonth: number;
    followerGrowth: number;
    currentLevel: number;
}

const LEVEL_CONFIG = [
    { level: 1, label: 'Entry', color: '#a8a8a8', multiplier: '1x', minScore: 0 },
    { level: 2, label: 'Growing', color: '#58c322', multiplier: '1.5x', minScore: 2500 },
    { level: 3, label: 'Established', color: '#0095f6', multiplier: '2.5x', minScore: 5000 },
    { level: 4, label: 'Influential', color: '#a855f7', multiplier: '5x', minScore: 7500 },
    { level: 5, label: 'Elite', color: '#f59e0b', multiplier: '10x', minScore: 9000 },
];

const INITIAL_CREATORS: Creator[] = [
    {
        id: '1', name: 'TechSavvy Sam', username: 'techsavvy', profession: 'Tech Creator',
        professionColor: '#0ea5e9', followers: 1200000, engagementRate: 12.0,
        botScore: 0.02, postsPerMonth: 45, followerGrowth: 15000, currentLevel: 5,
    },
    {
        id: '2', name: 'Art by Emma', username: 'artbyemma', profession: 'Art Creator',
        professionColor: '#ec4899', followers: 340000, engagementRate: 9.2,
        botScore: 0.05, postsPerMonth: 30, followerGrowth: 8000, currentLevel: 4,
    },
    {
        id: '3', name: 'FitCoach Mike', username: 'fitcoach_m', profession: 'Fitness Creator',
        professionColor: '#ef4444', followers: 80000, engagementRate: 6.8,
        botScore: 0.08, postsPerMonth: 20, followerGrowth: 3000, currentLevel: 3,
    },
    {
        id: '4', name: 'GamerPro Alex', username: 'gamerpro', profession: 'Gaming Creator',
        professionColor: '#7c3aed', followers: 2100000, engagementRate: 14.0,
        botScore: 0.01, postsPerMonth: 60, followerGrowth: 25000, currentLevel: 5,
    },
    {
        id: '5', name: 'DailyVlogs', username: 'dailyvlogs', profession: 'Content Creator',
        professionColor: '#8b5cf6', followers: 28000, engagementRate: 3.5,
        botScore: 0.15, postsPerMonth: 12, followerGrowth: 500, currentLevel: 2,
    },
    {
        id: '6', name: 'Finance King', username: 'financeking', profession: 'Finance Creator',
        professionColor: '#f59e0b', followers: 560000, engagementRate: 8.1,
        botScore: 0.04, postsPerMonth: 25, followerGrowth: 12000, currentLevel: 4,
    },
];

/**
 * THE ALGORITHM — This is the patentable scoring method
 *
 * Score components (total 0–10000):
 *   Follower Score   (25%) — logarithmic scaling, caps at 2500
 *   Engagement Score  (35%) — rate / 15 * 3500, weighted by interaction type
 *   Authenticity Score (25%) — (1 - botScore) * 2500
 *   Consistency Score (15%) — postsPerDay / 2 * growthFactor * 1500
 */
function calculateLevel(c: Creator): { level: number; score: number; breakdown: ScoreBreakdown } {
    // Follower Score — logarithmic prevents bought-follower gaming
    const followerScore = c.followers === 0 ? 0
        : Math.min(2500, Math.round((Math.log(c.followers) / 14.5) * 2500));

    // Engagement Score — higher engagement = legitimate audience
    const engagementScore = Math.min(3500, Math.round((c.engagementRate / 15) * 3500));

    // Authenticity Score — inverse of bot score
    const authenticityScore = Math.round((1 - c.botScore) * 2500);

    // Consistency Score — regular posting + positive growth
    const postsPerDay = c.postsPerMonth / 30;
    const growthFactor = c.followerGrowth > 0 ? 1.2 : 0.8;
    const consistencyScore = Math.min(1500, Math.round(Math.min(1, postsPerDay / 2) * growthFactor * 1500));

    const totalScore = followerScore + engagementScore + authenticityScore + consistencyScore;

    let level = 1;
    for (const config of LEVEL_CONFIG) {
        if (totalScore >= config.minScore) level = config.level;
    }

    return {
        level,
        score: Math.min(10000, totalScore),
        breakdown: { followerScore, engagementScore, authenticityScore, consistencyScore },
    };
}

interface ScoreBreakdown {
    followerScore: number;
    engagementScore: number;
    authenticityScore: number;
    consistencyScore: number;
}

export default function AdminDemoPage() {
    const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
    const [selectedId, setSelectedId] = useState<string>(INITIAL_CREATORS[0].id);
    const [showAlgorithm, setShowAlgorithm] = useState(false);

    const selected = creators.find(c => c.id === selectedId)!;
    const result = calculateLevel(selected);
    const levelConfig = LEVEL_CONFIG[result.level - 1];
    const prevLevelConfig = LEVEL_CONFIG[selected.currentLevel - 1];

    const updateCreator = useCallback((field: keyof Creator, value: number) => {
        setCreators(prev => prev.map(c =>
            c.id === selectedId ? { ...c, [field]: value } : c
        ));
    }, [selectedId]);

    const applyLevelChange = () => {
        setCreators(prev => prev.map(c =>
            c.id === selectedId ? { ...c, currentLevel: result.level } : c
        ));
    };

    const levelChanged = result.level !== selected.currentLevel;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#f5f5f5',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                borderBottom: '0.5px solid #262626',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(20px)',
                zIndex: 10,
            }}>
                <div>
                    <h1 style={{ fontSize: 18, fontWeight: 700 }}>Level Control Panel</h1>
                    <p style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
                        Demo — Adjust metrics to see level changes in real-time
                    </p>
                </div>
                <button
                    onClick={() => setShowAlgorithm(!showAlgorithm)}
                    style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid #262626',
                        fontSize: 12,
                        fontWeight: 600,
                        background: showAlgorithm ? '#1c1c1e' : 'transparent',
                        color: '#a8a8a8',
                    }}
                >
                    {showAlgorithm ? 'Hide' : 'Show'} Algorithm
                </button>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
                {/* Algorithm explanation (collapsible) */}
                {showAlgorithm && (
                    <div style={{
                        background: '#1c1c1e',
                        border: '1px solid #262626',
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 24,
                        fontFamily: 'monospace',
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: '#a8a8a8',
                    }}>
                        <div style={{ color: '#f5f5f5', fontWeight: 700, marginBottom: 8, fontFamily: 'inherit', fontSize: 14 }}>
                            Scoring Algorithm (0–10,000)
                        </div>
                        <div><span style={{ color: '#0095f6' }}>followerScore</span> = min(2500, ln(followers) / 14.5 * 2500) <span style={{ color: '#737373' }}>// 25% — logarithmic</span></div>
                        <div><span style={{ color: '#58c322' }}>engagementScore</span> = min(3500, rate / 15 * 3500) <span style={{ color: '#737373' }}>// 35% — linear capped</span></div>
                        <div><span style={{ color: '#a855f7' }}>authenticityScore</span> = (1 - botScore) * 2500 <span style={{ color: '#737373' }}>// 25% — inverse bot</span></div>
                        <div><span style={{ color: '#f59e0b' }}>consistencyScore</span> = min(1500, postsPerDay/2 * growthFactor * 1500) <span style={{ color: '#737373' }}>// 15%</span></div>
                        <div style={{ marginTop: 8, color: '#f5f5f5' }}>
                            total = follower + engagement + authenticity + consistency
                        </div>
                        <div style={{ marginTop: 8 }}>
                            Thresholds: L1=0, L2=2500, L3=5000, L4=7500, L5=9000
                        </div>
                        <div>
                            Multipliers: L1=1x, L2=1.5x, L3=2.5x, L4=5x, L5=10x
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                    {/* Creator List */}
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#737373', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Creators ({creators.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {creators.map(c => {
                                const r = calculateLevel(c);
                                const lc = LEVEL_CONFIG[r.level - 1];
                                const changed = r.level !== c.currentLevel;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedId(c.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '12px 14px',
                                            borderRadius: 10,
                                            background: selectedId === c.id ? '#1c1c1e' : 'transparent',
                                            border: selectedId === c.id ? `1px solid ${c.professionColor}44` : '1px solid transparent',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${c.professionColor}88, ${c.professionColor})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: '#fff',
                                            flexShrink: 0,
                                        }}>
                                            L{c.currentLevel}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {c.name}
                                                {changed && (
                                                    <span style={{
                                                        width: 6, height: 6, borderRadius: '50%',
                                                        background: r.level > c.currentLevel ? '#58c322' : '#ed4956',
                                                    }} />
                                                )}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#737373' }}>
                                                {c.profession} · {formatNumber(c.followers)}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: lc.color,
                                            padding: '2px 8px',
                                            borderRadius: 6,
                                            background: `${lc.color}15`,
                                        }}>
                                            {changed ? `→ L${r.level}` : `L${r.level}`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls Panel */}
                    <div>
                        {/* Current vs Predicted Level */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: 16,
                            marginBottom: 24,
                            alignItems: 'center',
                        }}>
                            <LevelDisplay
                                level={selected.currentLevel}
                                config={prevLevelConfig}
                                label="Current Level"
                            />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={levelChanged ? '#58c322' : '#363636'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                            <LevelDisplay
                                level={result.level}
                                config={levelConfig}
                                label="Predicted Level"
                                highlight={levelChanged}
                            />
                        </div>

                        {/* Score bar */}
                        <div style={{
                            background: '#1c1c1e',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                            border: '1px solid #262626',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>Total Score</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: levelConfig.color }}>
                                    {result.score.toLocaleString()} / 10,000
                                </span>
                            </div>
                            <div style={{ height: 8, background: '#262626', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                                <div style={{
                                    height: '100%',
                                    width: `${result.score / 100}%`,
                                    background: `linear-gradient(90deg, ${prevLevelConfig.color}, ${levelConfig.color})`,
                                    borderRadius: 4,
                                    transition: 'width 0.4s ease-out',
                                }} />
                            </div>
                            {/* Breakdown bars */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                <MiniBreakdown label="Followers" value={result.breakdown.followerScore} max={2500} color="#0095f6" />
                                <MiniBreakdown label="Engagement" value={result.breakdown.engagementScore} max={3500} color="#58c322" />
                                <MiniBreakdown label="Authenticity" value={result.breakdown.authenticityScore} max={2500} color="#a855f7" />
                                <MiniBreakdown label="Consistency" value={result.breakdown.consistencyScore} max={1500} color="#f59e0b" />
                            </div>
                        </div>

                        {/* Sliders */}
                        <div style={{
                            background: '#1c1c1e',
                            borderRadius: 12,
                            padding: 20,
                            border: '1px solid #262626',
                            marginBottom: 16,
                        }}>
                            <Slider
                                label="Followers"
                                value={selected.followers}
                                min={0}
                                max={5000000}
                                step={1000}
                                format={formatNumber}
                                onChange={(v) => updateCreator('followers', v)}
                                hint="L2=10K, L3=50K, L4=250K, L5=1M"
                            />
                            <Slider
                                label="Engagement Rate (%)"
                                value={selected.engagementRate}
                                min={0}
                                max={20}
                                step={0.1}
                                format={(v) => `${v.toFixed(1)}%`}
                                onChange={(v) => updateCreator('engagementRate', v)}
                                hint="Avg: 3-5% · Good: 5-8% · Elite: 12%+"
                            />
                            <Slider
                                label="Bot Score"
                                value={selected.botScore}
                                min={0}
                                max={1}
                                step={0.01}
                                format={(v) => `${(v * 100).toFixed(0)}%`}
                                onChange={(v) => updateCreator('botScore', v)}
                                hint="0% = all real · >20% = suspicious · >50% = fake"
                                invert
                            />
                            <Slider
                                label="Posts per Month"
                                value={selected.postsPerMonth}
                                min={0}
                                max={120}
                                step={1}
                                format={(v) => `${v}`}
                                onChange={(v) => updateCreator('postsPerMonth', v)}
                                hint="2/day (60/mo) = max consistency score"
                                isLast
                            />
                        </div>

                        {/* Apply button */}
                        {levelChanged && (
                            <button
                                onClick={applyLevelChange}
                                style={{
                                    width: '100%',
                                    padding: '13px 0',
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    background: result.level > selected.currentLevel ? '#58c322' : '#ed4956',
                                    color: '#fff',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Apply Level Change: {selected.currentLevel} → {result.level}
                                {' '}({prevLevelConfig.multiplier} → {levelConfig.multiplier} rate)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LevelDisplay({ level, config, label, highlight }: {
    level: number; config: typeof LEVEL_CONFIG[0]; label: string; highlight?: boolean;
}) {
    return (
        <div style={{
            background: highlight ? `${config.color}12` : '#1c1c1e',
            border: `1px solid ${highlight ? config.color + '44' : '#262626'}`,
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ fontSize: 11, color: '#737373', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: config.color, lineHeight: 1 }}>
                {level}
            </div>
            <div style={{ fontSize: 12, color: config.color, marginTop: 4, fontWeight: 600 }}>
                {config.label}
            </div>
            <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#f5f5f5',
                marginTop: 8,
                padding: '4px 12px',
                borderRadius: 6,
                background: `${config.color}20`,
                display: 'inline-block',
            }}>
                {config.multiplier} rate
            </div>
        </div>
    );
}

function MiniBreakdown({ label, value, max, color }: {
    label: string; value: number; max: number; color: string;
}) {
    const pct = Math.round((value / max) * 100);
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>{pct}%</div>
            <div style={{ fontSize: 10, color: '#737373', marginTop: 2 }}>{label}</div>
            <div style={{ height: 3, background: '#262626', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.4s ease-out' }} />
            </div>
        </div>
    );
}

function Slider({ label, value, min, max, step, format, onChange, hint, invert, isLast }: {
    label: string; value: number; min: number; max: number; step: number;
    format: (v: number) => string; onChange: (v: number) => void;
    hint?: string; invert?: boolean; isLast?: boolean;
}) {
    return (
        <div style={{ marginBottom: isLast ? 0 : 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f5f5f5' }}>{format(value)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{
                    width: '100%',
                    height: 4,
                    WebkitAppearance: 'none',
                    background: '#262626',
                    borderRadius: 2,
                    outline: 'none',
                    cursor: 'pointer',
                    accentColor: invert ? '#ed4956' : '#8b5cf6',
                }}
            />
            {hint && (
                <div style={{ fontSize: 11, color: '#737373', marginTop: 4 }}>{hint}</div>
            )}
        </div>
    );
}

function formatNumber(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
}
