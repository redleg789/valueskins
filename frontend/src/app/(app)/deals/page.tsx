'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS } from '@/lib/professions';
import {
  getDealStatusInfo,
  getOpportunityStatusInfo,
  formatCurrency,
  calculateDealPricing,
} from '@/lib/deals';
import { api, type CreatorDeal, type MarketplaceOpportunity, type DealRoomSummary } from '@/lib/api';

type Tab = 'opportunities' | 'active' | 'completed' | 'chats';

function DealSkeletonCard() {
  return (
    <div style={{ background: 'var(--ig-card)', borderRadius: 12, border: '1px solid var(--ig-separator)', padding: 14, animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: '20px', background: 'var(--ig-separator)', borderRadius: 4, marginBottom: 8, width: '70%' }} />
      <div style={{ height: '14px', background: 'var(--ig-separator)', borderRadius: 4, marginBottom: 12, width: '40%' }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ height: '22px', width: '60px', background: 'var(--ig-separator)', borderRadius: 6 }} />)}
      </div>
      <div style={{ height: '40px', background: 'var(--ig-separator)', borderRadius: 4 }} />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Failed to load deals</div>
      <div style={{ fontSize: 13, color: 'var(--ig-text-tertiary)', marginBottom: 16 }}>{message}</div>
      <button
        onClick={onRetry}
        style={{ padding: '10px 20px', background: 'var(--ig-blue)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        Try Again
      </button>
    </div>
  );
}

