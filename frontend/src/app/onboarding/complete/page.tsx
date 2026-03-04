'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CREATOR ONBOARDING: COMPLETION
 * Success page with next steps
 */

export default function OnboardingCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/profile');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f, #1a0a2e)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        {/* Animated Success Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          animation: 'bounce 0.6s ease-in-out',
        }}>
          🎉
        </div>

        {/* Progress Bar - Complete */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 4 of 4: Complete</p>
        </div>

        {/* Main Content */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Welcome to Valueskins!</h1>
        <p style={{ fontSize: '1.1rem', color: '#a1a1aa', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your profile is set up and ready to go. Brands are already looking for creators like you.
        </p>

        {/* Next Steps */}
        <div style={{
          background: 'rgba(139,92,246,0.1)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🚀 Next Steps:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#8b5cf6', minWidth: '24px' }}>1️⃣</div>
              <div>
                <div style={{ fontWeight: 600 }}>Check your "Brands Want You" feed</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>AI-matched opportunities are waiting</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#8b5cf6', minWidth: '24px' }}>2️⃣</div>
              <div>
                <div style={{ fontWeight: 600 }}>Complete your profile details</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Media kit, rates, and verification boost visibility</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#8b5cf6', minWidth: '24px' }}>3️⃣</div>
              <div>
                <div style={{ fontWeight: 600 }}>Set your advance preferences</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Choose whether you need payment advances on deals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>✨ What You Can Do:</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
          }}>
            {[
              { icon: '📊', label: 'Track analytics' },
              { icon: '💳', label: 'Draw advances' },
              { icon: '📜', label: 'Build reputation' },
              { icon: '🎯', label: 'Find deals' },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                <div style={{ fontSize: '0.85rem' }}>{feature.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/profile')}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Go to Profile
          </button>
          <button
            onClick={() => router.push('/suggestions')}
            style={{
              padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Browse Deals
          </button>
        </div>

        {/* Auto-redirect notice */}
        <p style={{ marginTop: '2rem', color: '#71717a', fontSize: '0.85rem' }}>
          Redirecting to your profile in 5 seconds...
        </p>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    </div>
  );
}
