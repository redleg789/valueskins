'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, type MarketplaceOpportunity, type MarketplaceStats, type Application, type DealRoomSummary } from '@/lib/api';

type View = 'opportunities' | 'applications' | 'chats';

export default function BrandDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<MarketplaceStats | null>(null);
    const [opportunities, setOpportunities] = useState<MarketplaceOpportunity[]>([]);
    const [selectedOpp, setSelectedOpp] = useState<MarketplaceOpportunity | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [dealRooms, setDealRooms] = useState<DealRoomSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [appsLoading, setAppsLoading] = useState(false);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState<View>('opportunities');
    const [openingChat, setOpeningChat] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        const [statsResult, oppsResult] = await Promise.all([
            api.marketplace.getStats(),
            api.marketplace.getOpportunities(),
        ]);
        if (statsResult.data) setStats(statsResult.data);
        if (oppsResult.data) setOpportunities(oppsResult.data.opportunities || []);
        if (statsResult.error && oppsResult.error) setError(statsResult.error || 'Failed to load');
        setLoading(false);
    }, []);

    const loadRooms = useCallback(async () => {
        setRoomsLoading(true);
        const result = await api.dealRooms.listMyRooms();
        if (result.data) setDealRooms(result.data.deal_rooms || []);
        setRoomsLoading(false);
    }, []);

    useEffect(() => {
        loadDashboard();
        loadRooms();
    }, [loadDashboard, loadRooms]);

    const loadApplications = useCallback(async (opp: MarketplaceOpportunity) => {
        setSelectedOpp(opp);
        setView('applications');
        setAppsLoading(true);
        setApplications([]);
        const result = await api.brand.getOpportunityApplications(opp.id);
        if (result.data) setApplications(result.data.applications || []);
        setAppsLoading(false);
    }, []);

    // Brand opens a deal room with an applicant — this is the "accept + start chat" action
    const handleOpenChat = async (app: Application) => {
        if (!selectedOpp) return;
        setOpeningChat(app.persona_id);
        setActionError(null);

        // Check if a deal room already exists for this pair
        const existing = dealRooms.find(
            r => r.creator_persona_id === app.persona_id &&
                (r.opportunity_id === selectedOpp.id || r.opportunity_id === null)
        );

        if (existing) {
            router.push(`/deals/${existing.id}`);
            return;
        }

        // Open a new deal room
        const result = await api.dealRooms.openDealRoom({
            opportunity_id: selectedOpp.id,
            creator_persona_id: app.persona_id,
            intent: 'campaign',
            brief_title: selectedOpp.title,
            brief_description: selectedOpp.description,
            brief_deliverables: 'To be discussed in deal room',
            brief_campaign_type: selectedOpp.category,
            compensation_type: 'paid',
        });

        if (result.error) {
            setActionError(result.error);
            setOpeningChat(null);
            return;
        }

        if (result.data?.deal_room_id) {
            router.push(`/deals/${result.data.deal_room_id}`);
        }
        setOpeningChat(null);
    };

    if (loading) return (
        <div style={{ padding: '2rem', color: '#888', minHeight: '100vh', background: '#0a0a0f' }}>
            Loading dashboard...
        </div>
    );

    if (error) return (
        <div style={{ padding: '2rem', color: '#ef4444', minHeight: '100vh', background: '#0a0a0f' }}>
            {error}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f5f5f5' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Brand Dashboard</h1>
                    <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 2 }}>Manage opportunities and creator conversations</p>
                </div>
                <button
                    onClick={() => router.push('/brands/create-opportunity')}
                    style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                    + New Opportunity
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                        { label: 'Active', value: stats.active_opportunities },
                        { label: 'Completed', value: stats.completed_deals },
                        { label: 'Volume', value: `$${parseFloat(stats.total_volume || '0').toLocaleString()}` },
                        { label: 'Open Chats', value: dealRooms.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length },
                    ].map((s, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem 1.25rem', minWidth: 100 }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                            <div style={{ color: '#888', fontSize: '0.8rem', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 2rem' }}>
                {([
                    { id: 'opportunities', label: 'Opportunities', count: opportunities.length },
                    { id: 'chats', label: 'Active Chats', count: dealRooms.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length },
                ] as { id: View; label: string; count: number }[]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        style={{
                            padding: '0.875rem 1.25rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: view === tab.id ? '2px solid #f5f5f5' : '2px solid transparent',
                            color: view === tab.id ? '#f5f5f5' : '#666',
                            fontWeight: view === tab.id ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        {tab.label}
                        <span style={{ background: view === tab.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
                {view === 'applications' && selectedOpp && (
                    <button
                        onClick={() => setView('opportunities')}
                        style={{ padding: '0.875rem 1.25rem', background: 'none', border: 'none', borderBottom: '2px solid #f5f5f5', color: '#f5f5f5', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        ← {selectedOpp.title} — Applications ({applications.length})
                    </button>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem 2rem', maxWidth: 900 }}>

                {actionError && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                        {actionError}
                        <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                    </div>
                )}

                {/* Opportunities view */}
                {view === 'opportunities' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {opportunities.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                No opportunities yet. Create your first one to start receiving applications.
                            </div>
                        ) : (
                            opportunities.map(opp => (
                                <div key={opp.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{opp.title}</div>
                                        <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                                            <span>{opp.application_count} applicant{opp.application_count !== 1 ? 's' : ''}</span>
                                            <span>{opp.reward_amount} {opp.reward_currency}</span>
                                            <span style={{ color: opp.status === 'open' ? '#4ade80' : '#888' }}>{opp.status}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => loadApplications(opp)}
                                        style={{ padding: '0.5rem 1rem', background: opp.application_count > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: opp.application_count > 0 ? '#f5f5f5' : '#666', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {opp.application_count > 0 ? `View ${opp.application_count} Application${opp.application_count !== 1 ? 's' : ''}` : 'No Applications'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Applications view */}
                {view === 'applications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {appsLoading ? (
                            <div style={{ color: '#888', padding: '2rem', textAlign: 'center' }}>Loading applications...</div>
                        ) : applications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                No applications yet for this opportunity.
                            </div>
                        ) : (
                            applications.map(app => {
                                const existingRoom = dealRooms.find(r => r.creator_persona_id === app.persona_id);
                                return (
                                    <div key={app.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                                    {(app.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>@{app.username || `creator_${app.persona_id}`}</div>
                                                    <div style={{ color: '#888', fontSize: '0.75rem' }}>Applied {new Date(app.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: app.status === 'applied' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)', color: app.status === 'applied' ? '#3b82f6' : '#22c55e' }}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            {app.pitch && (
                                                <p style={{ color: '#aaa', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                                                    {app.pitch}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleOpenChat(app)}
                                            disabled={openingChat === app.persona_id}
                                            style={{
                                                padding: '0.625rem 1.25rem',
                                                background: existingRoom ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                color: '#f5f5f5',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: openingChat === app.persona_id ? 'not-allowed' : 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {openingChat === app.persona_id
                                                ? 'Opening...'
                                                : existingRoom
                                                    ? 'Continue Chat'
                                                    : 'Open Chat'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Active chats view */}
                {view === 'chats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {roomsLoading ? (
                            <div style={{ color: '#888', padding: '2rem', textAlign: 'center' }}>Loading chats...</div>
                        ) : dealRooms.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                No active chats yet. Open a chat from an application to start negotiating.
                            </div>
                        ) : (
                            dealRooms.map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => router.push(`/deals/${room.id}`)}
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                            {room.opportunity_title || `Deal Room #${room.id}`}
                                        </div>
                                        <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                                            <span>with @{room.creator_name}</span>
                                            <span style={{ color: room.status === 'completed' ? '#888' : '#4ade80' }}>{room.status}</span>
                                        </div>
                                        {room.last_message && (
                                            <div style={{ color: '#666', fontSize: '0.8rem', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                                                {room.last_message}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {(room.unread_count ?? 0) > 0 && (
                                            <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                                {room.unread_count}
                                            </span>
                                        )}
                                        <span style={{ color: '#666', fontSize: '0.8rem' }}>→</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
