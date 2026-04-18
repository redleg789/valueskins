'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, BrandDashboardData, BrandCampaignEntry, DiscoverableCreator } from '@/lib/api';

function cents(n: number) { return '$' + (n / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
    open: { label: 'Active', color: '#10b981', bg: '#10b98120' },
    filled: { label: 'Filled', color: '#3b82f6', bg: '#3b82f620' },
    completed: { label: 'Completed', color: '#8b5cf6', bg: '#8b5cf620' },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#ef444420' },
    disputed: { label: 'Disputed', color: '#f59e0b', bg: '#f59e0b20' },
};

type Tab = 'overview' | 'campaigns' | 'discover' | 'history';

export default function BrandDashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [data, setData] = useState<BrandDashboardData | null>(null);
    const [creators, setCreators] = useState<DiscoverableCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await api.brand.getDashboard();
        if (res.data) setData(res.data);
        else setError(res.error || 'Failed to load brand dashboard');
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const fetchCreators = useCallback(async () => {
        const res = await api.brand.discoverCreators();
        if (res.data) setCreators(res.data.creators);
    }, []);

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#8e8e8e', padding: '20px' }}>Loading brand dashboard...</div>;
    if (error || !data) return <div style={{ background: '#000', minHeight: '100vh', color: '#ef4444', padding: '20px' }}>{error}</div>;

    const { brand, metrics, campaigns, history } = data;

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            {/* Brand Header */}
            <div style={{
                padding: '16px', borderBottom: '1px solid #262626',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), transparent)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 10,
                        background: 'linear-gradient(135deg, #8b5cf6, #8b5cf6cc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, color: '#fff', fontWeight: 700,
                    }}>
                        {(brand.display_name || brand.username).charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{brand.display_name || brand.username}</div>
                        <div style={{ fontSize: 12, color: '#8e8e8e' }}>Brand Account</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    <MetricCard label="Total Spent" value={cents(metrics.total_spent_cents)} color="#8b5cf6" />
                    <MetricCard label="Campaigns" value={String(metrics.active_campaigns + metrics.completed_campaigns)} color="#0095f6" />
                    <MetricCard label="Pending" value={String(metrics.pending_applications)} color="#f59e0b" />
                    <MetricCard label="Creators" value={String(metrics.creators_worked_with)} color="#10b981" />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #262626' }}>
                {(['overview', 'campaigns', 'discover', 'history'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => {
                        setActiveTab(tab);
                        if (tab === 'discover' && creators.length === 0) fetchCreators();
                    }} style={{
                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
                        fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                        color: activeTab === tab ? '#fff' : '#8e8e8e', cursor: 'pointer', textTransform: 'capitalize',
                    }}>{tab}</button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '16px' }}>
                {activeTab === 'overview' && <OverviewTab metrics={metrics} campaigns={campaigns} />}
                {activeTab === 'campaigns' && <CampaignsTab campaigns={campaigns} />}
                {activeTab === 'discover' && <DiscoverTab creators={creators} />}
                {activeTab === 'history' && <HistoryTab history={history} />}
            </div>
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ padding: '10px 8px', background: '#1c1c1e', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 9, color: '#8e8e8e', marginTop: 2 }}>{label}</div>
        </div>
    );
}

