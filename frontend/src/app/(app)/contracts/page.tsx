'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ContractEntry } from '@/lib/api';

function cents(n: number) { return '$' + (n / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }); }

type Tab = 'active' | 'completed' | 'all';

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    accepted: { label: 'Accepted', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    completed: { label: 'Completed', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    expired: { label: 'Expired', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
    cancelled: { label: 'Cancelled', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
};

export default function ContractsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('active');
    const [contracts, setContracts] = useState<ContractEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await api.admin.listContracts();
        if (res.data) setContracts(res.data.contracts);
        else setError(res.error || 'Failed to load contracts');
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#8e8e8e', padding: '20px' }}>Loading contracts...</div>;
    if (error) return <div style={{ background: '#000', minHeight: '100vh', color: '#ef4444', padding: '20px' }}>{error}</div>;

    const activeContracts = contracts.filter(c => ['active', 'accepted'].includes(c.status));
    const completedContracts = contracts.filter(c => ['completed', 'expired', 'cancelled', 'rejected'].includes(c.status));

    const getTabContracts = () => {
        switch (activeTab) {
            case 'active': return activeContracts;
            case 'completed': return completedContracts;
            case 'all': return contracts;
        }
    };

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{
                padding: '16px', borderBottom: '1px solid #262626',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), transparent)',
            }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Contracts</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    <StatCard label="Active" value={String(activeContracts.length)} color="#10b981" />
                    <StatCard label="Completed" value={String(completedContracts.length)} color="#8b5cf6" />
                    <StatCard label="Total" value={String(contracts.length)} color="#3b82f6" />
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #262626' }}>
                {(['active', 'completed', 'all'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
                        fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                        color: activeTab === tab ? '#fff' : '#8e8e8e', cursor: 'pointer', textTransform: 'capitalize',
                    }}>{tab}</button>
                ))}
            </div>

            <div style={{ padding: '16px' }}>
                {getTabContracts().length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No contracts</div>
                        <div style={{ fontSize: 14, color: '#8e8e8e' }}>Contracts will appear here when you start deal negotiations.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {getTabContracts().map(contract => (
                            <ContractCard key={contract.id} contract={contract} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ flex: 1, background: '#1c1c1e', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#8e8e8e', marginTop: 2 }}>{label}</div>
        </div>
    );
}

function ContractCard({ contract }: { contract: ContractEntry }) {
    const status = STATUS_INFO[contract.status] || STATUS_INFO.active;

    return (
        <div style={{
            background: '#1c1c1e', borderRadius: 12, border: '1px solid #262626', padding: 14,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{contract.brand_name}</div>
                    <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 2 }}>
                        {contract.title || contract.campaign_type || 'Deal Room'}
                    </div>
                </div>
                <div style={{
                    padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: status.bg, color: status.color,
                }}>{status.label}</div>
            </div>

            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: '#262626', borderRadius: 8, marginBottom: 12,
            }}>
                <div>
                    <div style={{ fontSize: 11, color: '#8e8e8e' }}>Contract Value</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{cents(contract.amount_cents)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#8e8e8e' }}>Created</div>
                    <div style={{ fontSize: 13 }}>{new Date(contract.created_at).toLocaleDateString()}</div>
                </div>
            </div>

            <div style={{ fontSize: 12, color: '#8e8e8e' }}>
                Creator: {contract.creator_name}
            </div>
        </div>
    );
}
