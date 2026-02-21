'use client';

import { useState } from 'react';

type DisputeStatus = 'open' | 'under_review' | 'resolved_creator' | 'resolved_brand' | 'resolved_split' | 'dismissed';

interface Dispute {
    id: number;
    deal_room_id: number;
    raised_by: string;
    against: string;
    reason: string;
    status: DisputeStatus;
    created_at: string;
    resolution_notes?: string;
}

const MOCK_DISPUTES: Dispute[] = [
    {
        id: 1, deal_room_id: 42, raised_by: 'alex_codes', against: 'Nike Brands',
        reason: 'Deliverables not meeting quality standards specified in contract',
        status: 'under_review', created_at: '2026-02-18T10:00:00Z',
    },
    {
        id: 2, deal_room_id: 43, raised_by: 'Nike Brands', against: 'priya_builds',
        reason: 'Missed deadline by 3 days without communication',
        status: 'open', created_at: '2026-02-19T14:30:00Z',
    },
    {
        id: 3, deal_room_id: 40, raised_by: 'stripe_creators', against: 'ml_marcus',
        reason: 'Agreed on 3 posts, only delivered 2',
        status: 'resolved_split', created_at: '2026-02-10T09:00:00Z',
        resolution_notes: 'Creator refunded $1,500 for missing post. Brand kept $3,500.'
    },
];

const STATUS_STYLE: Record<DisputeStatus, { bg: string; color: string }> = {
    open:            { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    under_review:    { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    resolved_creator:{ bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    resolved_brand:  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
    resolved_split:  { bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6' },
    dismissed:       { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af' },
};

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const resolveDispute = (id: number, resolution: DisputeStatus) => {
        setDisputes(prev => prev.map(d =>
            d.id === id ? { ...d, status: resolution, resolution_notes: resolutionNotes } : d
        ));
        setSelectedId(null);
        setResolutionNotes('');
        showToast(`Dispute resolved: ${resolution.replace(/_/g, ' ')}`);
    };

    const openCount = disputes.filter(d => d.status === 'open').length;
    const reviewCount = disputes.filter(d => d.status === 'under_review').length;

    return (
        <div style={{ maxWidth: '900px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dispute Resolution</h1>
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Mediate creator-brand conflicts using on-chain or manual arbitration</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#f59e0b' }}>
                        {openCount} Open
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#3b82f6' }}>
                        {reviewCount} Reviewing
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {disputes.map(d => {
                    const s = STATUS_STYLE[d.status];
                    return (
                        <div
                            key={d.id}
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: `1px solid ${selectedId === d.id ? '#EF4444' : 'rgba(255,255,255,0.07)'}`,
                                borderRadius: '10px', padding: '1.25rem', cursor: 'pointer',
                            }}
                            onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                        <span style={{ fontWeight: 700 }}>Dispute #{d.id}</span>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
                                            {d.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#71717a', fontSize: '0.85rem' }}>
                                        <span><strong>Raised by:</strong> @{d.raised_by}</span>
                                        <span><strong>Against:</strong> {d.against}</span>
                                        <span style={{ color: '#6b7280' }}>{new Date(d.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {(d.status === 'open' || d.status === 'under_review') && (
                                    <button
                                        onClick={e => { e.stopPropagation(); }}
                                        style={{
                                            padding: '0.4rem 0.75rem', background: 'rgba(59,130,246,0.15)',
                                            border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px',
                                            color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600
                                        }}
                                    >
                                        Review
                                    </button>
                                )}
                            </div>

                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', color: '#a1a1aa' }}>
                                <strong>Issue:</strong> {d.reason}
                            </div>

                            {selectedId === d.id && (d.status === 'open' || d.status === 'under_review') && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>
                                        Resolution Notes
                                    </div>
                                    <textarea
                                        value={resolutionNotes}
                                        onChange={e => setResolutionNotes(e.target.value)}
                                        placeholder="Document evidence, terms, and reasoning for resolution..."
                                        style={{
                                            width: '100%', padding: '0.75rem', minHeight: '80px',
                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                                        <button onClick={() => resolveDispute(d.id, 'resolved_creator')} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#22c55e', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            ✓ Creator Win
                                        </button>
                                        <button onClick={() => resolveDispute(d.id, 'resolved_brand')} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            ✓ Brand Win
                                        </button>
                                        <button onClick={() => resolveDispute(d.id, 'resolved_split')} style={{ padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            ◆ Split Settlement
                                        </button>
                                        <button onClick={() => resolveDispute(d.id, 'dismissed')} style={{ padding: '0.5rem 1rem', background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.4)', borderRadius: '8px', color: '#9ca3af', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}

                            {d.resolution_notes && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(34,197,94,0.08)', borderRadius: '8px', fontSize: '0.85rem', color: '#86efac', borderLeft: '3px solid #22c55e' }}>
                                    <strong>Resolution:</strong> {d.resolution_notes}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
