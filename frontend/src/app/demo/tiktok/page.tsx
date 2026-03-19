'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useDealSync,
  type DealState,
  type DealRoomPhase,
  type SharedApplication,
  type Campaign,
  type ChatMessage,
} from '@/lib/useDealSync';
import {
  type ValueSkinSlot,
  SLOT_LABELS,
  SLOT_COLORS,
  ValueskinAvatarToggle,
  ProfilePhotoWithLongPress,
  PROFESSION_BADGES,
  defaultAboutMe,
} from '@/components/AvatarOptions';
import { STICKER_MANIFEST } from '@/generated/sticker-manifest';
import {
  isValidTiktokUrl,
  extractTiktokVideoId,
  formatPublicProfileUrl,
  formatTiktokProfileUrl,
} from '@/lib/tiktok-utils';

// TikTok uses the same dark theme as Instagram demo
const C = {
  primary: '#0095F6',
  bg: '#000000',
  surface: '#000000',
  surfaceAlt: '#121212',
  card: '#1A1A1A',
  text: '#F5F5F5',
  textSecondary: '#A8A8A8',
  textMuted: '#666666',
  border: '#262626',
  borderLight: '#363636',
  success: '#00D46A',
  successBg: 'rgba(0,212,106,0.08)',
  successBorder: 'rgba(0,212,106,0.25)',
  warning: '#FFAB00',
  warningBg: 'rgba(255,171,0,0.08)',
  warningBorder: 'rgba(255,171,0,0.25)',
  danger: '#ED4956',
  dangerBg: 'rgba(237,73,86,0.08)',
  dangerBorder: 'rgba(237,73,86,0.25)',
  accent: '#7C3AED',
  accentBg: 'rgba(124,58,237,0.08)',
  accentBorder: 'rgba(124,58,237,0.25)',
};

const SLOTS: ValueSkinSlot[] = ['profession', 'passion', 'hobby'];

type PipelineColumnKey = 'negotiating' | 'accepted' | 'in_progress';

type DeliverableStatus = 'pending' | 'uploaded' | 'approved';

type TikTokOpportunity = {
  id: number;
  brand: string;
  tiktokUrl?: string;
  type: string;
  match: string;
  featured: boolean;
  willingToBarter: boolean;
  about: string;
  budget: string;
  deadline: string;
  deliverables: { format: string; count: number }[];
  requirements: string[];
  exclusivity: string;
  usageRights: string;
  revisionLimit: number;
  compensationType: string;
  location: string;
  audienceTarget: string;
  escrowFunded?: boolean;
  escrowPool?: number;
  creatorCount?: number;
};

const TIKTOK_OPPORTUNITIES: TikTokOpportunity[] = [
  {
    id: 1,
    brand: 'ByteBrew',
    type: 'Product Review',
    match: '96%',
    featured: true,
    willingToBarter: true,
    about: 'Show how ByteBrew helps creators track performance across TikTok campaigns.',
    budget: '$4,500',
    deadline: 'Apr 30',
    deliverables: [
      { format: 'TikTok video (60s)', count: 2 },
      { format: 'Story-style cutdowns', count: 2 },
    ],
    requirements: [
      'Level 3+ Software Engineer or Tech Creator',
      'US, UK, or EU audience',
    ],
    exclusivity: 'No competing analytics tools for 30 days',
    usageRights: 'Organic social only, 90 days',
    revisionLimit: 2,
    compensationType: 'Paid',
    location: 'Remote',
    audienceTarget: 'Tech / creator tools',
    escrowFunded: true,
    escrowPool: 4500,
    creatorCount: 1,
  },
  {
    id: 2,
    brand: 'FitFuel Labs',
    type: 'Sponsored Content',
    match: '89%',
    featured: false,
    willingToBarter: true,
    about: 'Launch series for new pre-workout line focused on authentic creator routines.',
    budget: '$3,000',
    deadline: 'May 10',
    deliverables: [
      { format: 'TikTok video (30s-45s)', count: 3 },
    ],
    requirements: [
      'Level 2+ Fitness Coach or Athlete',
      'Visible training content on TikTok',
    ],
    exclusivity: 'No competing supplements for 45 days',
    usageRights: 'Organic + paid social, 180 days',
    revisionLimit: 3,
    compensationType: 'Paid + product',
    location: 'Remote',
    audienceTarget: 'Fitness / wellness',
    escrowFunded: false,
    escrowPool: 0,
    creatorCount: 3,
  },
];

