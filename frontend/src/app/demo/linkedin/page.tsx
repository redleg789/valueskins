'use client';
// LinkedIn Demo — Professional Services Marketplace (B2B Expertise)
// 4 Deal Types: B2B Services, Professional Credentialing, Speaking/Training, Executive Positioning
// Workflow: Company sends brief → Professional reviews contract → Signs agreement → Work begins

import React, { useState } from 'react';
import Link from 'next/link';

const C = {
  primary: '#0A66C2',
  bg: '#F3F2EF',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E1E5E8',
  success: '#31A24C',
};

const OPPORTUNITIES = [
  {
    type: 'B2B Services',
    company: 'TechFlow SaaS',
    title: 'Build 3-Video Thought Leadership Series',
    scope: '3 videos × 5-10 min each • Usage rights: 12 months • Revisions: 2 rounds',
    terms: 'Fixed fee: $8,500 • Exclusivity: 90 days in DevOps/CI category',
    timeline: '4 weeks',
    nda: true,
  },
  {
    type: 'Speaking Engagement',
    company: 'CloudScale Conference',
    title: 'Keynote: AI Workflow Optimization',
    scope: 'Keynote address • 45 min + 15 min Q&A • Audience: 2,000 enterprise architects',
    terms: 'Honorarium: $5,000 • Travel covered • Recording shared with attendees (1 year)',
    timeline: 'June 15, 2026',
    nda: false,
  },
  {
    type: 'Professional Credentialing',
    company: 'VC Partners Network',
    title: 'Featured Advisor — AI & Scaling',
    scope: 'Profile badge • 5-10 advisory calls/month • Referral fee: 10% of first checks',
    terms: 'Base fee: $2,000/month • Equity opportunity on select deals',
    timeline: 'Ongoing engagement',
    nda: true,
  },
  {
    type: 'Executive Positioning',
    company: 'Anthropic Talent Partners',
    title: 'Introduction to Series B Investors',
    scope: 'Warm intros to 8-12 investors • Ongoing coaching • Network access',
    terms: 'Success fee: 1% of capital raised • No fee if no outcome',
    timeline: '6-month engagement',
    nda: true,
  },
];

const PROFESSIONALS = [
  {
    name: 'Dr. Sarah Chen',
    title: 'AI Infrastructure Expert',
    connections: '8,400',
    expertise: 'Machine Learning, Distributed Systems, DevOps',
  },
  {
    name: 'Marcus Johnson',
    title: 'Head of Product at DataScale',
    connections: '12,000+',
    expertise: 'Product Strategy, SaaS, Scaling, Go-to-Market',
  },
];

export default function LinkedInDemoPage() {
  const [view, setView] = useState<'browse' | 'profile' | 'deals'>('browse');
  const [prof, setProf] = useState<typeof PROFESSIONALS[0] | null>(null);
  const [opp, setOpp] = useState<typeof OPPORTUNITIES[0] | null>(null);
  const [phase, setPhase] = useState<'proposal' | 'contract' | 'signed' | 'active'>('proposal');
  const [deals, setDeals] = useState<any[]>([]);

  const sendProposal = () => {
    if (!prof || !opp) return;
    setDeals([...deals, { id: Date.now(), opp, prof: prof.name, phase: 'proposal' }]);
    setPhase('contract');
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: '100vh', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: `2px solid ${C.border}` }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>LinkedIn B2B Services</h1>
            <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0 }}>Professional opportunities: Speaking, advisory, services, consulting.</p>
          </div>
          <Link href="/demo/instagram" style={{ padding: '8px 16px', background: C.primary, color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            Back to Instagram
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {(['browse', 'profile', 'deals'] as const).map(t => (
            <button key={t} onClick={() => setView(t)} style={{ padding: '10px 16px', background: view === t ? C.primary : 'transparent', border: `2px solid ${view === t ? C.primary : C.border}`, color: view === t ? '#fff' : C.textSecondary, borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
              {t === 'browse' && 'Browse'} {t === 'profile' && 'Profile'} {t === 'deals' && `Deals (${deals.length})`}
            </button>
          ))}
        </div>

        {/* Browse */}
        {view === 'browse' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {OPPORTUNITIES.map((o, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: C.primary, textTransform: 'uppercase', marginBottom: '4px' }}>{o.type}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>{o.company}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '12px' }}>{o.title}</div>
                <div style={{ background: '#F3F2EF', borderRadius: '6px', padding: '12px', marginBottom: '12px', fontSize: '12px', color: C.text, lineHeight: 1.4 }}>{o.scope}</div>
                <div style={{ background: 'rgba(10,102,194,0.08)', border: '1px solid rgba(10,102,194,0.25)', borderRadius: '6px', padding: '10px', marginBottom: '12px', fontSize: '12px', color: C.primary, lineHeight: 1.4 }}>{o.terms}</div>
                <button onClick={() => { setOpp(o); setView('profile'); }} style={{ width: '100%', background: C.primary, border: 'none', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                  Send Proposal
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {view === 'profile' && (
          <div style={{ maxWidth: '600px' }}>
            {!prof ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {PROFESSIONALS.map((p, i) => (
                  <div key={i} onClick={() => setProf(p)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: C.textSecondary, marginTop: '4px' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>{p.connections} connections</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setProf(null)} style={{ marginBottom: '16px', background: 'none', border: 'none', color: C.primary, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  ← Change profile
                </button>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{prof.name}</div>
                  <div style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '16px' }}>{prof.title}</div>
                  <div style={{ background: '#F3F2EF', borderRadius: '6px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: C.text }}>{prof.expertise}</div>
                  {opp && (
                    <>
                      <div style={{ background: 'rgba(10,102,194,0.08)', border: '1px solid rgba(10,102,194,0.25)', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: C.primary, marginBottom: '4px' }}>{opp.type}</div>
                        <div style={{ fontSize: '12px', color: C.text }}>{opp.title}</div>
                        <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '4px' }}>{opp.company}</div>
                      </div>
                      {phase === 'proposal' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={sendProposal} style={{ flex: 1, background: C.primary, border: 'none', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                            Send Proposal
                          </button>
                          <button onClick={() => { setOpp(null); setView('browse'); }} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary, padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                            Back
                          </button>
                        </div>
                      )}
                      {phase === 'contract' && (
                        <div style={{ background: 'rgba(49,162,76,0.08)', border: '1px solid rgba(49,162,76,0.25)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.success, marginBottom: '8px' }}>Agreement Received</div>
                          <button onClick={() => setPhase('signed')} style={{ width: '100%', background: C.primary, border: 'none', color: '#fff', padding: '8px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>
                            Sign Agreement
                          </button>
                        </div>
                      )}
                      {phase === 'signed' && (
                        <div style={{ background: 'rgba(49,162,76,0.08)', borderRadius: '6px', padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: C.success }}>
                          ✓ Agreement Signed
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deals */}
        {view === 'deals' && (
          <div style={{ maxWidth: '800px' }}>
            {deals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '14px', color: C.textSecondary }}>
                No active engagements yet. Browse opportunities to get started.
              </div>
            ) : (
              deals.map(d => (
                <div key={d.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{d.opp.title}</div>
                  <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '4px' }}>{d.opp.company}</div>
                  <div style={{ fontSize: '11px', color: C.primary, fontWeight: 700, marginTop: '8px', textTransform: 'uppercase' }}>{d.phase}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
