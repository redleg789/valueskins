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
  const [advancePercent, setAdvancePercent] = useState(70);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get current user ID from localStorage
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

  useEffect(() => {
    loadMessages();
    // Poll every 3s for new messages
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

  if (!currentUserId) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Not logged in</p>
          <p style={{ color: C.textSecondary }}>Please log in with Instagram to access deal rooms.</p>
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
          <div style={{ fontSize: 12, color: C.textSecondary }}>
            All messages are immutable and recorded
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: 12, color: C.green }}>Recorded</span>
        </div>
      </div>

      {/* Payment Status Panel */}
      <div style={{
        padding: '16px',
        background: 'rgba(34, 197, 94, 0.05)',
        borderBottom: `1px solid ${C.green}40`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
          <div style={{ fontWeight: 600, fontSize: 14, color: C.green }}>Payment Escrowed & Locked</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: '10px 12px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Advance Payment</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>{advancePercent}%</div>
            <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 2 }}>Paid on upload</div>
          </div>
          <div style={{ padding: '10px 12px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Performance Bonus</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{100 - advancePercent}%</div>
            <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 2 }}>After approval (max 30%)</div>
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={performanceClause}
              onChange={(e) => {
                setPerformanceClause(e.target.checked);
                if (!e.target.checked) setAdvancePercent(100);
              }}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: C.text }}>Enable performance-based payment clause (optional)</span>
          </label>
          {performanceClause && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Advance: {advancePercent}% | Performance: {100 - advancePercent}%</div>
              <input
                type="range"
                min="70"
                max="100"
                value={advancePercent}
                onChange={(e) => setAdvancePercent(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: C.textSecondary, background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 6 }}>
          ✓ Creator gets paid in <strong>days</strong>, not 60 days. Payment locked before work starts. No waiting.
        </div>
      </div>

      {/* Messages */}
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
            <p style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>No messages yet</p>
            <p>Send the first message to start negotiating.</p>
            <p style={{ fontSize: 12, marginTop: 12, color: C.textSecondary }}>
              Every message is timestamped and stored as an immutable record on the server.
            </p>
          </div>
        )}

        {/* Documented proof banner */}
        {messages.length > 0 && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            marginBottom: 8,
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
          }}>
            All {messages.length} messages are immutable, timestamped, and server-recorded
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

      {/* Done Banner + Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <div style={{
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${C.green}40`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13, color: C.green, fontWeight: 500 }}>
            Both parties satisfied? Finalize the deal.
          </div>
          <button
            onClick={() => {
              alert('Deal accepted! Proceeding to payment and contract signing.');
              router.push('/deals');
            }}
            style={{
              padding: '6px 14px',
              background: C.green,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Done, Accept Now
          </button>
        </div>
        <form onSubmit={handleSend} style={{
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
      </div>

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
  );
}
