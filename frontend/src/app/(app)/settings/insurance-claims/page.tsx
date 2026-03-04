'use client';

import { useState, useEffect } from 'react';

/**
 * INSURANCE CLAIMS WORKFLOW
 * Creators can file and track insurance claims for deal disputes or non-payment
 */

export default function InsuranceClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    deal_id: '',
    claim_type: 'non_payment',
    amount_cents: '',
    description: '',
  });

  useEffect(() => {
    setLoading(false);
    setClaims([
      {
        id: 1,
        deal_id: 101,
        brand_name: 'TechBrand Inc',
        claim_type: 'non_payment',
        amount_cents: 50000,
        status: 'approved',
        filed_at: '2024-02-15T10:00:00Z',
        approved_at: '2024-02-20T14:30:00Z',
        payout_date: '2024-02-22T00:00:00Z',
      },
      {
        id: 2,
        deal_id: 102,
        brand_name: 'FashionCorp',
        claim_type: 'dispute_resolution',
        amount_cents: 25000,
        status: 'under_review',
        filed_at: '2024-02-28T15:00:00Z',
        approved_at: null,
        payout_date: null,
      },
    ]);
  }, []);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call would happen here
    alert('Claim submitted! Our team will review within 24-48 hours.');
    setShowNewClaim(false);
    setFormData({ deal_id: '', claim_type: 'non_payment', amount_cents: '', description: '' });
  };

  const claimTypes = [
    { value: 'non_payment', label: '💰 Non-Payment', desc: 'Brand did not pay for completed work' },
    { value: 'dispute_resolution', label: '⚖️ Dispute Resolution', desc: 'Unresolved dispute with brand' },
    { value: 'quality_issue', label: '⚠️ Quality Issue', desc: 'Brand claimed work quality was below contract' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'approved') return '#10b981';
    if (status === 'under_review') return '#f59e0b';
    if (status === 'rejected') return '#ef4444';
    return '#3b82f6';
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🛡️ Insurance & Claims</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
            File claims for non-payment, disputes, or quality issues. We handle the investigation.
          </p>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: '1rem',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '8px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
        }}>
          <strong>✓ Protection Included:</strong> All deals on ValueSkins are backed by our creator protection insurance. If a brand doesn't pay or disputes arise, we investigate and protect your earnings.
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Claims Filed', count: 2, color: '#3b82f6' },
            { label: 'Approved', count: 1, color: '#10b981' },
            { label: 'Under Review', count: 1, color: '#f59e0b' },
            { label: 'Total Protected', value: '$7,500', color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, marginBottom: '0.25rem' }}>
                {stat.count || stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* New Claim Button */}
        <button
          onClick={() => setShowNewClaim(!showNewClaim)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            marginBottom: '2rem',
          }}
        >
          {showNewClaim ? '✕ Close' : '+ File New Claim'}
        </button>

        {/* New Claim Form */}
        {showNewClaim && (
          <form
            onSubmit={handleSubmitClaim}
            style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontWeight: 700 }}>File a New Claim</h3>

            {/* Claim Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Claim Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {claimTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, claim_type: type.value }))}
                    style={{
                      padding: '0.75rem',
                      background: formData.claim_type === type.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                      border: formData.claim_type === type.value ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{type.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem' }}>{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Deal ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Deal ID
              </label>
              <input
                type="number"
                value={formData.deal_id}
                onChange={e => setFormData(prev => ({ ...prev, deal_id: e.target.value }))}
                placeholder="e.g., 101"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Amount to Claim
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: '#a1a1aa' }}>$</span>
                <input
                  type="number"
                  value={formData.amount_cents ? parseInt(formData.amount_cents) / 100 : ''}
                  onChange={e => setFormData(prev => ({ ...prev, amount_cents: String(parseInt(e.target.value) * 100) }))}
                  placeholder="0.00"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Description & Evidence
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Explain what happened. Include timestamps, deal terms, and any evidence (messages, contracts, etc.)"
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Submit Claim
            </button>
          </form>
        )}

        {/* Claims List */}
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Your Claims</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {claims.map(claim => (
            <div
              key={claim.id}
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Claim #{claim.id}</div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                    {claim.brand_name} • Deal #{claim.deal_id}
                  </div>
                </div>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: getStatusColor(claim.status) + '20',
                    color: getStatusColor(claim.status),
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {getStatusLabel(claim.status)}
                </span>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Amount Claimed</span>
                  <span style={{ fontWeight: 700 }}>${(claim.amount_cents / 100).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Filed</span>
                  <span style={{ fontSize: '0.9rem' }}>{new Date(claim.filed_at).toLocaleDateString()}</span>
                </div>
              </div>

              {claim.status === 'approved' && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(34,197,94,0.1)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#10b981',
                }}>
                  ✓ Approved on {new Date(claim.approved_at).toLocaleDateString()} • Payout sent {new Date(claim.payout_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
