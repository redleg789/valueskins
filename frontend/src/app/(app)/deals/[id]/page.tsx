'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type DealRoomMessage } from '@/lib/api';
import { formatCurrency, getCurrencyForCountry } from '@/lib/deals';

const C = {
  bg: '#0A0A0A',
  surface: '#141414',
  card: '#1C1C1E',
  text: '#E0E0E0',
  textSecondary: '#888',
  border: '#262626',
  blue: '#0095F6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  orange: '#f59e0b',
};

const MSG_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  system: { label: 'System', color: '#f59e0b' },
  offer_made: { label: 'Offer', color: '#8b5cf6' },
  counter_offer: { label: 'Counter', color: '#f59e0b' },
  offer_accepted: { label: 'Accepted', color: '#22c55e' },
  deliverable_uploaded: { label: 'Deliverable', color: '#3b82f6' },
  contract_signed: { label: 'Contract', color: '#22c55e' },
  dispute_filed: { label: 'Dispute', color: '#ef4444' },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CHECKLIST_ITEMS = [
  { id: 1, title: 'Agree on deliverables', completed: false },
  { id: 2, title: 'Set timeline & milestones', completed: false },
  { id: 3, title: 'Confirm payment terms', completed: false },
  { id: 4, title: 'Review & sign contract', completed: false },
];

