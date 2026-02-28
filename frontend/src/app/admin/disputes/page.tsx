'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, AdminDispute } from '@/lib/api';

type DisputeStatus = 'open' | 'under_review' | 'resolved_creator' | 'resolved_brand' | 'resolved_split' | 'dismissed';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    open:            { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    under_review:    { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    resolved_creator:{ bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    resolved_brand:  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
    resolved_split:  { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
    dismissed:       { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af' },
};

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<AdminDispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchDisputes = useCallback(async () => {
        setLoading(true);
        const result = await api.admin.listDisputes(100, 0);
        if (result.data) {
            setDisputes(result.data.disputes);
        } else {
            setError(result.error || 'Failed to load disputes');
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

    const resolveDispute = async (id: number, resolution: DisputeStatus) => {
        const result = await api.admin.resolveDispute(id, resolution, resolutionNotes || undefined);
        if (result.data?.resolved) {
            showToast(`Dispute resolved: ${resolution.replace(/_/g, ' ')}`);
            setSelectedId(null);
            setResolutionNotes('');
            fetchDisputes();
        } else {
            showToast(`Failed: ${result.error || 'Unknown error'}`);
        }
    };

    const openCount = disputes.filter(d => d.status === 'open').length;
    const reviewCount = disputes.filter(d => d.status === 'under_review').length;

    if (loading) return <div style={{ padding: '2rem', color: '#71717a' }}>Loading disputes...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;

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
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Mediate creator-brand conflicts</p>
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
                    const s = STATUS_STYLE[d.status] || STATUS_STYLE.open;
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
                                        <span>Deal Room #{d.deal_room_id}</span>
                                        <span>Raised by User #{d.raised_by_user_id}</span>
                                        <span style={{ color: '#6b7280' }}>{new Date(d.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', color: '#a1a1aa' }}>
                                <strong>Issue:</strong> {d.reason}
                            </div>

                            {selectedId === d.id && (d.status === 'open' || d.status === 'under_review') && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>Resolution Notes</div>
                                    <textarea
                                        value={resolutionNotes}
                                        onChange={e => setResolutionNotes(e.target.value)}
                                        placeholder="Document evidence, terms, and reasoning..."
                                        style={{
                                            width: '100%', padding: '0.75rem', minHeight: '80px',
                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                                        <button onClick={() => resolveDispute(d.id, 'resolved_creator')} style={{ padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#22c55e', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Creator Win
                                        </button>
                                        <button onClick={() => resolveDispute(d.id, 'resolved_brand')} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Brand Win
                                        </button>
                                        <button onClick={() => resolveDispute(d.id, 'resolved_split')} style={{ padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Split Settlement
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
