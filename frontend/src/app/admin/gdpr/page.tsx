'use client';

import { useState } from 'react';

type DeletionStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface DeletionRequest {
    id: number;
    user_id: number;
    username: string;
    email: string;
    scope: string;
    reason: string | null;
    status: DeletionStatus;
    requested_at: string;
    must_complete_by: string;
    completed_at: string | null;
    deleted_tables: string[] | null;
}

const MOCK_REQUESTS: DeletionRequest[] = [
    {
        id: 1, user_id: 101, username: 'alex_codes', email: 'alex@example.com',
        scope: 'full', reason: 'No longer use the platform',
        status: 'pending', requested_at: '2026-02-10T12:00:00Z',
        must_complete_by: '2026-03-12T12:00:00Z', completed_at: null, deleted_tables: null,
    },
    {
        id: 2, user_id: 204, username: 'brand_co', email: 'legal@brandco.com',
        scope: 'marketing_only', reason: 'GDPR opt-out from marketing',
        status: 'processing', requested_at: '2026-02-15T09:00:00Z',
        must_complete_by: '2026-03-17T09:00:00Z', completed_at: null, deleted_tables: null,
    },
    {
        id: 3, user_id: 88, username: 'old_creator', email: 'old@ex.com',
        scope: 'full', reason: null,
        status: 'completed', requested_at: '2026-01-20T08:00:00Z',
        must_complete_by: '2026-02-19T08:00:00Z',
        completed_at: '2026-02-01T14:22:00Z',
        deleted_tables: ['creator_credentials', 'community_posts', 'persona_titles', 'testimonials (anonymized)', 'users (anonymized)'],
    },
];

const STATUS_STYLE: Record<DeletionStatus, { bg: string; color: string }> = {
    pending:    { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    processing: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    completed:  { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    cancelled:  { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af' },
};

function daysUntil(dateStr: string) {
    const d = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(d / 86400000);
    return days;
}

export default function GdprPage() {
    const [requests, setRequests] = useState<DeletionRequest[]>(MOCK_REQUESTS);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const processRequest = (id: number) => {
        setRequests(prev => prev.map(r =>
            r.id === id ? {
                ...r, status: 'completed' as DeletionStatus,
                completed_at: new Date().toISOString(),
                deleted_tables: ['creator_credentials', 'community_posts', 'community_members', 'persona_titles', 'testimonials (anonymized)', 'users (anonymized)'],
            } : r
        ));
        showToast('Deletion processed — user data anonymized and PII removed');
    };

    const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
    const overdueCount = requests.filter(r => {
        const remaining = daysUntil(r.must_complete_by);
        return (r.status === 'pending' || r.status === 'processing') && remaining < 0;
    }).length;

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
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#f59e0b' }}>
                        {pendingCount} Active
                    </div>
                    {overdueCount > 0 && (
                        <div style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#ef4444' }}>
                            {overdueCount} OVERDUE
                        </div>
                    )}
                </div>
            </div>

            {/* Compliance notice */}
            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: '0.35rem' }}>Compliance Requirements</div>
                <div style={{ color: '#93c5fd' }}>
                    Under GDPR Art. 17, erasure requests must be honored within <strong>30 calendar days</strong>.
                    Failed compliance can result in fines up to €20M or 4% of global annual turnover.
                    All deletions are logged and auditable.
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map(req => {
                    const s = STATUS_STYLE[req.status];
                    const remaining = daysUntil(req.must_complete_by);
                    const isOverdue = remaining < 0 && req.status !== 'completed' && req.status !== 'cancelled';
                    const isUrgent = remaining <= 7 && remaining >= 0 && req.status !== 'completed';

                    return (
                        <div key={req.id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.5)' : isUrgent ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: '10px', padding: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                        <span style={{ fontWeight: 700 }}>@{req.username}</span>
                                        <span style={{ color: '#71717a', fontSize: '0.85rem' }}>{req.email}</span>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.25rem', color: '#71717a', fontSize: '0.82rem' }}>
                                        <span>Scope: <span style={{ color: '#a1a1aa' }}>{req.scope}</span></span>
                                        <span>Requested: <span style={{ color: '#a1a1aa' }}>{new Date(req.requested_at).toLocaleDateString()}</span></span>
                                        <span style={{ color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#71717a' }}>
                                            Deadline: {new Date(req.must_complete_by).toLocaleDateString()}
                                            {req.status !== 'completed' && ` (${isOverdue ? `${Math.abs(remaining)}d overdue` : `${remaining}d left`})`}
                                        </span>
                                    </div>
                                    {req.reason && (
                                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                                            Reason: {req.reason}
                                        </div>
                                    )}
                                </div>
                                {(req.status === 'pending' || req.status === 'processing') && (
                                    <button
                                        onClick={() => processRequest(req.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                            border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                                            borderRadius: '8px',
                                            color: isOverdue ? '#ef4444' : '#22c55e',
                                            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {isOverdue ? '⚠ Process Now (Overdue)' : 'Process Deletion'}
                                    </button>
                                )}
                            </div>

                            {req.status === 'completed' && req.deleted_tables && (
                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: '0.5rem' }}>
                                        Completed {req.completed_at ? new Date(req.completed_at).toLocaleDateString() : ''} — data deleted from:
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                        {req.deleted_tables.map(t => (
                                            <span key={t} style={{ padding: '0.2rem 0.5rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
