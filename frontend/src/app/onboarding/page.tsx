'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS, Platform } from '@/lib/professions';

export default function OnboardingPage() {
  const { activePlatform, setPlatform } = usePlatform();
  const [selected, setSelected] = useState<Platform | null>(activePlatform);
  const [step, setStep] = useState<'platform' | 'profession'>('platform');

  const handlePlatformSelect = (platform: Platform) => {
    setSelected(platform);
  };

  const handleProceed = () => {
    if (selected) {
      setPlatform(selected);
      setStep('profession');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #050505 100%)',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.5s ease-out' }}>
        {step === 'platform' ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700 }}>
                Choose Your Platform
              </h1>
              <p style={{ fontSize: 14, color: '#a8a8a8' }}>
                Select which platform you want to grow your creator brand on.
              </p>
            </div>

            {/* Platform Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {(['meta', 'linkedin', 'youtube', 'across'] as Platform[]).map(platformId => {
                const config = PLATFORM_CONFIGS[platformId];
                const isSelected = selected === platformId;
                return (
                  <button
                    key={platformId}
                    onClick={() => handlePlatformSelect(platformId)}
                    style={{
                      padding: 20,
                      background: isSelected ? '#262626' : '#1a1a1a',
                      border: isSelected ? '2px solid #8b5cf6' : '1px solid #262626',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1f1f1f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 32 }}>{config.logoEmoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                          {config.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#737373' }}>
                          {config.description}
                        </div>
                      </div>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '2px solid ' + (isSelected ? config.primaryColor : '#363636'),
                        background: isSelected ? config.primaryColor : 'transparent',
                        transition: 'all 0.2s ease',
                      }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Box */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #262626',
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              fontSize: 12,
              color: '#a8a8a8',
              lineHeight: 1.6,
            }}>
              <strong style={{ display: 'block', marginBottom: 8, color: '#f5f5f5' }}>
                💡 Pro Tip:
              </strong>
              Across Brands mode lets you sell your creator persona simultaneously across Meta, LinkedIn, AND YouTube—perfect if you're a multi-platform creator.
            </div>

            {/* Button */}
            <button
              onClick={handleProceed}
              disabled={!selected}
              style={{
                width: '100%',
                padding: '12px 0',
                background: selected ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#262626',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                cursor: selected ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: selected ? 1 : 0.5,
              }}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            {/* Step 2: Profession Selection Hint */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700 }}>
                Almost there!
              </h1>
              <p style={{ fontSize: 14, color: '#a8a8a8' }}>
                You've selected <strong>{PLATFORM_CONFIGS[selected!].name}</strong>.
              </p>
              <p style={{ fontSize: 14, color: '#a8a8a8', marginTop: 8 }}>
                Next, you'll choose your profession. This lets the AI understand your niche and match you with the right brands.
              </p>
            </div>

            <div style={{
              background: '#1a1a1a',
              border: '1px solid #262626',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                45+ Professions Available
              </div>
              <div style={{ fontSize: 12, color: '#737373' }}>
                From SDE Level 1-3 to Criminal Law Attorney to Esports Pro. Fine-grained specificity = better AI matches.
              </div>
            </div>

            <Link href="/onboarding/profession" style={{ textDecoration: 'none', width: '100%' }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Choose Profession
              </button>
            </Link>

            <Link href="/feed" style={{ textDecoration: 'none', width: '100%', marginTop: 8 }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: 'transparent',
                  border: '1px solid #262626',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#f5f5f5',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Skip for now
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
