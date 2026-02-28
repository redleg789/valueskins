'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, GdprRequest } from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    pending:    { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    processing: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    completed:  { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    cancelled:  { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af' },
};

export default function GdprPage() {
    const [requests, setRequests] = useState<GdprRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const result = await api.admin.listGdprRequests(100, 0);
        if (result.data) {
            setRequests(result.data.requests);
        } else {
            setError(result.error || 'Failed to load GDPR requests');
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const processRequest = async (id: number) => {
        const result = await api.admin.processGdprRequest(id);
        if (result.data?.processing) {
            showToast('Deletion processing started');
            fetchRequests();
        } else {
            showToast(`Failed: ${result.error || 'Unknown error'}`);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;

    if (loading) return <div style={{ padding: '2rem', color: '#71717a' }}>Loading GDPR requests...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '900px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>GDPR Data Deletions</h1>
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Right to Erasure requests — must complete within 30 days (GDPR Art. 17)</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#f59e0b' }}>
                    {pendingCount} Active
                </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: '0.35rem' }}>Compliance Requirements</div>
                <div style={{ color: '#93c5fd' }}>
                    Under GDPR Art. 17, erasure requests must be honored within <strong>30 calendar days</strong>.
                    Failed compliance can result in fines up to 20M EUR or 4% of global annual turnover.
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map(req => {
                    const s = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
                    return (
                        <div key={req.id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px', padding: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                        <span style={{ fontWeight: 700 }}>Request #{req.id}</span>
                                        <span style={{ color: '#71717a', fontSize: '0.85rem' }}>User #{req.user_id}</span>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.25rem', color: '#71717a', fontSize: '0.82rem' }}>
                                        <span>Scope: <span style={{ color: '#a1a1aa' }}>{req.scope}</span></span>
                                        <span>Requested: <span style={{ color: '#a1a1aa' }}>{new Date(req.requested_at).toLocaleDateString()}</span></span>
                                        {req.processed_at && <span>Processed: <span style={{ color: '#22c55e' }}>{new Date(req.processed_at).toLocaleDateString()}</span></span>}
                                    </div>
                                </div>
                                {(req.status === 'pending') && (
                                    <button
                                        onClick={() => processRequest(req.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(34,197,94,0.15)',
                                            border: '1px solid rgba(34,197,94,0.4)',
                                            borderRadius: '8px',
                                            color: '#22c55e',
                                            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Process Deletion
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {requests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>No GDPR requests found.</div>
                )}
            </div>
        </div>
    );
}
