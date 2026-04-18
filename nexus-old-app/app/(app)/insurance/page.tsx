'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, InsuranceDashboard, ProtectionPoolStats } from '@/lib/api';

const INSURANCE_TIERS: Record<string, { monthlyPremium: number; nonPaymentMax: number }> = {
    Basic:    { monthlyPremium: 0,     nonPaymentMax: 250000 },
    Standard: { monthlyPremium: 2500,  nonPaymentMax: 1000000 },
    Premium:  { monthlyPremium: 7500,  nonPaymentMax: 5000000 },
    Elite:    { monthlyPremium: 20000, nonPaymentMax: 25000000 },
};

function cents(n: number) { return '$' + (n / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }); }

function poolHealth(score: number) {
    if (score >= 90) return { status: 'excellent', color: '#10b981' };
    if (score >= 70) return { status: 'good', color: '#3b82f6' };
    if (score >= 50) return { status: 'fair', color: '#f59e0b' };
    return { status: 'poor', color: '#ef4444' };
}

function claimColor(status: string) {
    const m: Record<string, string> = { submitted: '#6b7280', under_review: '#f59e0b', approved: '#10b981', denied: '#ef4444', paid: '#8b5cf6' };
    return m[status] || '#6b7280';
}

type Tab = 'coverage' | 'claims' | 'pool';

