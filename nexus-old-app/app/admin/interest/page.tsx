'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface InterestSignup {
  id: number;
  instagram_handle: string;
  email: string;
  name: string;
  reason_for_interest: string;
  primary_profession: string;
  target_annual_income_usd: number;
  preferred_platforms: string[];
  has_existing_audience: boolean;
  estimated_follower_count: number;
  status: 'pending' | 'contacted' | 'converted_user' | 'rejected';
  created_at: string;
  contacted_at?: string;
  admin_notes?: string;
  converted_user_id?: number;
}


const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Pending' },
  contacted: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Contacted' },
  converted_user: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Converted' },
  rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Rejected' },
};

export default function CreatorInterestAdminPage() {
  const [signups, setSignups] = useState<InterestSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted' | 'converted_user' | 'rejected'>('all');
  const [toast, setToast] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadSignups = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('creator_interest_signups')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSignups(data as InterestSignup[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadSignups(); }, [loadSignups]);

  const filtered = filterStatus === 'all' ? signups : signups.filter(s => s.status === filterStatus);

  const handleContact = async (id: number) => {
    const { error } = await supabase
      .from('creator_interest_signups')
      .update({ status: 'contacted', contacted_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setSignups(prev => prev.map(s => s.id === id ? { ...s, status: 'contacted', contacted_at: new Date().toISOString() } : s));
      showToast('Marked as contacted');
    }
    setSelectedId(null);
    setActionNotes('');
  };

  const handleReject = async (id: number) => {
    if (!actionNotes.trim()) { showToast('Add rejection reason'); return; }
    const { error } = await supabase
      .from('creator_interest_signups')
      .update({ status: 'rejected', admin_notes: actionNotes })
      .eq('id', id);
    if (!error) {
      setSignups(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected', admin_notes: actionNotes } : s));
      showToast('Signup rejected');
    }
    setSelectedId(null);
    setActionNotes('');
  };

  const handleConvert = async (id: number) => {
    const { error } = await supabase
      .from('creator_interest_signups')
      .update({ status: 'converted_user' })
      .eq('id', id);
    if (!error) {
      setSignups(prev => prev.map(s => s.id === id ? { ...s, status: 'converted_user' } : s));
      showToast('Marked as converted');
    }
    setSelectedId(null);
    setActionNotes('');
  };

  const stats = {
    total: signups.length,
    pending: signups.filter(s => s.status === 'pending').length,
    contacted: signups.filter(s => s.status === 'contacted').length,
    converted: signups.filter(s => s.status === 'converted_user').length,
    conversion_rate: signups.length > 0 ? ((signups.filter(s => s.status === 'converted_user').length / signups.length) * 100).toFixed(1) : '0',
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#22c55e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, zIndex: 9999 }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Creator Interest Signups</h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Track and manage incoming creator applications</p>
        </div>
        <button
          onClick={loadSignups}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#a1a1aa', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Signups', value: stats.total, color: '#fff' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'Contacted', value: stats.contacted, color: '#3b82f6' },
          { label: 'Converted', value: stats.converted, color: '#22c55e' },
          { label: 'Conversion Rate', value: `${stats.conversion_rate}%`, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ color: '#71717a', fontSize: '0.75rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem', display: 'flex', gap: '0' }}>
        {(['all', 'pending', 'contacted', 'converted_user', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: filterStatus === status ? '2px solid #EF4444' : '2px solid transparent',
              color: filterStatus === status ? '#EF4444' : '#71717a',
              fontWeight: filterStatus === status ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              textTransform: 'capitalize',
            }}
          >
            {status === 'converted_user' ? 'Converted' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Signups Grid */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '80px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            No signups with status "{filterStatus}"
          </div>
        ) : (
          filtered.map(signup => {
            const s = STATUS_COLORS[signup.status];
            return (
              <div
                key={signup.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedId === signup.id ? '#EF4444' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '10px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedId(selectedId === signup.id ? null : signup.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700 }}>@{signup.instagram_handle.replace('@', '')}</span>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', color: '#71717a', fontSize: '0.85rem' }}>
                      <span><strong>{signup.name}</strong></span>
                      <span>{signup.email}</span>
                      <span style={{ color: '#6b7280' }}>{new Date(signup.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#a1a1aa', fontSize: '0.85rem' }}>{signup.primary_profession}</div>
                    <div style={{ color: '#52525b', fontSize: '0.75rem' }}>{signup.estimated_follower_count.toLocaleString()} followers</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedId === signup.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                        <strong>Why Interested:</strong>
                      </div>
                      <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', color: '#d4d4d8', lineHeight: '1.5' }}>
                        {signup.reason_for_interest}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      <div>
                        <div style={{ color: '#a1a1aa', marginBottom: '0.35rem' }}>Target Annual Income</div>
                        <div style={{ fontWeight: 600 }}>${signup.target_annual_income_usd.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ color: '#a1a1aa', marginBottom: '0.35rem' }}>Audience Status</div>
                        <div style={{ fontWeight: 600 }}>{signup.has_existing_audience ? '✓ Has Audience' : 'Building Audience'}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Preferred Platforms:</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {signup.preferred_platforms.map(p => (
                          <span key={p} style={{ padding: '0.3rem 0.7rem', background: 'rgba(139,92,246,0.15)', borderRadius: '100px', fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600 }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Notes */}
                    {(signup.status === 'pending' || signup.status === 'contacted') && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>
                          {signup.status === 'pending' ? 'Rejection Notes' : 'Follow-up Notes'}
                        </label>
                        <textarea
                          value={actionNotes}
                          onChange={e => setActionNotes(e.target.value)}
                          placeholder={signup.status === 'pending' ? 'Reason for rejection (required if rejecting)...' : 'Add follow-up notes...'}
                          style={{
                            width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box', minHeight: '60px'
                          }}
                        />
                      </div>
                    )}

                    {signup.admin_notes && (
                      <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                        <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>
                          <strong>Admin Notes:</strong> {signup.admin_notes}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {signup.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleContact(signup.id)}
                          style={{
                            padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                            borderRadius: '8px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                          }}
                        >
                          📞 Mark as Contacted
                        </button>
                        <button
                          onClick={() => handleReject(signup.id)}
                          style={{
                            padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                            borderRadius: '8px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                            opacity: actionNotes.trim() ? 1 : 0.5, pointerEvents: actionNotes.trim() ? 'auto' : 'none'
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}

                    {signup.status === 'contacted' && (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleConvert(signup.id)}
                          style={{
                            padding: '0.5rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                            borderRadius: '8px', color: '#22c55e', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                          }}
                        >
                          ✓ Mark Converted
                        </button>
                      </div>
                    )}

                    {signup.status === 'converted_user' && (
                      <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.08)', borderRadius: '8px', color: '#86efac', fontSize: '0.85rem', borderLeft: '3px solid #22c55e', fontWeight: 600 }}>
                        ✓ Converted to User ID {signup.converted_user_id}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