function OverviewTab({ metrics, campaigns }: { metrics: BrandDashboardData['metrics']; campaigns: BrandCampaignEntry[] }) {
    const activeCampaigns = campaigns.filter(c => c.status === 'open');
    return (
        <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button style={{
                    flex: 1, padding: '14px', background: '#8b5cf6', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>+ New Campaign</button>
                <button style={{
                    flex: 1, padding: '14px', background: '#1c1c1e', color: '#fff',
                    border: '1px solid #262626', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Find Creators</button>
            </div>

            {metrics.pending_applications > 0 && (
                <div style={{
                    padding: '14px', background: '#f59e0b15', borderRadius: 12, marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: '#f59e0b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700,
                    }}>{metrics.pending_applications}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Pending Applications</div>
                        <div style={{ fontSize: 12, color: '#8e8e8e' }}>Creators waiting for your review</div>
                    </div>
                    <button style={{
                        padding: '8px 16px', background: '#f59e0b', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Review</button>
                </div>
            )}

            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Campaign Status</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <StatusCard label="Active" value={metrics.active_campaigns} color="#10b981" />
                    <StatusCard label="Draft" value={metrics.draft_campaigns} color="#737373" />
                    <StatusCard label="Completed" value={metrics.completed_campaigns} color="#8b5cf6" />
                </div>
            </div>

            {activeCampaigns.length > 0 && (
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Active Campaigns</div>
                    {activeCampaigns.slice(0, 3).map(c => (
                        <CampaignCard key={c.id} campaign={c} />
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ flex: 1, padding: '14px', background: `${color}15`, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#8e8e8e', marginTop: 2 }}>{label}</div>
        </div>
    );
}

function CampaignsTab({ campaigns }: { campaigns: BrandCampaignEntry[] }) {
    return (
        <div>
            <button style={{
                width: '100%', padding: '14px', background: '#8b5cf6', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16,
            }}>+ Create New Campaign</button>

            {campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No campaigns yet</div>
                    <div style={{ fontSize: 14, color: '#8e8e8e' }}>Create your first campaign to start finding creators.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>
            )}
        </div>
    );
}

function CampaignCard({ campaign }: { campaign: BrandCampaignEntry }) {
    const status = STATUS_INFO[campaign.status] || STATUS_INFO.open;
    return (
        <div style={{ background: '#1c1c1e', borderRadius: 12, border: '1px solid #262626', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{campaign.title}</div>
                    <div style={{ fontSize: 12, color: '#8e8e8e', marginTop: 2 }}>{campaign.category}</div>
                </div>
                <div style={{
                    padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: status.bg, color: status.color,
                }}>{status.label}</div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, padding: '10px', background: '#262626', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{cents(campaign.reward_amount_cents)}</div>
                    <div style={{ fontSize: 10, color: '#8e8e8e' }}>Budget</div>
                </div>
                <div style={{
                    flex: 1, padding: '10px', borderRadius: 8, textAlign: 'center',
                    background: campaign.pending_applications > 0 ? '#f59e0b15' : '#262626',
                }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: campaign.pending_applications > 0 ? '#f59e0b' : '#fff' }}>
                        {campaign.pending_applications}
                    </div>
                    <div style={{ fontSize: 10, color: '#8e8e8e' }}>Pending</div>
                </div>
            </div>

            <button style={{
                width: '100%', padding: '10px', background: 'transparent', color: '#8b5cf6',
                border: '1px solid #8b5cf6', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>View Details</button>
        </div>
    );
}

function DiscoverTab({ creators }: { creators: DiscoverableCreator[] }) {
    if (creators.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Discover Creators</div>
                <div style={{ fontSize: 14, color: '#8e8e8e' }}>Loading creator profiles...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {creators.map(creator => (
                    <div key={creator.id} style={{
                        background: '#1c1c1e', borderRadius: 12, border: '1px solid #262626', padding: 14,
                    }}>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf688, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                    {(creator.display_name || creator.username).charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>{creator.display_name || creator.username}</div>
                                <div style={{ fontSize: 12, color: '#8e8e8e' }}>@{creator.username}</div>
                            </div>
                            {creator.rank > 0 && (
                                <div style={{
                                    padding: '4px 10px', background: 'rgba(139,92,246,0.2)',
                                    color: '#8b5cf6', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                }}>#{creator.rank}</div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            {creator.reputation_score != null && (
                                <div style={{ flex: 1, padding: '8px', background: '#262626', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{creator.reputation_score.toFixed(1)}</div>
                                    <div style={{ fontSize: 9, color: '#8e8e8e' }}>Reputation</div>
                                </div>
                            )}
                            {creator.total_deals != null && (
                                <div style={{ flex: 1, padding: '8px', background: '#262626', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{creator.total_deals}</div>
                                    <div style={{ fontSize: 9, color: '#8e8e8e' }}>Deals</div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{
                                flex: 1, padding: '10px', background: 'transparent', color: '#fff',
                                border: '1px solid #262626', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}>View Profile</button>
                            <button style={{
                                flex: 1, padding: '10px', background: '#8b5cf6', color: '#fff',
                                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}>Invite</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HistoryTab({ history }: { history: BrandDashboardData['history'] }) {
    if (history.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No completed deals yet</div>
                <div style={{ fontSize: 14, color: '#8e8e8e' }}>Your completed campaign history will appear here.</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Completed Deals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(deal => (
                    <div key={deal.id} style={{
                        padding: '14px', background: '#1c1c1e', borderRadius: 10, border: '1px solid #262626',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{deal.title}</div>
                            <div style={{ fontSize: 12, color: '#8e8e8e' }}>
                                {cents(deal.total_amount_cents)} total • {new Date(deal.completed_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{
                            padding: '6px 12px', background: '#10b98120', color: '#10b981',
                            borderRadius: 8, fontSize: 13, fontWeight: 700,
                        }}>
                            {cents(deal.creator_payout_cents)}
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                width: '100%', padding: '12px', background: 'transparent', color: '#8b5cf6',
                border: '1px solid #8b5cf6', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 16,
            }}>Export Full Report</button>
        </div>
    );
}
