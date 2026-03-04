'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CREATOR ONBOARDING: STEP 2 — IDENTITY VERIFICATION
 * Government-issued ID + selfie verification for KYC
 */

export default function OnboardingIdentityPage() {
  const router = useRouter();
  const [step, setStep] = useState<'method' | 'upload' | 'verified'>('method');
  const [idType, setIdType] = useState<'passport' | 'license' | 'id_card' | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be less than 10MB');
        return;
      }
      setIdFile(file);
      setError(null);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be less than 5MB');
        return;
      }
      setSelfieFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!idType || !idFile || !selfieFile) {
      setError('Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      // API call will be added later
      // const res = await api.verification.submitIdentity({
      //   id_type: idType,
      //   id_file: idFile,
      //   selfie_file: selfieFile,
      // });

      localStorage.setItem('onboarding_identity_submitted', 'true');
      setStep('verified');
      setTimeout(() => {
        router.push('/onboarding/valueskin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  const idTypeOptions = [
    { value: 'passport' as const, label: '🛂 Passport', description: 'Most widely accepted' },
    { value: 'license' as const, label: "🪪 Driver's License", description: 'Accepted in most regions' },
    { value: 'id_card' as const, label: '🆔 National ID Card', description: 'Any government ID card' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 2 of 4: Identity Verification</p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🔐 Verify your identity</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>We need to confirm you are who you say you are. Your information is encrypted and kept confidential.</p>
        </div>

        {step === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {idTypeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setIdType(opt.value);
                  setStep('upload');
                }}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{ fontWeight: 600 }}>{opt.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{opt.description}</div>
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

            {/* ID Photo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                📄 {idType === 'passport' ? 'Passport' : idType === 'license' ? "Driver's License" : 'ID Card'}
              </label>
              <label style={{
                display: 'block',
                padding: '2rem',
                background: 'rgba(139,92,246,0.1)',
                border: '2px dashed rgba(139,92,246,0.5)',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {idFile ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                    <div style={{ fontWeight: 600 }}>{idFile.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</div>
                    <div style={{ fontWeight: 600 }}>Click to upload</div>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>or drag and drop</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Selfie */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                🤳 Selfie (for liveness verification)
              </label>
              <label style={{
                display: 'block',
                padding: '2rem',
                background: 'rgba(139,92,246,0.1)',
                border: '2px dashed rgba(139,92,246,0.5)',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {selfieFile ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                    <div style={{ fontWeight: 600 }}>{selfieFile.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷</div>
                    <div style={{ fontWeight: 600 }}>Click to upload</div>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>or drag and drop</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieUpload}
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
              ✓ Your documents are encrypted with end-to-end encryption<br/>
              ✓ Verified by AI and human review<br/>
              ✓ Not stored after verification completes<br/>
              ✓ Never shared with brands or other creators
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!idFile || !selfieFile || loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: (idFile && selfieFile) ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                cursor: (idFile && selfieFile) ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                opacity: (idFile && selfieFile) ? 1 : 0.5,
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

        {step === 'verified' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified!</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Your identity has been submitted for verification. Redirecting...</p>
            <div style={{
              width: '100px',
              height: '4px',
              background: 'rgba(139,92,246,0.2)',
              borderRadius: '2px',
              margin: '0 auto',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: '#8b5cf6',
                animation: 'slide 1.5s ease-in-out forwards',
              }} />
            </div>
            <style>{`@keyframes slide { from { width: 0; } to { width: 100%; } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
