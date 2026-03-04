'use client';

import { useState } from 'react';

/**
 * GDPR DATA MANAGEMENT
 * Allow users to export their data or request account deletion
 */

export default function GDPRPage() {
  const [requestType, setRequestType] = useState<'none' | 'export' | 'deletion'>('none');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleExportData = async () => {
    setLoading(true);
    try {
      // API call
      await new Promise(r => setTimeout(r, 2000));
      setSuccessMessage('✓ Your data export is ready! Check your email for a download link.');
      setRequestType('none');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      alert('Please confirm deletion');
      return;
    }

    setLoading(true);
    try {
      // API call
      await new Promise(r => setTimeout(r, 2000));
      setSuccessMessage('✓ Your account deletion request has been submitted. You will receive confirmation via email.');
      setRequestType('none');
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🔐 Data & Privacy</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
            Manage your personal data under GDPR and privacy regulations
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '1rem',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            color: '#10b981',
            marginBottom: '2rem',
            fontSize: '0.95rem',
          }}>
            {successMessage}
          </div>
        )}

        {/* Info Box */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '12px',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}>
          <strong>🔒 Your Privacy Rights:</strong><br/>
          Under GDPR and similar regulations, you have the right to:
          <ul style={{ marginTop: '0.75rem', marginLeft: '1.5rem' }}>
            <li>✓ Access all your personal data</li>
            <li>✓ Export your data in portable format</li>
            <li>✓ Delete your account and associated data</li>
            <li>✓ Withdraw consent at any time</li>
          </ul>
        </div>

        {/* Request Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {/* Data Export */}
          <div style={{
            padding: '1.5rem',
            background: requestType === 'export' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
            border: requestType === 'export' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => setRequestType(requestType === 'export' ? 'none' : 'export')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📥 Export Your Data</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                  Download all your personal data in a portable format (JSON, CSV)
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#71717a' }}>
                  Includes: Profile, messages, deal history, ratings, payments
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>→</span>
            </div>

            {requestType === 'export' && (
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportData();
                  }}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? '⏳ Preparing export...' : '📥 Request Data Export'}
                </button>
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#a1a1aa' }}>
                  ✓ You'll receive an email with a secure download link within 24 hours
                </div>
              </div>
            )}
          </div>

          {/* Account Deletion */}
          <div style={{
            padding: '1.5rem',
            background: requestType === 'deletion' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.02)',
            border: requestType === 'deletion' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => setRequestType(requestType === 'deletion' ? 'none' : 'deletion')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>🗑️ Delete Account</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                  Permanently delete your account and all associated data
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#71717a' }}>
                  ⚠️ This action is irreversible. You will lose access to all deals and history.
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>→</span>
            </div>

            {requestType === 'deletion' && (
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  color: '#ef4444',
                }}>
                  ⚠️ <strong>Warning:</strong> Deleting your account will:
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    <li>✗ Remove all your profile information</li>
                    <li>✗ Cancel active deals (if any)</li>
                    <li>✗ Prevent you from logging in again</li>
                    <li>✗ Delete all messages and history</li>
                  </ul>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}>
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={e => setConfirmDelete(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>
                    I understand that this action is permanent and irreversible
                  </span>
                </label>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAccount();
                  }}
                  disabled={!confirmDelete || loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: confirmDelete ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: confirmDelete ? 'pointer' : 'not-allowed',
                    fontSize: '0.95rem',
                    opacity: confirmDelete ? 1 : 0.5,
                  }}
                >
                  {loading ? '⏳ Processing deletion...' : '🗑️ Permanently Delete Account'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Policy */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📋 Privacy Documentation</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a
              href="/privacy-policy"
              style={{
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                color: '#8b5cf6',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <span>Privacy Policy</span>
              <span>→</span>
            </a>
            <a
              href="/terms"
              style={{
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                color: '#8b5cf6',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <span>Terms of Service</span>
              <span>→</span>
            </a>
            <a
              href="/contact"
              style={{
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                color: '#8b5cf6',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <span>Contact Privacy Team</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