type ExclusivityRecord = {
  id: number;
  brand: string;
  platform: 'tiktok';
  until: string;
};

function getStickerForProfession(profession: string): string | undefined {
  return PROFESSION_BADGES[profession]?.stickerImage || STICKER_MANIFEST[profession];
}

function getDealKeyForOpportunity(opp: TikTokOpportunity): string {
  return `tiktok:${opp.id}`;
}

function getPhaseLabel(phase: DealRoomPhase, hasSubmitted: boolean, allApproved: boolean): string {
  if (allApproved) return 'completed';
  if (hasSubmitted) return 'submitted';
  switch (phase) {
    case 'offer': return 'offer';
    case 'counter': return 'counter';
    case 'formal_offer': return 'formal_offer';
    case 'accepted': return 'accepted';
    case 'softhold': return 'softhold';
    default: return 'brief';
  }
}

export default function TikTokDemoPage() {
  const {
    dealStates,
    updateDeal,
    sendMessage,
  } = useDealSync();

  const [activeRole, setActiveRole] = useState<'creator' | 'brand'>('creator');
  const [activeView, setActiveView] = useState<'marketplace' | 'pipeline' | 'settings'>('marketplace');
  const [selectedSlot, setSelectedSlot] = useState<ValueSkinSlot>('profession');
  const [selectedOpportunity, setSelectedOpportunity] = useState<TikTokOpportunity | null>(TIKTOK_OPPORTUNITIES[0] ?? null);
  const [deliverableLinks, setDeliverableLinks] = useState<Record<number, string>>({});
  const [deliverableInputs, setDeliverableInputs] = useState<Record<number, string>>({});
  const [deliverableStatuses, setDeliverableStatuses] = useState<Record<number, DeliverableStatus>>({});
  const [completedDeals, setCompletedDeals] = useState<number[]>([]);
  const [exclusivities, setExclusivities] = useState<ExclusivityRecord[]>([
    {
      id: 1,
      brand: 'CreatorSuite',
      platform: 'tiktok',
      until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [showExclusivityWarning, setShowExclusivityWarning] = useState(false);
  const [profileHandle] = useState('@alex_on_tiktok');

  const sticker = getStickerForProfession('Software Engineer');
  const [valueskinAvatarEnabled] = useState(true);
  const [valueSkins] = useState<Record<ValueSkinSlot, { profession: string; aboutMe: string }>>({
    profession: { profession: 'Software Engineer', aboutMe: defaultAboutMe('Software Engineer') },
    passion: { profession: 'AI/ML Specialist', aboutMe: defaultAboutMe('AI/ML Specialist') },
    hobby: { profession: 'Fitness Coach', aboutMe: defaultAboutMe('Fitness Coach') },
  });

  const pipelineColumns = useMemo<Record<PipelineColumnKey, TikTokOpportunity[]>>(() => {
    const base: Record<PipelineColumnKey, TikTokOpportunity[]> = {
      negotiating: [],
      accepted: [],
      in_progress: [],
    };
    for (const opp of TIKTOK_OPPORTUNITIES) {
      const key = getDealKeyForOpportunity(opp);
      const state = dealStates[key];
      if (!state) continue;
      if (completedDeals.includes(opp.id)) {
        continue;
      }
      if (state.phase === 'accepted' || state.phase === 'softhold') {
        base.accepted.push(opp);
      } else if (state.phase === 'formal_offer' || state.phase === 'counter' || state.phase === 'chatroom') {
        base.negotiating.push(opp);
      } else if (state.phase === 'offer') {
        base.negotiating.push(opp);
      }
    }
    if (selectedOpportunity && completedDeals.includes(selectedOpportunity.id)) {
      base.in_progress.push(selectedOpportunity);
    }
    return base;
  }, [dealStates, completedDeals, selectedOpportunity]);

  const currentDealState: DealState | null = selectedOpportunity
    ? dealStates[getDealKeyForOpportunity(selectedOpportunity)] ?? null
    : null;

  const currentPhaseLabel = (() => {
    if (!selectedOpportunity || !currentDealState) return 'brief';
    const anyUploaded = Object.values(deliverableStatuses).some(s => s === 'uploaded' || s === 'approved');
    const allApproved = selectedOpportunity.deliverables.every((_, idx) => deliverableStatuses[idx] === 'approved');
    return getPhaseLabel(currentDealState.phase, anyUploaded, allApproved);
  })();

  const handleSendCounter = (opp: TikTokOpportunity, amountUsd: number) => {
    const key = getDealKeyForOpportunity(opp);
    const existing = dealStates[key];
    const suggested = Math.round(amountUsd * 1.25);
    const newState: Partial<DealState> = {
      phase: 'counter',
      counterAmount: String(amountUsd),
      brandResponseAmount: String(suggested),
    };
    if (!existing) {
      updateDeal(key, {
        phase: 'counter',
        intent: 'campaign',
        briefFilled: true,
        briefTitle: `${opp.brand} · ${opp.type}`,
        offerAmount: opp.budget.replace(/[^0-9]/g, ''),
        counterAmount: String(amountUsd),
        brandResponseAmount: String(suggested),
        chatMessages: [
          {
            id: Date.now(),
            sender: 'brand',
            text: `We saw your profile on TikTok and sent an initial offer of ${opp.budget}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isoTime: new Date().toISOString(),
          },
        ],
        chatInput: '',
        performanceClause: false,
        advancePercent: 30,
        uploadPercent: 40,
        approvalPercent: 30,
      });
    } else {
      updateDeal(key, newState);
    }
  };

  const handleAcceptFormalOffer = (opp: TikTokOpportunity) => {
    const key = getDealKeyForOpportunity(opp);
    const existing = dealStates[key];
    const existingExclusivity = exclusivities.find(e => e.platform === 'tiktok' && new Date(e.until) > new Date());
    if (existingExclusivity && opp.exclusivity.toLowerCase().includes('no competing')) {
      setShowExclusivityWarning(true);
    } else {
      setShowExclusivityWarning(false);
    }
    const patch: Partial<DealState> = {
      phase: opp.escrowFunded ? 'accepted' : 'softhold',
    };
    if (!existing) {
      updateDeal(key, {
        phase: opp.escrowFunded ? 'accepted' : 'softhold',
        intent: 'campaign',
        briefFilled: true,
        briefTitle: `${opp.brand} · ${opp.type}`,
        offerAmount: opp.budget.replace(/[^0-9]/g, ''),
        counterAmount: '',
        brandResponseAmount: '',
        chatMessages: [],
        chatInput: '',
        performanceClause: false,
        advancePercent: 30,
        uploadPercent: 40,
        approvalPercent: 30,
      });
    } else {
      updateDeal(key, patch);
    }
  };

  const handleSubmitDeliverable = (idx: number) => {
    if (!selectedOpportunity) return;
    if (!selectedOpportunity.escrowFunded) return;
    const url = deliverableInputs[idx];
    if (!url || !isValidTiktokUrl(url)) return;
    setDeliverableLinks(prev => ({ ...prev, [idx]: url }));
    setDeliverableStatuses(prev => ({ ...prev, [idx]: 'uploaded' }));
    setDeliverableInputs(prev => ({ ...prev, [idx]: '' }));
  };

  const handleApproveDeliverable = (idx: number) => {
    setDeliverableStatuses(prev => ({ ...prev, [idx]: 'approved' }));
    if (!selectedOpportunity) return;
    const allApprovedAfter = selectedOpportunity.deliverables.every((_, i) =>
      i === idx ? 'approved' === 'approved' : prevStatusIsApproved(deliverableStatuses[i]),
    );
    if (allApprovedAfter) {
      setCompletedDeals(prev => prev.includes(selectedOpportunity.id) ? prev : [...prev, selectedOpportunity.id]);
    }
  };

  function prevStatusIsApproved(status?: DeliverableStatus): boolean {
    return status === 'approved';
  }

  const handleSendChatMessage = async (text: string) => {
    if (!selectedOpportunity) return;
    const key = getDealKeyForOpportunity(selectedOpportunity);
    await sendMessage(key, text, 'me');
  };

  const handleRepeatDeal = (opp: TikTokOpportunity) => {
    const key = getDealKeyForOpportunity(opp);
    const now = new Date();
    const message = `Creator requested a repeat TikTok deal for ${opp.brand} on ${now.toISOString()}.`;
    // use "me" as sender to satisfy ChatMessage['sender'] type
    sendMessage(key, message, 'me');
  };

  const renderPhasePill = (phaseLabel: string) => {
    const steps = [
      'offer',
      'counter',
      'formal_offer',
      'accepted',
      'softhold',
      'submitted',
      'completed',
    ];
    const activeIndex = steps.indexOf(phaseLabel);
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10 }}>
        {steps.map((step, idx) => {
          const active = idx <= activeIndex;
          return (
            <div
              key={step}
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                background: active ? C.successBg : C.surfaceAlt,
                border: `1px solid ${active ? C.successBorder : C.border}`,
                color: active ? C.success : C.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                fontWeight: 600,
              }}
            >
              {step.replace('_', ' ')}
            </div>
          );
        })}
      </div>
    );
  };

  const renderChat = (deal: DealState | null) => {
    if (!deal) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 260 }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 8 }}>
          {deal.chatMessages.map((m: ChatMessage) => (
            <div key={m.id} style={{ marginBottom: 6, display: 'flex', justifyContent: m.sender === 'me' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '80%',
                  padding: '6px 9px',
                  borderRadius: 10,
                  background: m.sender === 'me' ? C.primary : C.surfaceAlt,
                  color: m.sender === 'me' ? '#fff' : C.text,
                  fontSize: 11,
                }}
              >
                <div style={{ marginBottom: 2 }}>{m.text}</div>
                <div style={{ fontSize: 9, color: m.sender === 'me' ? 'rgba(255,255,255,0.7)' : C.textMuted }}>
                  {new Date(m.isoTime).toUTCString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem('chat') as HTMLInputElement | null;
            const value = input?.value.trim();
            if (!value) return;
            handleSendChatMessage(value);
            if (input) input.value = '';
          }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            name="chat"
            placeholder="Message brand..."
            style={{
              flex: 1,
              background: C.surfaceAlt,
              borderRadius: 999,
              border: `1px solid ${C.border}`,
              color: C.text,
              padding: '6px 10px',
              fontSize: 11,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: 'none',
              background: C.primary,
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    );
  };

  const creatorCompletionRate = 95;
  const creatorResponseHours = 6;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: 16 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/" style={{ textDecoration: 'none', color: C.textSecondary, fontSize: 12 }}>
              ← Back
            </Link>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>TikTok × ValueSkins</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>Mirror of Instagram demo — TikTok-branded</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveRole('creator')}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: activeRole === 'creator' ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
                background: activeRole === 'creator' ? C.surfaceAlt : 'transparent',
                color: C.text,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Creator View
            </button>
            <button
              onClick={() => setActiveRole('brand')}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: activeRole === 'brand' ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
                background: activeRole === 'brand' ? C.surfaceAlt : 'transparent',
                color: C.text,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Brand View
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => setActiveView('marketplace')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: activeView === 'marketplace' ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
              background: activeView === 'marketplace' ? C.surfaceAlt : 'transparent',
              color: C.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveView('pipeline')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: activeView === 'pipeline' ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
              background: activeView === 'pipeline' ? C.surfaceAlt : 'transparent',
              color: C.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveView('settings')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: activeView === 'settings' ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
              background: activeView === 'settings' ? C.surfaceAlt : 'transparent',
              color: C.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Settings
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.4fr)', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ProfilePhotoWithLongPress
                  showValueskinAvatar={valueskinAvatarEnabled}
                  level={3}
                  valueSkins={valueSkins}
                  avatarUrl={sticker ?? ''}
                  displayName="Alex · Software Engineer"
                  size={48}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Alex · Software Engineer</div>
                  <a
                    href={formatTiktokProfileUrl(profileHandle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: C.primary, textDecoration: 'none' }}
                  >
                    {profileHandle}
                  </a>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                    890K followers · 7.2% engagement · Level 3
                  </div>
                </div>
                <ValueskinAvatarToggle enabled={valueskinAvatarEnabled} onChange={() => {}} />
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                {SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 999,
                      border: selectedSlot === slot ? `1px solid ${SLOT_COLORS[slot]}` : `1px solid ${C.border}`,
                      background: selectedSlot === slot ? C.surface : 'transparent',
                      color: C.text,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {SLOT_LABELS[slot]}
                  </button>
                ))}
              </div>
            </div>

            {activeView === 'marketplace' && (
              <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>TikTok Campaigns</div>
                    <div style={{ fontSize: 11, color: C.textSecondary }}>Filtered by your ValueSkins</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>
                    Available for deals: <span style={{ color: C.success }}>On</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {TIKTOK_OPPORTUNITIES.map(opp => {
                    const key = getDealKeyForOpportunity(opp);
                    const deal = dealStates[key];
                    const isSelected = selectedOpportunity?.id === opp.id;
                    const phaseLabel = deal ? getPhaseLabel(deal.phase, false, false) : 'offer';
                    const brandInitial = opp.brand.charAt(0);
                    return (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
                        style={{
                          borderRadius: 10,
                          border: `1px solid ${isSelected ? C.primary : C.border}`,
                          background: isSelected ? '#111827' : C.card,
                          padding: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              background: 'linear-gradient(135deg,#000000,#25f4ee,#fe2c55)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {brandInitial}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{opp.brand}</div>
                            <div style={{ fontSize: 11, color: C.textSecondary }}>
                              {opp.type} · {opp.location}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>{opp.match}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 11, color: C.textSecondary }}>
                            Budget {opp.budget} · Deadline {opp.deadline}
                          </div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>
                            Phase: <span style={{ color: C.text }}>{phaseLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeView === 'pipeline' && (
              <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Creator Pipeline</div>
                    <div style={{ fontSize: 11, color: C.textSecondary }}>Negotiating · Accepted · In Progress</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
                  {(['negotiating', 'accepted', 'in_progress'] as PipelineColumnKey[]).map(col => (
                    <div key={col}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        {col === 'negotiating' ? 'Negotiating' : col === 'accepted' ? 'Accepted' : 'In Progress'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {pipelineColumns[col].map(opp => (
                          <div
                            key={opp.id}
                            style={{
                              borderRadius: 8,
                              border: `1px solid ${C.border}`,
                              background: C.card,
                              padding: 8,
                              fontSize: 11,
                            }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{opp.brand}</div>
                            <div style={{ color: C.textSecondary }}>{opp.type}</div>
                          </div>
                        ))}
                        {pipelineColumns[col].length === 0 && (
                          <div style={{ fontSize: 11, color: C.textMuted }}>No deals here yet.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Deal Preferences</div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 10 }}>
                  Market rate intelligence and negotiation rules are mirrored from Instagram demo.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
                  <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, padding: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Available for deals</div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>
                      Brands can approach you directly without a campaign.
                    </div>
                    <div style={{ fontSize: 11, color: C.success }}>On (mirrors Instagram toggle)</div>
                  </div>
                  <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, padding: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Market rate intelligence</div>
                    <div style={{ fontSize: 11, color: C.textSecondary }}>
                      Shows suggested counter-offers at +25% based on similar TikTok creators.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Deal Room</div>
                  {selectedOpportunity && (
                    <div style={{ fontSize: 11, color: C.textSecondary }}>
                      {selectedOpportunity.brand} · {selectedOpportunity.type}
                    </div>
                  )}
                </div>
                <div>{renderPhasePill(currentPhaseLabel)}</div>
              </div>

              {showExclusivityWarning && (
                <div
                  style={{
                    marginBottom: 8,
                    padding: 8,
                    borderRadius: 8,
                    border: `1px solid ${C.warningBorder}`,
                    background: C.warningBg,
                    fontSize: 11,
                    color: C.warning,
                  }}
                >
                  Existing exclusivity on TikTok detected. Accepting this deal will conflict with an active exclusivity clause.
                </div>
              )}

              {selectedOpportunity && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 10 }}>
                  <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Offer & Counter</div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>
                      Brand offer {selectedOpportunity.budget}. You can counter with your ask.
                    </div>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem('ask') as HTMLInputElement | null;
                        const value = input?.value ? parseInt(input.value, 10) : NaN;
                        if (!value || Number.isNaN(value)) return;
                        handleSendCounter(selectedOpportunity, value);
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                    >
                      <label style={{ fontSize: 10, color: C.textMuted }}>Your ask (USD)</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          name="ask"
                          type="number"
                          placeholder="4500"
                          style={{
                            flex: 1,
                            background: C.surface,
                            borderRadius: 6,
                            border: `1px solid ${C.border}`,
                            color: C.text,
                            padding: '6px 8px',
                            fontSize: 11,
                            outline: 'none',
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: C.primary,
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Send Counter
                        </button>
                      </div>
                      {currentDealState?.offerAmount && (
                        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                          Suggested: $
                          {Math.round(
                            Number(currentDealState.offerAmount || selectedOpportunity.budget.replace(/[^0-9]/g, '')) * 1.25,
                          )}{' '}
                          (25% above brand offer)
                        </div>
                      )}
                    </form>
                  </div>

                  <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Creator Performance</div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>
                      Completion rate and response time visible to brands.
                    </div>
                    <div style={{ fontSize: 11 }}>
                      {creatorCompletionRate}% completion · responds in ≤{creatorResponseHours}h
                    </div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>
                      Repeat hire rate: 60% · Avg rating: 4.8★
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Chat</div>
              {renderChat(currentDealState)}
            </div>

            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Deliverables</div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>
                    Submit TikTok video URLs once escrow is funded.
                  </div>
                </div>
                {selectedOpportunity && (
                  <div style={{ fontSize: 11 }}>
                    {selectedOpportunity.escrowFunded ? (
                      <span style={{ color: C.success }}>Escrow funded</span>
                    ) : (
                      <span style={{ color: C.warning }}>Waiting for escrow</span>
                    )}
                  </div>
                )}
              </div>
              {selectedOpportunity ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedOpportunity.deliverables.map((d, idx) => {
                    const inputVal = deliverableInputs[idx] || '';
                    const storedLink = deliverableLinks[idx] || '';
                    const status = deliverableStatuses[idx] || 'pending';
                    const videoId = storedLink ? extractTiktokVideoId(storedLink) : null;
                    const valid = isValidTiktokUrl(inputVal);
                    const escrowLocked = !selectedOpportunity.escrowFunded;
                    return (
                      <div
                        key={idx}
                        style={{
                          borderRadius: 8,
                          border: `1px solid ${
                            status === 'approved'
                              ? C.successBorder
                              : status === 'uploaded'
                              ? C.primary
                              : C.border
                          }`,
                          padding: 8,
                          background: C.card,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ fontSize: 11, fontWeight: 700 }}>{d.format}</div>
                          <div style={{ fontSize: 10, color: C.textSecondary }}>x{d.count}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            value={inputVal}
                            onChange={e => setDeliverableInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                            placeholder="https://www.tiktok.com/@handle/video/1234567890"
                            disabled={escrowLocked}
                            style={{
                              flex: 1,
                              background: C.surface,
                              borderRadius: 6,
                              border: `1px solid ${
                                escrowLocked ? C.border : valid ? C.success : C.border
                              }`,
                              color: escrowLocked ? C.textMuted : C.text,
                              padding: '6px 8px',
                              fontSize: 11,
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            disabled={!valid || escrowLocked}
                            onClick={() => handleSubmitDeliverable(idx)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: 'none',
                              background: !valid || escrowLocked ? C.border : C.success,
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: !valid || escrowLocked ? 'not-allowed' : 'pointer',
                              opacity: !valid || escrowLocked ? 0.6 : 1,
                            }}
                          >
                            Confirm
                          </button>
                        </div>
                        {escrowLocked && (
                          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                            Uploads unlock once brand funds soft-hold escrow.
                          </div>
                        )}
                        {inputVal && !valid && !escrowLocked && (
                          <div style={{ fontSize: 10, color: C.danger, marginTop: 4 }}>
                            Must be a valid TikTok link (tiktok.com/@.../video/...) or vm.tiktok.com short link.
                          </div>
                        )}
                        {storedLink && (
                          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 10 }}>
                              <div style={{ color: C.textMuted, marginBottom: 2 }}>TikTok video</div>
                              <a
                                href={storedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 10,
                                  color: C.primary,
                                  textDecoration: 'none',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {videoId ? `tiktok.com/@.../video/${videoId}` : storedLink}
                              </a>
                            </div>
                            {status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveDeliverable(idx)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 999,
                                  border: `1px solid ${C.successBorder}`,
                                  background: C.successBg,
                                  color: C.success,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Approved
                              </button>
                            )}
                            {status === 'approved' && (
                              <div style={{ fontSize: 10, color: C.success }}>Approved</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.textMuted }}>Select a campaign from the marketplace.</div>
              )}
            </div>

            <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Completed Deals</div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>History with repeat-deal actions</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompletedDeals([])}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    border: 'none',
                    background: C.surface,
                    color: C.textSecondary,
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                >
                  Clear all
                </button>
              </div>
              {completedDeals.length === 0 ? (
                <div style={{ fontSize: 11, color: C.textMuted }}>No completed TikTok deals yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedDeals.map(id => {
                    const opp = TIKTOK_OPPORTUNITIES.find(o => o.id === id);
                    if (!opp) return null;
                    return (
                      <div
                        key={id}
                        style={{
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: C.card,
                          padding: 8,
                          fontSize: 11,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{opp.brand}</div>
                          <div style={{ color: C.textSecondary }}>{opp.type}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRepeatDeal(opp)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 999,
                            border: 'none',
                            background: C.primary,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Request Repeat Deal
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Public Profile</div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>
                Shareable ValueSkins profile for TikTok creators.
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  padding: 8,
                  background: C.card,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>valueskins.com link</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatPublicProfileUrl(profileHandle)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(formatPublicProfileUrl(profileHandle)).catch(() => undefined);
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: C.surface,
                    color: C.text,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

