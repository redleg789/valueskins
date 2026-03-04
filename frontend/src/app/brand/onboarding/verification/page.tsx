'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * BRAND ONBOARDING: STEP 2 — COMPANY VERIFICATION
 * Verify company legitimacy and ownership
 */

export default function BrandOnboardingVerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'method' | 'upload' | 'complete'>('method');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError('File must be less than 25MB');
        return;
      }
      setDocumentFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!documentFile) {
      setError('Please upload a company document');
      return;
    }

    setLoading(true);
    try {
      // API call will be added
      localStorage.setItem('onboarding_brand_verification_submitted', 'true');
      setStep('complete');
      setTimeout(() => {
        router.push('/brand/onboarding/settings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const verificationMethods = [
    {
      id: 'business_license',
      title: '📄 Business License',
      description: 'Official business registration or incorporation documents',
    },
    {
      id: 'tax_id',
      title: '🏛️ Tax ID Document',
      description: 'EIN registration or tax certificate',
    },
    {
      id: 'domain_verify',
      title: '🌐 Domain Verification',
      description: 'Upload a text file to your domain root',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 2 of 3: Verification</p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>✓ Verify your company</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Creators trust verified brands. This helps us ensure legitimate partnerships.</p>
        </div>

        {step === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {verificationMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setStep('upload')}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{method.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.25rem' }}>{method.description}</div>
                </div>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </button>
            ))}
          </div>
        )}

        {step === 'upload' && (
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div style={{ padding: '1rem', background: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {/* Document Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                📎 Upload Document
              </label>
              <label style={{
                display: 'block',
                padding: '2rem',
                background: 'rgba(59,130,246,0.1)',
                border: '2px dashed rgba(59,130,246,0.5)',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {documentFile ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                    <div style={{ fontWeight: 600 }}>{documentFile.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📄</div>
                    <div style={{ fontWeight: 600 }}>Click to upload</div>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>or drag and drop</div>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleDocumentUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Privacy Note */}
            <div style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#a1a1aa',
              lineHeight: 1.6,
            }}>
              ✓ Your documents are encrypted and only viewed by verification team<br/>
              ✓ We comply with data privacy regulations<br/>
              ✓ Documents deleted after verification completes
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!documentFile || loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: documentFile ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                cursor: documentFile ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                opacity: documentFile ? 1 : 0.5,
              }}
            >
              {loading ? 'Verifying...' : 'Submit for Verification'}
            </button>

            <button
              type="button"
              onClick={() => setStep('method')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </form>
        )}

        {step === 'complete' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Submitted!</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
              Your company verification is being reviewed. You'll hear back within 24 hours.
            </p>
            <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Redirecting to settings...</p>
          </div>
        )}
      </div>
    </div>
  );
}