export default function DealRoomPage() {
  const params = useParams();
  const router = useRouter();
  const dealRoomId = Number(params.id);

  const [messages, setMessages] = useState<DealRoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [performanceClause, setPerformanceClause] = useState(false);
  const [advancePercent, setAdvancePercent] = useState(30);
  const [afterSubmissionPercent, setAfterSubmissionPercent] = useState(50);
  const [performancePercent, setPerformancePercent] = useState(20);
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [dealStatus, setDealStatus] = useState<string | null>(null);

  // Counter-offer state
  const [counterMode, setCounterMode] = useState(false);
  const [yourAskCents, setYourAskCents] = useState(0);
  const [counterAskCents, setCounterAskCents] = useState(0);
  const [brandOfferCents, setBrandOfferCents] = useState(0);
  const [counterSubmitting, setCounterSubmitting] = useState(false);
  const [counterHistory, setCounterHistory] = useState<Array<{ amount: number; by: 'creator' | 'brand'; at: string }>>([]);

  // Currency
  const [creatorCountry, setCreatorCountry] = useState('United States');
  const [brandCountry, setBrandCountry] = useState('United States');
  const [isInternational, setIsInternational] = useState(false);

  const creatorCurrency = getCurrencyForCountry(creatorCountry);
  const brandCurrency = getCurrencyForCountry(brandCountry);
  const displayCurrency = isInternational ? brandCurrency : creatorCurrency;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefsDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const u = localStorage.getItem('valueskins_user');
      return u ? JSON.parse(u).id : null;
    } catch { return null; }
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    const result = await api.dealRooms.getChatHistory(dealRoomId, { limit: 200 });
    if (result.error) {
      if (!silent) setError(result.error);
    } else {
      setMessages(result.data?.messages ?? []);
    }
    if (!silent) setLoading(false);
  }, [dealRoomId]);

  // Load payment preferences, deal status, and deal details on mount
  useEffect(() => {
    async function loadPrefs() {
      const res = await api.dealRooms.getPaymentPreferences(dealRoomId);
      if (res.data) {
        setAdvancePercent(res.data.advance_pct ?? 30);
        setAfterSubmissionPercent(res.data.after_submission_pct ?? 50);
        setPerformancePercent(res.data.performance_pct ?? 20);
        setPerformanceClause(res.data.performance_clause_enabled);
        if (res.data.your_ask_cents) setYourAskCents(res.data.your_ask_cents);
        if (res.data.brand_offer_cents) setBrandOfferCents(res.data.brand_offer_cents);
        if (res.data.counter_history) setCounterHistory(res.data.counter_history);
        if (res.data.creator_country) setCreatorCountry(res.data.creator_country);
        if (res.data.brand_country) setBrandCountry(res.data.brand_country);
        if (res.data.is_international) setIsInternational(res.data.is_international);
      }
    }
    async function loadStatus() {
      const res = await api.dealRooms.getDealRoomStatus(dealRoomId);
      if (res.data) setDealStatus(res.data.status);
    }
    loadPrefs();
    loadStatus();
  }, [dealRoomId]);

  // Save payment preferences to backend (debounced)
  const savePaymentPreferences = useCallback((advPct: number, subPct: number, perfPct: number, perfEnabled: boolean) => {
    if (prefsDebounce.current) clearTimeout(prefsDebounce.current);
    prefsDebounce.current = setTimeout(async () => {
      setSavingPrefs(true);
      await api.dealRooms.savePaymentPreferences(dealRoomId, {
        advance_pct: advPct,
        after_submission_pct: subPct,
        performance_pct: perfPct,
        performance_clause_enabled: perfEnabled,
      });
      setSavingPrefs(false);
    }, 500);
  }, [dealRoomId]);

  // Submit counter-offer
  const submitCounterOffer = async () => {
    if (counterAskCents <= 0 || counterSubmitting) return;
    setCounterSubmitting(true);
    const result = await api.dealRooms.sendMessage(dealRoomId,
      `Counter-offer: ${formatCurrency(counterAskCents, displayCurrency)}`,
      'counter_offer'
    );
    if (!result.error) {
      setCounterHistory(prev => [...prev, { amount: counterAskCents, by: 'creator', at: new Date().toISOString() }]);
      setYourAskCents(counterAskCents);
      setCounterMode(false);
      setCounterAskCents(0);
      await loadMessages(true);
    }
    setCounterSubmitting(false);
  };

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(() => loadMessages(true), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setSendError(null);
    const result = await api.dealRooms.sendMessage(dealRoomId, text);
    if (result.error) {
      setSendError(result.error);
    } else {
      setNewMessage('');
      await loadMessages(true);
    }
    setSending(false);
  };

  const toggleChecklistItem = (id: number) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const allChecked = checklist.every(item => item.completed);

  if (!currentUserId) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Not logged in</p>
          <p style={{ color: C.textSecondary }}>Please log in to access deal rooms.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, color: C.text }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => router.push('/deals')}
          style={{ background: 'none', border: 'none', color: C.text, fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}
        >
          &larr;
        </button>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Deal #{dealRoomId}</div>
          <div style={{ fontSize: 12, color: C.textSecondary }}>Negotiate & finalize terms</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: 12, color: C.green }}>Live</span>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '1px', background: C.border }}>

        {/* LEFT: Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: C.bg, minWidth: 0 }}>

          {/* Messages area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {loading && messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: C.textSecondary }}>Loading messages...</div>
            )}
            {error && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: C.red, marginBottom: 12 }}>{error}</p>
                <button onClick={() => loadMessages()} style={{ padding: '8px 16px', background: C.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Retry</button>
              </div>
            )}
            {!loading && !error && messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: C.textSecondary }}>
                <p style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>Start negotiating</p>
                <p>Send the first message to discuss terms with the other party.</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.sender_user_id === currentUserId;
              const isSystem = msg.message_type !== 'text';
              const typeInfo = MSG_TYPE_LABELS[msg.message_type];

              if (isSystem && typeInfo) {
                return (
                  <div key={msg.id} style={{
                    textAlign: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: `${typeInfo.color}20`,
                      color: typeInfo.color,
                      fontSize: 11,
                      fontWeight: 600,
                      marginRight: 6,
                    }}>{typeInfo.label}</span>
                    {msg.content}
                    <span style={{ display: 'block', fontSize: 11, color: C.textSecondary, marginTop: 4 }}>
                      {formatTime(msg.server_timestamp)}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? C.blue : C.card,
                    color: isMe ? '#fff' : C.text,
                  }}>
                    <div style={{ fontSize: 14, lineHeight: 1.4, wordBreak: 'break-word' }}>{msg.content}</div>
                    <div style={{
                      fontSize: 11,
                      color: isMe ? 'rgba(255,255,255,0.6)' : C.textSecondary,
                      marginTop: 4,
                      textAlign: 'right',
                    }}>
                      {formatTime(msg.server_timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSend} style={{
            padding: '12px 16px',
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={5000}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                color: C.text,
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{
                padding: '10px 20px',
                background: !newMessage.trim() || sending ? 'rgba(0,149,246,0.3)' : C.blue,
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 14,
                cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>

          {sendError && (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(239,68,68,0.1)',
              borderTop: `1px solid rgba(239,68,68,0.2)`,
              color: C.red,
              fontSize: 13,
              textAlign: 'center',
            }}>
              {sendError}
            </div>
          )}
        </div>

        {/* RIGHT: Checklist & Payment */}
        <div style={{
          width: 320,
          background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>

          {/* Checklist */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: C.text }}>
              Deal Checklist
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {checklist.map(item => (
                <label key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  background: C.card,
                  borderRadius: 6,
                  cursor: 'pointer',
                  border: `1px solid ${C.border}`,
                }}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{
                    fontSize: 13,
                    color: item.completed ? C.textSecondary : C.text,
                    textDecoration: item.completed ? 'line-through' : 'none',
                  }}>
                    {item.title}
                  </span>
                </label>
              ))}
            </div>
            {allChecked && (
              <div style={{
                marginTop: 12,
                padding: '10px 12px',
                background: `${C.green}15`,
                border: `1px solid ${C.green}40`,
                borderRadius: 6,
                fontSize: 12,
                color: C.green,
                textAlign: 'center',
                fontWeight: 600,
              }}>
                ✓ All items completed!
              </div>
            )}
          </div>

          {/* Your Ask & Counter-Offer */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: C.text }}>
              Pricing ({displayCurrency})
            </div>

            {/* Brand's Offer */}
            {brandOfferCents > 0 && (
              <div style={{ padding: '10px 12px', background: `${C.purple}15`, borderRadius: 8, border: `1px solid ${C.purple}30`, marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 2 }}>Brand&apos;s Offer</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.purple }}>{formatCurrency(brandOfferCents, displayCurrency)}</div>
              </div>
            )}

            {/* Your Ask — read-only by default, editable only in counter mode */}
            <div style={{ padding: '10px 12px', background: `${C.green}15`, borderRadius: 8, border: `1px solid ${C.green}30`, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 2 }}>Your Ask</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>
                {yourAskCents > 0 ? formatCurrency(yourAskCents, displayCurrency) : 'Not set'}
              </div>
            </div>

            {/* Counter-offer section */}
            {!counterMode ? (
              <button
                onClick={() => {
                  setCounterMode(true);
                  setCounterAskCents(yourAskCents || brandOfferCents);
                }}
                disabled={dealStatus === 'finalized'}
                style={{
                  width: '100%', padding: '10px', background: `${C.orange}20`, border: `1px solid ${C.orange}40`,
                  borderRadius: 8, color: C.orange, fontSize: 13, fontWeight: 600, cursor: dealStatus === 'finalized' ? 'not-allowed' : 'pointer',
                  opacity: dealStatus === 'finalized' ? 0.5 : 1,
                }}
              >
                Counter Offer
              </button>
            ) : (
              <div style={{ background: C.card, borderRadius: 8, padding: 12, border: `1px solid ${C.orange}40` }}>
                <div style={{ fontSize: 11, color: C.orange, fontWeight: 600, marginBottom: 8 }}>Enter your counter-offer</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 600 }}>{displayCurrency}</span>
                  <input
                    type="number"
                    min="0"
                    value={counterAskCents > 0 ? (counterAskCents / 100).toFixed(0) : ''}
                    onChange={(e) => setCounterAskCents(Math.round(Number(e.target.value) * 100))}
                    placeholder="Amount"
                    style={{
                      flex: 1, padding: '8px 10px', background: C.bg, border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.text, fontSize: 16, fontWeight: 700, outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={submitCounterOffer}
                    disabled={counterAskCents <= 0 || counterSubmitting}
                    style={{
                      flex: 1, padding: '8px', background: counterAskCents <= 0 ? 'rgba(249,115,22,0.2)' : C.orange,
                      color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12,
                      cursor: counterAskCents <= 0 || counterSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {counterSubmitting ? 'Submitting...' : 'Submit Counter'}
                  </button>
                  <button
                    onClick={() => { setCounterMode(false); setCounterAskCents(0); }}
                    style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSecondary, fontSize: 12, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Counter history */}
            {counterHistory.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Negotiation History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {counterHistory.map((entry, i) => (
                    <div key={i} style={{ fontSize: 11, padding: '4px 8px', background: `${entry.by === 'creator' ? C.green : C.purple}10`, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: entry.by === 'creator' ? C.green : C.purple }}>
                        {entry.by === 'creator' ? 'You' : 'Brand'}: {formatCurrency(entry.amount, displayCurrency)}
                      </span>
                      <span style={{ color: C.textSecondary }}>{new Date(entry.at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isInternational && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: `${C.blue}15`, borderRadius: 6, fontSize: 11, color: C.blue, textAlign: 'center' }}>
                International deal — amounts shown in {displayCurrency}
              </div>
            )}
          </div>

          {/* Payment Plan — 3-way split */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: C.text }}>
              Payment Plan
            </div>

            {/* Visual split bar */}
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              {advancePercent > 0 && <div style={{ width: `${advancePercent}%`, background: C.green, transition: 'width 0.2s' }} />}
              {afterSubmissionPercent > 0 && <div style={{ width: `${afterSubmissionPercent}%`, background: C.blue, transition: 'width 0.2s' }} />}
              {performancePercent > 0 && <div style={{ width: `${performancePercent}%`, background: C.orange, transition: 'width 0.2s' }} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
              <div style={{ padding: '8px 6px', background: C.card, borderRadius: 6, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: C.green, marginBottom: 2, fontWeight: 600 }}>Advance</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{advancePercent}%</div>
              </div>
              <div style={{ padding: '8px 6px', background: C.card, borderRadius: 6, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: C.blue, marginBottom: 2, fontWeight: 600 }}>Submission</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{afterSubmissionPercent}%</div>
              </div>
              <div style={{ padding: '8px 6px', background: C.card, borderRadius: 6, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: C.orange, marginBottom: 2, fontWeight: 600 }}>Performance</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.orange }}>{performancePercent}%</div>
              </div>
            </div>

            {/* Advance slider */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Advance %</div>
              <input type="range" min="0" max="100" value={advancePercent}
                onChange={(e) => {
                  const newAdv = Number(e.target.value);
                  const remaining = 100 - newAdv;
                  const newSub = Math.min(afterSubmissionPercent, remaining);
                  const newPerf = remaining - newSub;
                  setAdvancePercent(newAdv);
                  setAfterSubmissionPercent(newSub);
                  setPerformancePercent(newPerf);
                  savePaymentPreferences(newAdv, newSub, newPerf, performanceClause);
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* After Submission slider */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>After Submission %</div>
              <input type="range" min="0" max={100 - advancePercent} value={afterSubmissionPercent}
                onChange={(e) => {
                  const newSub = Number(e.target.value);
                  const newPerf = 100 - advancePercent - newSub;
                  setAfterSubmissionPercent(newSub);
                  setPerformancePercent(newPerf);
                  savePaymentPreferences(advancePercent, newSub, newPerf, performanceClause);
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ fontSize: 11, color: C.textSecondary, textAlign: 'center', marginBottom: 8 }}>
              Performance auto-adjusts to keep total at 100%
            </div>

            <div style={{ fontSize: 11, color: savingPrefs ? C.textSecondary : C.green, background: savingPrefs ? 'rgba(136,136,136,0.1)' : 'rgba(34, 197, 94, 0.1)', padding: '8px 10px', borderRadius: 6, textAlign: 'center' }}>
              {savingPrefs ? 'Saving...' : 'Saved to deal'}
            </div>
          </div>

          {/* Action button */}
          <div style={{ padding: '16px' }}>
            <button
              onClick={async () => {
                if (!allChecked || finalizing) return;
                if (!confirm('Are you sure you want to finalize this deal? A contract will be generated automatically.')) return;
                setFinalizing(true);
                const res = await api.dealRooms.finalizeDeal(dealRoomId);
                if (res.error) {
                  alert(`Failed to finalize: ${res.error}`);
                } else {
                  setDealStatus('finalized');
                  await loadMessages(true);
                }
                setFinalizing(false);
              }}
              disabled={!allChecked || finalizing || dealStatus === 'finalized'}
              style={{
                width: '100%',
                padding: '12px',
                background: dealStatus === 'finalized' ? C.textSecondary : allChecked ? C.green : 'rgba(34, 197, 94, 0.3)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: !allChecked || finalizing || dealStatus === 'finalized' ? 'not-allowed' : 'pointer',
              }}
            >
              {dealStatus === 'finalized' ? 'Deal Finalized' : finalizing ? 'Finalizing...' : allChecked ? 'Done, Accept Now' : 'Complete Checklist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
