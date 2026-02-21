'use client';

import { useState } from 'react';

type VerifStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';

interface BrandVerification {
    id: number;
    brand_user_id: number;
    status: VerifStatus;
    legal_name: string;
    country_code: string;
    website_url: string;
    document_urls: string[];
    submitted_at: string;
    email: string;
    username: string;
    reviewer_notes?: string;
}

const INITIAL_QUEUE: BrandVerification[] = [
    {
        id: 1, brand_user_id: 201, status: 'pending',
        legal_name: 'Nike Inc.', country_code: 'US', website_url: 'https://nike.com',
        document_urls: ['https://storage.example.com/docs/nike_reg.pdf'],
        submitted_at: '2026-02-18T10:00:00Z',
        email: 'partnerships@nike.com', username: 'nike_brands',
    },
    {
        id: 2, brand_user_id: 202, status: 'under_review',
        legal_name: 'Unknown Drops Ltd', country_code: 'GB', website_url: 'https://unknowndrops.io',
        document_urls: ['https://storage.example.com/docs/ud_cert.pdf', 'https://storage.example.com/docs/ud_vat.pdf'],
        submitted_at: '2026-02-17T14:30:00Z',
        email: 'admin@unknowndrops.io', username: 'unknown_drops',
    },
    {
        id: 3, brand_user_id: 203, status: 'pending',
        legal_name: 'Stripe Inc.', country_code: 'US', website_url: 'https://stripe.com',
        document_urls: ['https://storage.example.com/docs/stripe_reg.pdf'],
        submitted_at: '2026-02-19T08:15:00Z',
        email: 'creators@stripe.com', username: 'stripe_creators',
    },
];

const VERIFIED_BRANDS = [
    { id: 4, name: 'Coinbase', industry: 'Crypto', opportunities: 5, spent: '$45,000', verified_at: '2026-01-15' },
    { id: 5, name: 'Shopify', industry: 'E-commerce', opportunities: 8, spent: '$92,000', verified_at: '2026-01-22' },
];

