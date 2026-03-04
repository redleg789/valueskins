'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CREATOR ONBOARDING: STEP 3 — VALUESKIN SELECTION
 * Connect Instagram and select or create ValuSkin for creator brand identity
 */

export default function OnboardingValuSkinPage() {
  const router = useRouter();
  const [step, setStep] = useState<'connect' | 'select' | 'success'>('connect');
  const [igProfile, setIgProfile] = useState<any>(null);
  const [selectedValueskin, setSelectedValueskin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableValueskins = [
    { id: 'tech-reviewer', name: '🔧 Tech Reviewer', description: 'Product reviews, tech tutorials, unboxing' },
    { id: 'lifestyle-influencer', name: '🌟 Lifestyle Influencer', description: 'Fashion, beauty, wellness content' },
    { id: 'fitness-coach', name: '💪 Fitness Coach', description: 'Workouts, nutrition, fitness education' },
    { id: 'content-creator', name: '🎬 Content Creator', description: 'General content, vlogs, entertainment' },
    { id: 'educator', name: '📚 Educator', description: 'Tutorials, courses, educational content' },
    { id: 'brand-ambassador', name: '🎯 Brand Ambassador', description: 'Exclusive brand partnerships' },
  ];

  const handleConnectInstagram = async () => {
    setLoading(true);
    try {
      // OAuth flow will be implemented
      // For MVP, simulate Instagram connection
      localStorage.setItem('onboarding_ig_connected', 'true');
      setIgProfile({
        username: 'example_creator',
        followers: 125000,
        engagement_rate: 4.2,
      });
      setStep('select');
    } catch (err: any) {
      setError(err.message || 'Instagram connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectValueskin = async () => {
    if (!selectedValueskin) {
      setError('Please select a ValuSkin');
      return;
    }

    setLoading(true);
    try {
      // API call will be added
      // const res = await api.valueskin.select(selectedValueskin);

      localStorage.setItem('onboarding_valueskin', selectedValueskin);
      setStep('success');
      setTimeout(() => {
        router.push('/onboarding/complete');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Selection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 3 of 4: Connect & Select ValuSkin</p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎨 Choose your creator type</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Your ValuSkin determines what brands see when matching with you. Pick the category that best describes your content.</p>
        </div>

        {step === 'connect' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Instagram Connection Box */}
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(219,40,40,0.1), rgba(139,92,246,0.1))',
              border: '2px solid rgba(219,40,40,0.2)',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Connect Instagram</h2>
              <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Link your Instagram account to sync follower count and engagement metrics
              </p>
              <button
                onClick={handleConnectInstagram}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #dd2828, #dd2828)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                {loading ? '⏳ Connecting...' : '📲 Connect with Instagram'}
              </button>
              {error && (
                <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>
              )}
            </div>

            {/* Manual Option */}
            <button
              onClick={() => setStep('select')}
              style={{
                padding: '1rem',
                background: 'transparent',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Skip for now (continue without Instagram)
            </button>
          </div>
        )}

        {step === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {igProfile && (
              <div style={{
                padding: '1rem',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                ✓ Connected: @{igProfile.username} • {igProfile.followers.toLocaleString()} followers
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {availableValueskins.map(vs => (
                <button
                  key={vs.id}
                  onClick={() => setSelectedValueskin(vs.id)}
                  style={{
                    padding: '1.5rem',
                    background: selectedValueskin === vs.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedValueskin === vs.id ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    if (selectedValueskin !== vs.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedValueskin !== vs.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{vs.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{vs.description}</div>
                  {selectedValueskin === vs.id && (
                    <div style={{ marginTop: '0.5rem', color: '#8b5cf6', fontWeight: 600 }}>✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ padding: '1rem', background: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSelectValueskin}
              disabled={!selectedValueskin || loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedValueskin ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                cursor: selectedValueskin ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                marginTop: '1rem',
                opacity: selectedValueskin ? 1 : 0.5,
              }}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>ValuSkin Selected!</h2>
            <p style={{ color: '#a1a1aa' }}>Redirecting to completion...</p>
          </div>
        )}
      </div>
    </div>
  );
}
