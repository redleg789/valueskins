'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type DealRoomMessage } from '@/lib/api';

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
};

const MSG_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  system: { label: 'System', color: '#f59e0b' },
  offer_made: { label: 'Offer', color: '#8b5cf6' },
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
  const [advancePercent, setAdvancePercent] = useState(100);
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [dealStatus, setDealStatus] = useState<string | null>(null);
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

  // Load payment preferences and deal status on mount
  useEffect(() => {
    async function loadPrefs() {
      const res = await api.dealRooms.getPaymentPreferences(dealRoomId);
      if (res.data) {
        setAdvancePercent(res.data.advance_pct);
        setPerformanceClause(res.data.performance_clause_enabled);
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
  const savePaymentPreferences = useCallback((advPct: number, perfEnabled: boolean) => {
    if (prefsDebounce.current) clearTimeout(prefsDebounce.current);
    prefsDebounce.current = setTimeout(async () => {
      setSavingPrefs(true);
      await api.dealRooms.savePaymentPreferences(dealRoomId, {
        advance_pct: advPct,
        performance_clause_enabled: perfEnabled,
      });
      setSavingPrefs(false);
    }, 500);
  }, [dealRoomId]);

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

          {/* Payment Status */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: C.text }}>
              Payment Terms
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '8px 10px', background: C.card, borderRadius: 6, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 4 }}>Advance</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{advancePercent}%</div>
              </div>
              <div style={{ padding: '8px 10px', background: C.card, borderRadius: 6, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 4 }}>Performance</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>{100 - advancePercent}%</div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: C.card, borderRadius: 6, cursor: 'pointer', border: `1px solid ${C.border}` }}>
              <input
                type="checkbox"
                checked={performanceClause}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setPerformanceClause(enabled);
                  const newAdv = enabled ? 70 : 100;
                  setAdvancePercent(newAdv);
                  savePaymentPreferences(newAdv, enabled);
                }}
                style={{ width: 14, height: 14, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, color: C.text }}>Performance-based payment</span>
            </label>

            {performanceClause && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={advancePercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAdvancePercent(val);
                    savePaymentPreferences(val, performanceClause);
                  }}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 4, textAlign: 'center' }}>
                  Max performance: 30%
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: savingPrefs ? C.textSecondary : C.green, background: savingPrefs ? 'rgba(136,136,136,0.1)' : 'rgba(34, 197, 94, 0.1)', padding: '8px 10px', borderRadius: 6, marginTop: 8, textAlign: 'center' }}>
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