const STATUS_STYLES: Record<VerifStatus, { bg: string; color: string; label: string }> = {
    pending:      { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Pending' },
    under_review: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Under Review' },
    verified:     { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', label: 'Verified' },
    rejected:     { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: 'Rejected' },
    suspended:    { bg: 'rgba(107,114,128,0.15)',color: '#6b7280', label: 'Suspended' },
};

function StatusBadge({ status }: { status: VerifStatus }) {
    const s = STATUS_STYLES[status];
    return (
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', background: s.bg, color: s.color, fontWeight: 600 }}>
            {s.label}
        </span>
    );
}

export default function BrandManagementPage() {
    const [queue, setQueue] = useState<BrandVerification[]>(INITIAL_QUEUE);
    const [selected, setSelected] = useState<BrandVerification | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [toast, setToast] = useState('');
    const [activeTab, setActiveTab] = useState<'queue' | 'verified'>('queue');

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDecision = (brandId: number, decision: 'verified' | 'rejected') => {
        setQueue(prev => prev.map(b =>
            b.id === brandId
                ? { ...b, status: decision, reviewer_notes: reviewNotes }
                : b
        ));
        setSelected(null);
        setReviewNotes('');
        showToast(decision === 'verified'
            ? 'Brand verified — they can now post opportunities'
            : 'Brand rejected — notification sent with reason');
    };

    const handleMarkUnderReview = (brandId: number) => {
        setQueue(prev => prev.map(b =>
            b.id === brandId ? { ...b, status: 'under_review' } : b
        ));
        showToast('Marked as under review');
    };

    const pendingCount = queue.filter(b => b.status === 'pending').length;
    const reviewCount = queue.filter(b => b.status === 'under_review').length;

    const cardStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Brand Verification</h1>
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Review and approve brand business identity before they can post opportunities</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#f59e0b' }}>
                        {pendingCount} Pending
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#3b82f6' }}>
                        {reviewCount} Under Review
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {(['queue', 'verified'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.25rem', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #EF4444' : '2px solid transparent',
                        color: activeTab === tab ? '#EF4444' : '#71717a',
                        fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer',
                        fontSize: '0.9rem', textTransform: 'capitalize'
                    }}>
                        {tab === 'queue' ? 'Verification Queue' : 'Verified Brands'}
                    </button>
                ))}
            </div>

            {activeTab === 'queue' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {queue.filter(b => b.status !== 'verified').map(brand => (
                        <div
                            key={brand.id}
                            style={{ ...cardStyle, borderColor: selected?.id === brand.id ? '#EF4444' : 'rgba(255,255,255,0.07)' }}
                            onClick={() => setSelected(selected?.id === brand.id ? null : brand)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{brand.legal_name}</span>
                                        <StatusBadge status={brand.status} />
                                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{brand.country_code}</span>
                                    </div>
                                    <div style={{ color: '#71717a', fontSize: '0.85rem', display: 'flex', gap: '1.5rem' }}>
                                        <span>{brand.email}</span>
                                        <span>@{brand.username}</span>
                                        <span>{brand.website_url}</span>
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                                        Submitted: {new Date(brand.submitted_at).toLocaleDateString()} ·
                                        {brand.document_urls.length} document{brand.document_urls.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    {brand.status === 'pending' && (
                                        <button
                                            onClick={e => { e.stopPropagation(); handleMarkUnderReview(brand.id); }}
                                            style={{ padding: '0.4rem 0.75rem', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            Start Review
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded review panel */}
                            {selected?.id === brand.id && (
                                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}
                                     onClick={e => e.stopPropagation()}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Documents</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                            {brand.document_urls.map((url, i) => (
                                                <a key={i} href={url} target="_blank" rel="noreferrer"
                                                   style={{ color: '#8b5cf6', fontSize: '0.85rem', textDecoration: 'underline' }}>
                                                    Document {i + 1} →
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Review Notes (required for rejection)</div>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={e => setReviewNotes(e.target.value)}
                                            placeholder="e.g. 'Documents verified against Companies House registration #12345' or 'Rejected: website unreachable, registration number invalid'"
                                            style={{
                                                width: '100%', padding: '0.75rem',
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px', color: 'white', fontSize: '0.85rem',
                                                minHeight: '80px', resize: 'vertical', boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => handleDecision(brand.id, 'verified')}
                                            style={{ padding: '0.6rem 1.25rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', color: '#22c55e', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                            ✓ Verify Brand
                                        </button>
                                        <button
                                            onClick={() => handleDecision(brand.id, 'rejected')}
                                            disabled={!reviewNotes.trim()}
                                            style={{ padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', fontWeight: 600, cursor: reviewNotes.trim() ? 'pointer' : 'not-allowed', fontSize: '0.9rem', opacity: reviewNotes.trim() ? 1 : 0.5 }}
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {queue.filter(b => b.status !== 'verified').length === 0 && (
                        <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
                            All verifications processed
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'verified' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                {['Brand', 'Industry', 'Opportunities', 'Total Spent', 'Verified', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.9rem 1rem', color: '#71717a', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...VERIFIED_BRANDS, ...queue.filter(b => b.status === 'verified').map(b => ({
                                id: b.id, name: b.legal_name, industry: b.country_code,
                                opportunities: 0, spent: '$0', verified_at: new Date().toISOString().split('T')[0]
                            }))].map(brand => (
                                <tr key={brand.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{brand.name}</td>
                                    <td style={{ padding: '0.9rem 1rem', color: '#a1a1aa' }}>{brand.industry}</td>
                                    <td style={{ padding: '0.9rem 1rem' }}>{brand.opportunities}</td>
                                    <td style={{ padding: '0.9rem 1rem', color: '#22c55e' }}>{brand.spent}</td>
                                    <td style={{ padding: '0.9rem 1rem', color: '#71717a', fontSize: '0.85rem' }}>{brand.verified_at}</td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <button style={{ padding: '0.3rem 0.75rem', background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)', borderRadius: '6px', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer' }}>
                                            Suspend
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