export default function InsurancePage() {
    const [activeTab, setActiveTab] = useState<Tab>('coverage');
    const [data, setData] = useState<InsuranceDashboard | null>(null);
    const [poolData, setPoolData] = useState<ProtectionPoolStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [insRes, poolRes] = await Promise.all([
            api.insurance.getMyInsurance(),
            api.insurance.getProtectionPool(),
        ]);
        if (insRes.data) setData(insRes.data);
        else setError(insRes.error || 'Failed to load insurance');
        if (poolRes.data) setPoolData(poolRes.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#8e8e8e', padding: '20px' }}>Loading insurance...</div>;
    if (error || !data) return <div style={{ background: '#000', minHeight: '100vh', color: '#ef4444', padding: '20px' }}>{error}</div>;

    const policy = data.policy;
    const claims = data.claims;
    const pool = poolData;
    const health = pool ? poolHealth(pool.health_score) : { status: 'unknown', color: '#6b7280' };

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #262626', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.1))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Creator Protection</h1>
                        <p style={{ color: '#8e8e8e', fontSize: '14px' }}>Your safety net. Non-payment, income drops, legal defense.</p>
                    </div>
                    <div style={{ background: policy.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: policy.status === 'active' ? '#10b981' : '#ef4444', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                        {policy.status === 'active' ? 'Protected' : 'Inactive'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #262626' }}>
                {(['coverage', 'claims', 'pool'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '14px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent', color: activeTab === tab ? '#fff' : '#8e8e8e', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
                ))}
            </div>

            <div style={{ padding: '20px' }}>
                {activeTab === 'coverage' && (
                    <>
                        <div style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{policy.tier} Protection</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Up to {cents(policy.coverage.non_payment_max_cents)}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div><div style={{ fontSize: '11px', opacity: 0.7 }}>Policy ID</div><div style={{ fontSize: '13px' }}>#{policy.id}</div></div>
                                <div><div style={{ fontSize: '11px', opacity: 0.7 }}>Renews</div><div style={{ fontSize: '13px' }}>{new Date(policy.renewal_date).toLocaleDateString()}</div></div>
                            </div>
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Your Coverage</div>
                            {[
                                { label: 'Non-Payment Protection', value: cents(policy.coverage.non_payment_max_cents), desc: "Brand doesn't pay? We cover it." },
                                { label: 'Income Protection', value: cents(policy.coverage.income_protection_monthly_cents) + '/mo', desc: 'Sudden income drop? We help bridge the gap.' },
                                { label: 'Legal Defense', value: cents(policy.coverage.legal_defense_max_cents), desc: 'False claims or platform disputes? We fund your defense.' },
                                { label: 'Emergency Fund', value: cents(policy.coverage.emergency_fund_max_cents), desc: "Life happens. We're here to help." },
                            ].map((item, i) => (
                                <div key={i} style={{ borderTop: i > 0 ? '1px solid #262626' : undefined, paddingTop: i > 0 ? '12px' : undefined, marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>{item.label}</span><span style={{ fontWeight: 'bold' }}>{item.value}</span></div>
                                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Your Contributions</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Contributed</div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{cents(policy.contributions.total_contributed_cents)}</div></div>
                                <div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Last Contribution</div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{cents(policy.contributions.last_contribution_cents)}</div></div>
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#8e8e8e' }}>2% of each deal automatically goes to the protection pool</div>
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Upgrade Coverage</div>
                            {Object.entries(INSURANCE_TIERS).filter(([t]) => t !== policy.tier && t !== 'Basic').slice(0, 2).map(([tier, info]) => (
                                <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#262626', borderRadius: '8px', marginBottom: '8px' }}>
                                    <div><div style={{ fontWeight: 'bold' }}>{tier}</div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Up to {cents(info.nonPaymentMax)}</div></div>
                                    <button style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>{cents(info.monthlyPremium)}/mo</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'claims' && (
                    <>
                        <button style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ef4444, #f97316)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px', cursor: 'pointer' }}>File a Claim</button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{cents(policy.total_claims_paid_cents)}</div>
                                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Paid to You</div>
                            </div>
                            <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{policy.eligibility.claims_last_12m}/3</div>
                                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Claims This Year</div>
                            </div>
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Claims History</div>
                            {claims.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#8e8e8e' }}>No claims filed yet</div>
                            ) : claims.map(claim => (
                                <div key={claim.id} style={{ padding: '12px', background: '#262626', borderRadius: '8px', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{claim.type.replace(/_/g, ' ')}</div>
                                            <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{new Date(claim.submitted_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ background: `${claimColor(claim.status)}20`, color: claimColor(claim.status), padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize' }}>{claim.status}</div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '8px' }}>{claim.description}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span>Requested: {cents(claim.amount_cents)}</span>
                                        {claim.amount_approved_cents != null && <span style={{ color: '#10b981', fontWeight: 'bold' }}>Paid: {cents(claim.amount_approved_cents)}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'pool' && pool && (
                    <>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '8px' }}>Pool Health</div>
                            <div style={{ fontSize: '48px', fontWeight: 'bold', color: health.color, marginBottom: '8px' }}>{pool.health_score}%</div>
                            <div style={{ background: `${health.color}20`, color: health.color, padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', textTransform: 'capitalize' }}>{health.status}</div>
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Pool Stats</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Balance</div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{cents(pool.total_balance_cents)}</div></div>
                                <div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Runway</div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{pool.runway_months} months</div></div>
                                <div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Total Policies</div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{pool.total_policies.toLocaleString()}</div></div>
                                <div><div style={{ fontSize: '12px', color: '#8e8e8e' }}>Approval Rate</div><div style={{ fontSize: '20px', fontWeight: 'bold' }}>{pool.claim_approval_rate}%</div></div>
                            </div>
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Full Transparency</div>
                            <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>The protection pool is managed transparently. Anyone can verify.</div>
                            {pool.last_audit_at && <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Last audited: {new Date(pool.last_audit_at).toLocaleDateString()}</div>}
                        </div>
                        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>How It's Funded</div>
                            <div style={{ fontSize: '13px', color: '#8e8e8e', lineHeight: '1.6' }}>
                                <p style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>{pool.contribution_rate}% of every deal</strong> goes into the protection pool automatically.</p>
                                <p style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Creators vote on claims</strong> - the community decides who gets paid.</p>
                                <p><strong style={{ color: '#fff' }}>Full governance</strong> - everything is transparent and verifiable.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
