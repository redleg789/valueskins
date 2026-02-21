'use client';

import { useState } from 'react';

type ProcessorStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

interface PayoutRecord {
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

const MOCK_PAYOUTS: PayoutRecord[] = [
    {
        id: 1, idempotency_key: 'deal_42_stage_1',
        creator_user_id: 101, creator_name: 'Alex Rivera', brand_name: 'Nike',
        deal_id: 42, gross_amount_cents: 500000, platform_fee_cents: 25000, net_amount_cents: 475000,
        currency: 'USD', processor: 'stripe', processor_txn_id: 'txn_3NdXP2LkdIwHu7ix1M6NSMF2',
        processor_status: 'succeeded', failure_reason: null,
        initiated_at: '2026-02-18T10:00:00Z', completed_at: '2026-02-18T10:02:11Z',
    },
    {
        id: 2, idempotency_key: 'deal_43_stage_1',
        creator_user_id: 102, creator_name: 'Priya Singh', brand_name: 'Stripe',
        deal_id: 43, gross_amount_cents: 250000, platform_fee_cents: 12500, net_amount_cents: 237500,
        currency: 'USD', processor: 'razorpay', processor_txn_id: null,
        processor_status: 'pending', failure_reason: null,
        initiated_at: '2026-02-19T09:00:00Z', completed_at: null,
    },
    {
        id: 3, idempotency_key: 'deal_44_stage_1',
        creator_user_id: 103, creator_name: 'Marcus Tran', brand_name: 'Coinbase',
        deal_id: 44, gross_amount_cents: 100000, platform_fee_cents: 5000, net_amount_cents: 95000,
        currency: 'USD', processor: 'stripe', processor_txn_id: null,
        processor_status: 'failed', failure_reason: 'insufficient_funds',
        initiated_at: '2026-02-17T14:00:00Z', completed_at: null,
    },
];

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
    const [payouts] = useState<PayoutRecord[]>(MOCK_PAYOUTS);
    const [processorEnabled, setProcessorEnabled] = useState({ stripe: false, razorpay: false });
    const [toast, setToast] = useState('');
    const [activeTab, setActiveTab] = useState<'ledger' | 'processors' | 'reconciliation'>('ledger');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const totalGross = payouts.filter(p => p.processor_status === 'succeeded').reduce((s, p) => s + p.gross_amount_cents, 0);
    const totalFees  = payouts.filter(p => p.processor_status === 'succeeded').reduce((s, p) => s + p.platform_fee_cents, 0);
    const totalNet   = payouts.filter(p => p.processor_status === 'succeeded').reduce((s, p) => s + p.net_amount_cents, 0);
    const pending    = payouts.filter(p => p.processor_status === 'pending').length;
    const failed     = payouts.filter(p => p.processor_status === 'failed').length;

    const tabStyle = (t: string): React.CSSProperties => ({
        padding: '0.75rem 1.25rem', background: 'none', border: 'none',
        borderBottom: activeTab === t ? '2px solid #EF4444' : '2px solid transparent',
        color: activeTab === t ? '#EF4444' : '#71717a',
        fontWeight: activeTab === t ? 600 : 400, cursor: 'pointer', fontSize: '0.9rem',
    });

    return (
        <div style={{ maxWidth: '1100px' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Payout Ledger</h1>
            <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Immutable append-only accounting for all creator payouts</p>

            {/* Summary cards */}
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

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
                <button style={tabStyle('ledger')} onClick={() => setActiveTab('ledger')}>Transaction Ledger</button>
                <button style={tabStyle('processors')} onClick={() => setActiveTab('processors')}>Payment Processors</button>
                <button style={tabStyle('reconciliation')} onClick={() => setActiveTab('reconciliation')}>Reconciliation</button>
            </div>

            {activeTab === 'ledger' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                {['ID', 'Creator', 'Brand', 'Gross', 'Fee', 'Net', 'Processor', 'Status', 'Initiated'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 0.9rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(p => {
                                const s = STATUS_STYLE[p.processor_status];
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontFamily: 'monospace' }}>#{p.id}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', fontWeight: 600 }}>{p.creator_name}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#a1a1aa' }}>{p.brand_name}</td>
                                        <td style={{ padding: '0.75rem 0.9rem' }}>{cents(p.gross_amount_cents)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#8b5cf6' }}>{cents(p.platform_fee_cents)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#22c55e', fontWeight: 600 }}>{cents(p.net_amount_cents)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#71717a', textTransform: 'capitalize' }}>{p.processor}</td>
                                        <td style={{ padding: '0.75rem 0.9rem' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '100px', background: s.bg, color: s.color, fontWeight: 600, fontSize: '0.75rem' }}>
                                                {p.processor_status}
                                                {p.failure_reason && ` — ${p.failure_reason}`}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280' }}>{new Date(p.initiated_at).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'processors' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {(['stripe', 'razorpay'] as const).map(proc => (
                        <div key={proc} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>{proc}</div>
                                    <div style={{ color: '#71717a', fontSize: '0.8rem' }}>{proc === 'stripe' ? 'Global card processing + ACH' : 'India + Southeast Asia specialist'}</div>
                                </div>
                                <div
                                    onClick={() => {
                                        setProcessorEnabled(prev => ({ ...prev, [proc]: !prev[proc] }));
                                        showToast(`${proc} ${!processorEnabled[proc] ? 'enabled' : 'disabled'} — effective immediately`);
                                    }}
                                    style={{
                                        width: '48px', height: '26px', borderRadius: '100px',
                                        background: processorEnabled[proc] ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                        cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: '3px',
                                        left: processorEnabled[proc] ? '25px' : '3px',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        background: 'white', transition: 'left 0.2s'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                    <span style={{ color: '#71717a' }}>Status</span>
                                    <span style={{ color: processorEnabled[proc] ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                        {processorEnabled[proc] ? 'Live' : 'Disabled'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                    <span style={{ color: '#71717a' }}>Mode</span>
                                    <span style={{ color: '#f59e0b' }}>Sandbox</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                    <span style={{ color: '#71717a' }}>Platform fee</span>
                                    <span>5.00%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                    <span style={{ color: '#71717a' }}>Currencies</span>
                                    <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>{proc === 'stripe' ? 'USD, EUR, GBP, INR' : 'INR, USD, MYR, SGD'}</span>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b' }}>
                                Configure API keys in environment variables: {proc.toUpperCase()}_SECRET_KEY
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'reconciliation' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>February 2026 Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[
                                { label: 'Transactions', value: payouts.filter(p => p.processor_status === 'succeeded').length.toString(), sub: 'succeeded' },
                                { label: 'Gross Volume', value: cents(totalGross), sub: 'before platform fee' },
                                { label: 'Platform Revenue', value: cents(totalFees), sub: '5% take rate' },
                                { label: 'Creator Payouts', value: cents(totalNet), sub: 'net after fee' },
                                { label: 'Pending', value: cents(payouts.filter(p => p.processor_status === 'pending').reduce((s, p) => s + p.net_amount_cents, 0)), sub: 'in-flight' },
                                { label: 'Failed (retry)', value: cents(payouts.filter(p => p.processor_status === 'failed').reduce((s, p) => s + p.net_amount_cents, 0)), sub: 'needs attention' },
                            ].map(({ label, value, sub }) => (
                                <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ color: '#71717a', fontSize: '0.75rem', marginBottom: '0.35rem' }}>{label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{value}</div>
                                    <div style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.2rem' }}>{sub}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#22c55e' }}>
                            All records are immutable. Refunds create a new ledger entry, not an update.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
