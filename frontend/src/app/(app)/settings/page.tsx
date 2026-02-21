'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS, Platform } from '@/lib/professions';

export default function SettingsPage() {
  const { activePlatform, setPlatform } = usePlatform();
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  return (
    <PlatformLayout title="Settings">
      <div style={{ padding: '0' }}>
        {/* Account Section */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={{
            padding: '16px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ig-text-tertiary)',
            letterSpacing: 0.5,
          }}>
            Account
          </div>
          <SettingsRow
            label="Email"
            value="creator@example.com"
            onClick={() => { }}
          />
          <SettingsRow
            label="Profession"
            value="Tech Creator"
            onClick={() => { }}
          />
        </div>

        {/* Platform Settings Section */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={{
            padding: '16px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ig-text-tertiary)',
            letterSpacing: 0.5,
          }}>
            Creator Platform
          </div>

          {/* Current Platform */}
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--ig-separator)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                Current Platform
              </div>
              <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)' }}>
                {PLATFORM_CONFIGS[activePlatform].name}
              </div>
            </div>
            <button
              onClick={() => setShowPlatformSelector(!showPlatformSelector)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Switch
            </button>
          </div>

          {/* Platform Selector (Expandable) */}
          {showPlatformSelector && (
            <div style={{ padding: '12px 16px', background: 'var(--ig-elevated)' }}>
              {(['meta', 'linkedin', 'youtube', 'across'] as Platform[]).map(platformId => {
                const config = PLATFORM_CONFIGS[platformId];
                const isActive = activePlatform === platformId;
                return (
                  <button
                    key={platformId}
                    onClick={() => {
                      setPlatform(platformId);
                      setShowPlatformSelector(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px',
                      background: isActive ? 'var(--ig-card)' : 'transparent',
                      border: isActive ? '1px solid #8b5cf6' : '1px solid transparent',
                      borderRadius: 8,
                      textAlign: 'left',
                      marginBottom: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{config.logoEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ig-text-primary)' }}>
                        {config.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>
                        {config.description}
                      </div>
                    </div>
                    {isActive && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <SettingsRow
            label="Active Stickers"
            value="3 owned"
            onClick={() => { }}
          />
          <SettingsRow
            label="Marketplace Access"
            value="Enabled"
            onClick={() => { }}
          />
        </div>

        {/* Notifications Section */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={{
            padding: '16px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ig-text-tertiary)',
            letterSpacing: 0.5,
          }}>
            Notifications
          </div>
          <ToggleSetting label="New Matches" enabled={true} />
          <ToggleSetting label="Brand Messages" enabled={true} />
          <ToggleSetting label="Marketing" enabled={false} />
        </div>

        {/* Information Section */}
        <div>
          <div style={{
            padding: '16px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ig-text-tertiary)',
            letterSpacing: 0.5,
          }}>
            Information
          </div>
          <SettingsRow
            label="About Valueskins"
            value="Learn more"
            onClick={() => { }}
          />
          <SettingsRow
            label="Privacy Policy"
            value="View"
            onClick={() => { }}
          />
          <SettingsRow
            label="Terms of Service"
            value="View"
            onClick={() => { }}
          />
          <div style={{
            padding: '16px',
            textAlign: 'center',
            borderTop: '1px solid var(--ig-separator)',
            marginTop: 12,
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--ig-separator)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--ig-elevated)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'none';
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ig-text-primary)' }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ig-text-tertiary)' }}>
        {value}
      </div>
    </button>
  );
}

function ToggleSetting({ label, enabled }: { label: string; enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: '1px solid var(--ig-separator)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        {label}
      </div>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          background: isEnabled ? '#8b5cf6' : 'var(--ig-separator)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <div style={{
          position: 'absolute',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#fff',
          top: 2,
          left: isEnabled ? 22 : 2,
          transition: 'left 0.2s ease',
        }} />
      </button>
    </div>
  );
}