export default function DealsPage() {
  const router = useRouter();
  const { activePlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState<Tab>('opportunities');
  const [selectedDeal, setSelectedDeal] = useState<MarketplaceOpportunity | null>(null);

  const [opportunities, setOpportunities] = useState<MarketplaceOpportunity[]>([]);
  const [myDeals, setMyDeals] = useState<CreatorDeal[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [oppsError, setOppsError] = useState<string | null>(null);
  const [dealsError, setDealsError] = useState<string | null>(null);

  // Summary stats derived from real data
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [myRooms, setMyRooms] = useState<DealRoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const platformConfig = PLATFORM_CONFIGS[activePlatform];
  const accentColor = platformConfig.primaryColor;

  const loadOpportunities = useCallback(async () => {
    setLoadingOpps(true);
    setOppsError(null);
    const result = await api.marketplace.getOpportunities({ status: 'open' });
    if (result.error) {
      setOppsError(result.error);
    } else {
      setOpportunities(result.data?.opportunities ?? []);
    }
    setLoadingOpps(false);
  }, []);

  const loadMyDeals = useCallback(async () => {
    setLoadingDeals(true);
    setDealsError(null);
    const result = await api.marketplace.getMyDeals();
    if (result.error) {
      setDealsError(result.error);
    } else {
      const deals = result.data?.deals ?? [];
      setMyDeals(deals);
      const completed = deals.filter(d => ['approved', 'completed'].includes(d.status));
      const active = deals.filter(d => ['funded', 'in_progress', 'submitted', 'revision'].includes(d.status));
      setTotalEarnings(completed.reduce((sum, d) => sum + d.total_amount, 0));
      setPendingAmount(active.reduce((sum, d) => sum + d.total_amount, 0));
    }
    setLoadingDeals(false);
  }, []);

  const loadMyRooms = useCallback(async () => {
    setRoomsLoading(true);
    const result = await api.dealRooms.listMyRooms();
    if (result.data) setMyRooms(result.data.deal_rooms || []);
    setRoomsLoading(false);
  }, []);

  useEffect(() => {
    loadOpportunities();
    loadMyDeals();
    loadMyRooms();
  }, [loadOpportunities, loadMyDeals, loadMyRooms]);

  const activeDeals = myDeals.filter(d => ['funded', 'in_progress', 'submitted', 'revision'].includes(d.status));
  const completedDeals = myDeals.filter(d => ['approved', 'completed'].includes(d.status));
  const activeRooms = myRooms.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

  const getTabCount = (tab: Tab): number | string => {
    if (tab === 'opportunities') return loadingOpps ? '...' : opportunities.length;
    if (tab === 'active') return loadingDeals ? '...' : activeDeals.length;
    if (tab === 'chats') return roomsLoading ? '...' : activeRooms.length;
    return loadingDeals ? '...' : completedDeals.length;
  };

  return (
    <PlatformLayout title="Deals">
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{ padding: '0' }}>
        {/* Earnings Summary */}
        <div style={{ padding: '16px', background: `linear-gradient(135deg, ${accentColor}20, transparent)`, borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Earnings</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {loadingDeals ? '—' : formatCurrency(totalEarnings)}
              </div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--ig-card)', borderRadius: 8, textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Pending</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: accentColor }}>
                {loadingDeals ? '—' : formatCurrency(pendingAmount)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <StatCard label="Completed Deals" value={loadingDeals ? '—' : String(completedDeals.length)} color="#10b981" />
            <StatCard label="Active Deals" value={loadingDeals ? '—' : String(activeDeals.length)} color={accentColor} />
            <StatCard
              label="Win Rate"
              value={loadingDeals ? '—' : myDeals.length > 0 ? `${Math.round((completedDeals.length / myDeals.length) * 100)}%` : '0%'}
              color="#f59e0b"
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--ig-separator)', padding: '0 16px' }}>
          {(['opportunities', 'chats', 'active', 'completed'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px 0', background: 'transparent', border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--ig-text-primary)' : 'var(--ig-text-tertiary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {tab === 'chats' ? 'Chats' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{ background: activeTab === tab ? accentColor : 'var(--ig-separator)', color: activeTab === tab ? '#fff' : 'var(--ig-text-tertiary)', padding: '2px 6px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {activeTab === 'opportunities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingOpps
                ? Array.from({ length: 3 }).map((_, i) => <DealSkeletonCard key={i} />)
                : oppsError
                  ? <ErrorState message={oppsError} onRetry={loadOpportunities} />
                  : opportunities.length === 0
                    ? <EmptyState title="No opportunities available" description="Check back later for new campaigns" />
                    : opportunities.map((opp, i) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        accentColor={accentColor}
                        index={i}
                        onClick={() => setSelectedDeal(opp)}
                      />
                    ))
              }
            </div>
          )}

          {activeTab === 'active' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingDeals
                ? Array.from({ length: 2 }).map((_, i) => <DealSkeletonCard key={i} />)
                : dealsError
                  ? <ErrorState message={dealsError} onRetry={loadMyDeals} />
                  : activeDeals.length === 0
                    ? <EmptyState title="No active deals" description="Apply to opportunities to get started" action="Browse Opportunities" onAction={() => setActiveTab('opportunities')} />
                    : activeDeals.map((deal, i) => (
                      <CreatorDealCard key={deal.id} deal={deal} type="active" accentColor={accentColor} index={i} onClick={() => router.push(`/deals/${deal.id}`)} />
                    ))
              }
            </div>
          )}

          {activeTab === 'completed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingDeals
                ? Array.from({ length: 2 }).map((_, i) => <DealSkeletonCard key={i} />)
                : dealsError
                  ? <ErrorState message={dealsError} onRetry={loadMyDeals} />
                  : completedDeals.length === 0
                    ? <EmptyState title="No completed deals yet" description="Your completed deals will appear here" />
                    : completedDeals.map((deal, i) => (
                      <CreatorDealCard key={deal.id} deal={deal} type="completed" accentColor={accentColor} index={i} onClick={() => router.push(`/deals/${deal.id}`)} />
                    ))
              }
            </div>
          )}

          {activeTab === 'chats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {roomsLoading
                ? Array.from({ length: 2 }).map((_, i) => <DealSkeletonCard key={i} />)
                : activeRooms.length === 0
                  ? <EmptyState title="No active chats" description="Once a brand opens a deal room with you, it will appear here" />
                  : activeRooms.map(room => (
                    <div
                      key={room.id}
                      onClick={() => router.push(`/deals/${room.id}`)}
                      style={{ background: 'var(--ig-card)', borderRadius: 12, border: '1px solid var(--ig-separator)', padding: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                          {room.opportunity_title || `Deal Room #${room.id}`}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>with {room.brand_name}</span>
                          <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: room.status === 'negotiation' ? `${accentColor}20` : 'rgba(34,197,94,0.15)', color: room.status === 'negotiation' ? accentColor : '#22c55e' }}>
                            {room.status}
                          </span>
                        </div>
                        {room.last_message && (
                          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                            {room.last_message}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {(room.unread_count ?? 0) > 0 && (
                          <span style={{ background: accentColor, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                            {room.unread_count}
                          </span>
                        )}
                        <span style={{ fontSize: 18, color: 'var(--ig-text-tertiary)' }}>→</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* Opportunity Detail Modal */}
        {selectedDeal && (
          <OpportunityDetailModal
            opportunity={selectedDeal}
            accentColor={accentColor}
            onClose={() => setSelectedDeal(null)}
            onApply={async () => {
              const user = api.auth.getUser();
              if (!user?.persona_id) return;
              await api.marketplace.applyToOpportunity(selectedDeal.id, user.persona_id, '');
              setSelectedDeal(null);
              loadOpportunities();
            }}
          />
        )}
      </div>
    </PlatformLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, background: 'var(--ig-card)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: color ? `${color}15` : 'var(--ig-separator)', color: color || 'var(--ig-text-secondary)' }}>
      {label}
    </span>
  );
}

function OpportunityCard({ opportunity, accentColor, index, onClick }: { opportunity: MarketplaceOpportunity; accentColor: string; index: number; onClick: () => void }) {
  const statusInfo = getOpportunityStatusInfo(opportunity.status);
  return (
    <div
      onClick={onClick}
      style={{ background: 'var(--ig-card)', borderRadius: 12, border: '1px solid var(--ig-separator)', overflow: 'hidden', cursor: 'pointer', animation: `fadeIn 0.25s ease-out ${index * 0.05}s both` }}
    >
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{opportunity.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{opportunity.brand_name}</div>
          </div>
          <div style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: statusInfo.bgColor, color: statusInfo.color }}>{statusInfo.label}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Tag label={`${parseFloat(opportunity.reward_amount) >= 1000 ? (parseFloat(opportunity.reward_amount) / 1000).toFixed(0) + 'K' : opportunity.reward_amount} ${opportunity.reward_currency}`} color={accentColor} />
          <Tag label={`Level ${opportunity.required_level}+`} />
          <Tag label={opportunity.category} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--ig-text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {opportunity.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>{opportunity.application_count} applicants</div>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

function CreatorDealCard({ deal, type, accentColor, index, onClick }: { deal: CreatorDeal; type: 'active' | 'completed'; accentColor: string; index: number; onClick: () => void }) {
  const statusInfo = getDealStatusInfo(deal.status);
  return (
    <div
      onClick={onClick}
      style={{ background: 'var(--ig-card)', borderRadius: 12, border: '1px solid var(--ig-separator)', overflow: 'hidden', cursor: 'pointer', animation: `fadeIn 0.25s ease-out ${index * 0.05}s both` }}
    >
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{deal.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{deal.brand_name}</div>
          </div>
          <div style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: statusInfo.bgColor, color: statusInfo.color }}>{statusInfo.label}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Tag label={formatCurrency(deal.total_amount)} color={accentColor} />
          <Tag label={`Level ${deal.required_level}+`} />
          <Tag label={deal.category} />
          {deal.platforms.map(p => <Tag key={p} label={p === 'across' ? 'Multi-Platform' : p.charAt(0).toUpperCase() + p.slice(1)} />)}
        </div>
        {type === 'active' && deal.deliverables.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Deliverables</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{deal.deliverables.filter(d => d.status === 'approved').length}/{deal.deliverables.length}</span>
            </div>
            <div style={{ height: 4, background: 'var(--ig-separator)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(deal.deliverables.filter(d => d.status === 'approved').length / deal.deliverables.length) * 100}%`, background: accentColor, borderRadius: 2 }} />
            </div>
          </div>
        )}
        <p style={{ fontSize: 13, color: 'var(--ig-text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {deal.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>Due: {new Date(deal.delivery_deadline).toLocaleDateString()}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: accentColor }}>View Details →</div>
        </div>
      </div>
    </div>
  );
}

function OpportunityDetailModal({ opportunity, accentColor, onClose, onApply }: { opportunity: MarketplaceOpportunity; accentColor: string; onClose: () => void; onApply: () => void }) {
  const [applying, setApplying] = useState(false);
  const [pitch, setPitch] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApply = async () => {
    if (pitch.length < 20) return;
    setApplying(true);
    setApplyError(null);
    const user = api.auth.getUser();
    if (!user?.persona_id) {
      setApplyError('Set up your persona before applying.');
      setApplying(false);
      return;
    }
    const result = await api.marketplace.applyToOpportunity(opportunity.id, user.persona_id, pitch);
    if (result.error) {
      setApplyError(result.error);
      setApplying(false);
    } else {
      onApply();
    }
  };

  const levelPreviews = [2, 3, 4, 5].map(level => {
    const pricing = calculateDealPricing(parseFloat(opportunity.reward_amount), level, false);
    return { level, amount: pricing.creatorPayout };
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', background: 'var(--ig-bg)', borderRadius: '16px 16px 0 0', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--ig-separator)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Deal Details</div>
          <button onClick={onClose} style={{ background: 'var(--ig-separator)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{opportunity.title}</div>
            <div style={{ fontSize: 14, color: 'var(--ig-text-secondary)' }}>{opportunity.brand_name}</div>
          </div>
          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, marginBottom: 16, border: '1px solid var(--ig-separator)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Your Potential Earnings</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {levelPreviews.map(preview => (
                <div key={preview.level} style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: preview.level === 3 ? `${accentColor}20` : 'var(--ig-elevated)', borderRadius: 8, border: preview.level === 3 ? `1px solid ${accentColor}` : 'none' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: preview.level === 3 ? accentColor : 'var(--ig-text-primary)' }}>{formatCurrency(preview.amount)}</div>
                  <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>Level {preview.level}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', textAlign: 'center', marginTop: 8 }}>
              Based on base budget of {formatCurrency(parseFloat(opportunity.reward_amount))} × level multiplier
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>About This Campaign</div>
            <p style={{ fontSize: 14, color: 'var(--ig-text-secondary)', lineHeight: 1.6 }}>{opportunity.description}</p>
          </div>
          {applyError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{applyError}</div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Your Pitch</div>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Tell the brand why you're the perfect fit for this campaign..."
              style={{ width: '100%', padding: 12, background: 'var(--ig-card)', border: '1px solid var(--ig-separator)', borderRadius: 10, fontSize: 14, color: 'var(--ig-text-primary)', resize: 'none', height: 100, boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={handleApply}
            disabled={applying || pitch.length < 20}
            style={{ width: '100%', padding: '14px 0', background: applying ? 'var(--ig-separator)' : accentColor, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: applying || pitch.length < 20 ? 'not-allowed' : 'pointer', opacity: pitch.length < 20 ? 0.5 : 1 }}
          >
            {applying ? 'Submitting Application...' : 'Apply to This Deal'}
          </button>
          <p style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', textAlign: 'center', marginTop: 10 }}>
            By applying, you agree to the deal terms. Funds are held in escrow until completion.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--ig-text-tertiary)', marginBottom: 16 }}>{description}</div>
      {action && onAction && (
        <button onClick={onAction} style={{ padding: '10px 20px', background: 'var(--ig-blue)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {action}
        </button>
      )}
    </div>
  );
}
