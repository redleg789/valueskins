'use client';

import { useState } from 'react';

interface TierConfig {
    tier: string;
    rpm: number;
    description: string;
    color: string;
}

const INITIAL_TIERS: TierConfig[] = [
    { tier: 'free',       rpm: 100,    description: 'Default for all unauthenticated or new accounts', color: '#71717a' },
    { tier: 'basic',      rpm: 1000,   description: 'Paid brand accounts, verified creators', color: '#3b82f6' },
    { tier: 'pro',        rpm: 10000,  description: 'Enterprise brand integrations, platform partners', color: '#8b5cf6' },
    { tier: 'enterprise', rpm: 100000, description: 'Unlimited (100k/min hard cap). Large platform integrations', color: '#f59e0b' },
];

interface ApiKeyEntry {
    id: number;
    prefix: string;
    owner: string;
    tier: string;
    requests_per_minute: number;
    last_used: string | null;
    is_active: boolean;
}

const MOCK_API_KEYS: ApiKeyEntry[] = [
    { id: 1, prefix: 'vs_live_A', owner: 'Nike Brands', tier: 'pro', requests_per_minute: 10000, last_used: '2026-02-19T12:00:00Z', is_active: true },
    { id: 2, prefix: 'vs_live_B', owner: 'Coinbase Creator', tier: 'basic', requests_per_minute: 1000, last_used: '2026-02-18T08:30:00Z', is_active: true },
    { id: 3, prefix: 'vs_test_C', owner: 'Dev Sandbox', tier: 'free', requests_per_minute: 100, last_used: null, is_active: false },
];

export default function RateLimitsPage() {
    const [tiers, setTiers] = useState<TierConfig[]>(INITIAL_TIERS);
    const [keys] = useState<ApiKeyEntry[]>(MOCK_API_KEYS);
    const [toast, setToast] = useState('');
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const startEdit = (tier: TierConfig) => {
        setEditing(tier.tier);
        setEditValue(tier.rpm.toString());
    };

    const saveEdit = (tierName: string) => {
        const val = parseInt(editValue, 10);
        if (isNaN(val) || val < 1) return;
        setTiers(prev => prev.map(t => t.tier === tierName ? { ...t, rpm: val } : t));
        setEditing(null);
        showToast(`${tierName} tier updated to ${val.toLocaleString()} req/min`);
    };

    const tierBadge = (tier: string) => {
        const config = INITIAL_TIERS.find(t => t.tier === tier);
        return (
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', background: `${config?.color}22`, color: config?.color, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {tier}
            </span>
        );
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Rate Limits</h1>
            <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Tiered rate limiting: JWT claims carry the user tier, API keys carry their configured tier.
                IP-based global limit (60/min) applies to all traffic regardless of tier.
            </p>

            {/* How it works */}
            <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c4b5fd' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Resolution priority</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#a78bfa' }}>
                    <div>1. <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>X-Resolved-Tier</code> header (injected by API key validation middleware)</div>
                    <div>2. JWT claim <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>tier</code> field embedded at login</div>
                    <div>3. IP address → default <strong>free</strong> (100 req/min)</div>
                </div>
            </div>

            {/* Tier config table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 600, fontSize: '0.95rem' }}>
                    Tier Limits Configuration
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            {['Tier', 'Req / Min', 'Req / Hour (approx)', 'Description', ''].map(h => (
                                <th key={h} style={{ padding: '0.75rem 1rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map(t => (
                            <tr key={t.tier} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.9rem 1rem' }}>{tierBadge(t.tier)}</td>
                                <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>
                                    {editing === t.tier ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                style={{ width: '90px', padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                                autoFocus
                                                onKeyDown={e => e.key === 'Enter' && saveEdit(t.tier)}
                                            />
                                            <button onClick={() => saveEdit(t.tier)} style={{ padding: '0.3rem 0.6rem', background: '#22c55e', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>✓</button>
                                            <button onClick={() => setEditing(null)} style={{ padding: '0.3rem 0.6rem', background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '4px', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                                        </div>
                                    ) : (
                                        <span style={{ color: t.color }}>{t.rpm.toLocaleString()}</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.9rem 1rem', color: '#71717a' }}>{(t.rpm * 60).toLocaleString()}</td>
                                <td style={{ padding: '0.9rem 1rem', color: '#a1a1aa' }}>{t.description}</td>
                                <td style={{ padding: '0.9rem 1rem' }}>
                                    {editing !== t.tier && (
                                        <button onClick={() => startEdit(t)} style={{ padding: '0.3rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#a1a1aa', fontSize: '0.8rem', cursor: 'pointer' }}>
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* API Keys */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Active API Keys</span>
                    <button style={{ padding: '0.4rem 0.9rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#8b5cf6', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                        + Issue New Key
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            {['Key Prefix', 'Owner', 'Tier', 'RPM', 'Last Used', 'Status'].map(h => (
                                <th key={h} style={{ padding: '0.75rem 1rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map(k => (
                            <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', color: '#a1a1aa' }}>{k.prefix}****</td>
                                <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{k.owner}</td>
                                <td style={{ padding: '0.9rem 1rem' }}>{tierBadge(k.tier)}</td>
                                <td style={{ padding: '0.9rem 1rem', color: '#71717a' }}>{k.requests_per_minute.toLocaleString()}</td>
                                <td style={{ padding: '0.9rem 1rem', color: '#6b7280', fontSize: '0.8rem' }}>
                                    {k.last_used ? new Date(k.last_used).toLocaleDateString() : 'Never'}
                                </td>
                                <td style={{ padding: '0.9rem 1rem' }}>
                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '100px', background: k.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: k.is_active ? '#22c55e' : '#9ca3af', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {k.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
