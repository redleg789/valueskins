'use client';

import { useState } from 'react';

/**
 * Scoring Transparency Page
 * 
 * BLOCKER: Trust, verification, and fraud resistance layer
 * 
 * Shows exactly how scores are calculated.
 * No black boxes. Full transparency.
 */

const ALGORITHM = {
    version: 'v1.0.0',
    components: [
        { name: 'Activity Score', weight: 30, description: 'Posting frequency and consistency' },
        { name: 'Engagement Score', weight: 30, description: 'Likes, comments, shares received' },
        { name: 'Consistency Score', weight: 20, description: 'Regular posting schedule' },
        { name: 'Verification Score', weight: 20, description: 'Connected & verified platforms' },
    ],
    levels: [
        { level: 1, name: 'Newcomer', minScore: 0, maxScore: 1999, color: '#6b7280' },
        { level: 2, name: 'Rising', minScore: 2000, maxScore: 3999, color: '#3b82f6' },
        { level: 3, name: 'Established', minScore: 4000, maxScore: 5999, color: '#8b5cf6' },
        { level: 4, name: 'Expert', minScore: 6000, maxScore: 7999, color: '#f59e0b' },
        { level: 5, name: 'Legend', minScore: 8000, maxScore: 10000, color: '#ef4444' },
    ],
};

export default function ScoringPage() {
    const [simulatorValues, setSimulatorValues] = useState({ activity: 50, engagement: 50, consistency: 50, verification: 50 });

    const calculateScore = () => {
        return Math.floor(
            (simulatorValues.activity * ALGORITHM.components[0].weight / 100) +
            (simulatorValues.engagement * ALGORITHM.components[1].weight / 100) +
            (simulatorValues.consistency * ALGORITHM.components[2].weight / 100) +
            (simulatorValues.verification * ALGORITHM.components[3].weight / 100)
        ) * 100;
    };

    const score = calculateScore();
    const level = ALGORITHM.levels.find(l => score >= l.minScore && score <= l.maxScore) || ALGORITHM.levels[0];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>📊 How Scoring Works</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Full transparency. No black boxes. Verify everything yourself.</p>

                {/* Algorithm Version */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '100px', marginBottom: '2rem' }}>
                    <span style={{ color: '#22c55e' }}>✓</span>
                    <span style={{ fontSize: '0.9rem' }}>Algorithm {ALGORITHM.version} • On-chain verified</span>
                </div>

                {/* Score Components */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Score Components</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {ALGORITHM.components.map((comp, i) => (
                            <div key={i} style={{ padding: '1.5rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{comp.name}</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{comp.weight}%</span>
                                </div>
                                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{comp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Level Thresholds */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Level Thresholds</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {ALGORITHM.levels.map(l => (
                            <div key={l.level} style={{ flex: 1, textAlign: 'center', padding: '1rem', background: `${l.color}10`, border: `1px solid ${l.color}40`, borderRadius: '12px' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: l.color }}>L{l.level}</div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{l.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{l.minScore.toLocaleString()} - {l.maxScore.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score Simulator */}
                <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>🧮 Score Simulator</h2>
                    <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Adjust the sliders to see how your score would change</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {Object.entries(simulatorValues).map(([key, value]) => (
                                <div key={key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ textTransform: 'capitalize' }}>{key}</label>
                                        <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{value}</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={value} onChange={e => setSimulatorValues({ ...simulatorValues, [key]: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#8b5cf6' }} />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '0.5rem' }}>Simulated Score</div>
                            <div style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score.toLocaleString()}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: level.color }}>L{level.level}</span>
                                <span style={{ color: level.color }}>{level.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification */}
                <div style={{ marginTop: '2rem', textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <p style={{ color: '#71717a', marginBottom: '0.5rem' }}>All scoring logic is on-chain and auditable</p>
                    <code style={{ fontSize: '0.85rem', color: '#8b5cf6' }}>Contract: 0x1234...5678</code>
                </div>
            </div>
        </div>
    );
}
