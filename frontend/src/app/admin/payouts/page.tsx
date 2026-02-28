'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

type ProcessorStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

interface PayoutEntry {
    id: number;
    idempotency_key: string;
    creator_user_id: number;
    creator_name: string;
    brand_name: string;
    deal_id: number | null;
    gross_amount_cents: number;
    platform_fee_cents: number;
    net_amount_cents: number;
    currency: string;
    processor: string;
    processor_txn_id: string | null;
    processor_status: ProcessorStatus;
    failure_reason: string | null;
    initiated_at: string;
    completed_at: string | null;
}

const STATUS_STYLE: Record<ProcessorStatus, { bg: string; color: string }> = {
    pending:    { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    processing: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    succeeded:  { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    failed:     { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
    refunded:   { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af' },
};

function cents(n: number) {
    return '$' + (n / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<PayoutEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        const result = await api.admin.getPayoutReconciliation();
        if (result.data) {
            setPayouts((result.data.payouts || []) as unknown as PayoutEntry[]);
        } else {
            setError(result.error || 'Failed to load payouts');
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

    const totalGross = payouts.filter(p => p.processor_status === 'succeeded').reduce((s, p) => s + (p.gross_amount_cents || 0), 0);
    const totalFees  = payouts.filter(p => p.processor_status === 'succeeded').reduce((s, p) => s + (p.platform_fee_cents || 0), 0);
    const totalNet   = payouts.filter(p => p.processor_status === 'succeeded').reduce((s, p) => s + (p.net_amount_cents || 0), 0);
    const pending    = payouts.filter(p => p.processor_status === 'pending').length;
    const failed     = payouts.filter(p => p.processor_status === 'failed').length;

    if (loading) return <div style={{ padding: '2rem', color: '#71717a' }}>Loading payouts...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '1100px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Payout Ledger</h1>
            <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Immutable append-only accounting for all creator payouts</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Gross', value: cents(totalGross), color: '#fff' },
                    { label: 'Platform Fees (5%)', value: cents(totalFees), color: '#8b5cf6' },
                    { label: 'Net to Creators', value: cents(totalNet), color: '#22c55e' },
                    { label: 'Pending', value: pending.toString(), color: '#f59e0b' },
                    { label: 'Failed', value: failed.toString(), color: '#ef4444' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ color: '#71717a', fontSize: '0.75rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            {['ID', 'Creator', 'Gross', 'Fee', 'Net', 'Processor', 'Status', 'Date'].map(h => (
                                <th key={h} style={{ padding: '0.75rem 0.9rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map(p => {
                            const s = STATUS_STYLE[p.processor_status] || STATUS_STYLE.pending;
                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontFamily: 'monospace' }}>#{p.id}</td>
                                    <td style={{ padding: '0.75rem 0.9rem', fontWeight: 600 }}>{p.creator_name || `User #${p.creator_user_id}`}</td>
                                    <td style={{ padding: '0.75rem 0.9rem' }}>{cents(p.gross_amount_cents || 0)}</td>
                                    <td style={{ padding: '0.75rem 0.9rem', color: '#8b5cf6' }}>{cents(p.platform_fee_cents || 0)}</td>
                                    <td style={{ padding: '0.75rem 0.9rem', color: '#22c55e', fontWeight: 600 }}>{cents(p.net_amount_cents || 0)}</td>
                                    <td style={{ padding: '0.75rem 0.9rem', color: '#71717a', textTransform: 'capitalize' }}>{p.processor || '-'}</td>
                                    <td style={{ padding: '0.75rem 0.9rem' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '100px', background: s.bg, color: s.color, fontWeight: 600, fontSize: '0.75rem' }}>
                                            {p.processor_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280' }}>{p.initiated_at ? new Date(p.initiated_at).toLocaleDateString() : '-'}</td>
                                </tr>
                            );
                        })}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>No payout records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#22c55e' }}>
                All records are immutable. Refunds create a new ledger entry, not an update.
            </div>
        </div>
    );
}
