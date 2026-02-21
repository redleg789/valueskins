'use client';

import { useState } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS } from '@/lib/professions';
import {
  MOCK_CREATOR_VERIFICATION,
  VERIFICATION_BADGES,
  VerificationLevel,
  LinkedAccount,
  getNextVerificationStep,
  getTotalTrustScore,
} from '@/lib/verification';

/*
 * PATENT-RELEVANT: Multi-Factor Creator Verification with Trust Scoring
 * ──────────────────────────────────────────────────────────────────────────
 * This page shows creators their verification status and trust score.
 * Higher verification = higher trust = better deal opportunities.
 */

export default function VerificationPage() {
  const { activePlatform } = usePlatform();
  const [showLinkModal, setShowLinkModal] = useState(false);

  const platformConfig = PLATFORM_CONFIGS[activePlatform];
  const accentColor = platformConfig.primaryColor;

  const verification = MOCK_CREATOR_VERIFICATION;
  const currentBadge = VERIFICATION_BADGES[verification.verificationLevel];
  const nextStep = getNextVerificationStep(verification);
  const trustScore = getTotalTrustScore(verification.trustScoreBreakdown);

  return (
    <PlatformLayout title="Verification">
      <div style={{ padding: '0' }}>
        {/* Trust Score Header */}
        <div style={{
          padding: '24px 16px',
          background: `linear-gradient(135deg, ${currentBadge.color}20, transparent)`,
          borderBottom: '1px solid var(--ig-separator)',
          textAlign: 'center',
        }}>
          {/* Trust Score Circle */}
          <div style={{
            width: 100,
            height: 100,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: `conic-gradient(${currentBadge.color} ${trustScore * 3.6}deg, var(--ig-separator) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'var(--ig-bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{trustScore}</div>
              <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Trust Score</div>
            </div>
          </div>

          {/* Current Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: currentBadge.bgColor,
            borderRadius: 20,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 18 }}>{currentBadge.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: currentBadge.color }}>
              {currentBadge.name}
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--ig-text-secondary)' }}>
            {currentBadge.description}
          </p>
        </div>

        {/* Trust Score Breakdown */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Trust Score Breakdown</div>
          <div style={{
            background: 'var(--ig-card)',
            borderRadius: 12,
            padding: '14px',
            border: '1px solid var(--ig-separator)',
          }}>
            <ScoreBar
              label="Verification Level"
              value={verification.trustScoreBreakdown.verificationScore}
              max={25}
              color={currentBadge.color}
            />
            <ScoreBar
              label="Deal Completion"
              value={verification.trustScoreBreakdown.completionScore}
              max={25}
              color="#0095f6"
            />
            <ScoreBar
              label="Average Rating"
              value={verification.trustScoreBreakdown.ratingScore}
              max={25}
              color="#f59e0b"
            />
            <ScoreBar
              label="Authenticity"
              value={verification.trustScoreBreakdown.authenticityScore}
              max={25}
              color="#10b981"
              isLast
            />
          </div>
        </div>

        {/* Verification Steps */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Verification Progress</div>

          {([1, 2, 3, 4, 5] as VerificationLevel[]).map((level) => {
            const badge = VERIFICATION_BADGES[level];
            const isComplete = verification.verificationLevel >= level;
            const isCurrent = verification.verificationLevel === level - 1;

            return (
              <div
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '14px',
                  background: isComplete ? `${badge.color}10` : isCurrent ? 'var(--ig-card)' : 'transparent',
                  borderRadius: 10,
                  marginBottom: 8,
                  border: isCurrent ? `1px solid ${badge.color}` : '1px solid transparent',
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isComplete ? badge.color : 'var(--ig-separator)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isComplete ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 14, color: 'var(--ig-text-tertiary)' }}>{badge.icon}</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isComplete ? badge.color : 'var(--ig-text-primary)',
                    }}>
                      {badge.name}
                    </div>
                    {isComplete && (
                      <span style={{
                        fontSize: 10,
                        color: badge.color,
                        background: `${badge.color}20`,
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontWeight: 600,
                      }}>
                        Complete
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>
                    {badge.description}
                  </div>

                  {isCurrent && nextStep && (
                    <button
                      onClick={() => {
                        if (level === 2) setShowLinkModal(true);
                      }}
                      style={{
                        marginTop: 10,
                        padding: '8px 16px',
                        background: badge.color,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {nextStep.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Linked Accounts */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Linked Accounts</div>
            <button
              onClick={() => setShowLinkModal(true)}
              style={{
                padding: '6px 12px',
                background: accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add
            </button>
          </div>

          <div style={{
            background: 'var(--ig-card)',
            borderRadius: 12,
            border: '1px solid var(--ig-separator)',
            overflow: 'hidden',
          }}>
            {verification.linkedAccounts.map((account, i) => (
              <LinkedAccountRow
                key={account.id}
                account={account}
                isLast={i === verification.linkedAccounts.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Fraud Alerts */}
        {verification.fraudFlags.length > 0 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#ef4444' }}>
              ⚠️ Account Alerts
            </div>
            {verification.fraudFlags.map(flag => (
              <div
                key={flag.id}
                style={{
                  padding: '12px',
                  background: '#ef444415',
                  borderRadius: 10,
                  marginBottom: 8,
                  border: '1px solid #ef444430',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
                  {flag.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ig-text-secondary)', marginTop: 4 }}>
                  {flag.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your Track Record</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <StatCard
              label="Completed Deals"
              value={String(verification.completedDeals)}
              color="#10b981"
            />
            <StatCard
              label="Avg Rating"
              value={verification.averageRating.toFixed(1)}
              suffix="⭐"
              color="#f59e0b"
            />
            <StatCard
              label="Total Earnings"
              value={`$${(verification.totalEarnings / 100).toLocaleString()}`}
              color={accentColor}
            />
            <StatCard
              label="Disputes"
              value={String(verification.disputeCount)}
              color={verification.disputeCount === 0 ? '#10b981' : '#ef4444'}
            />
          </div>
        </div>

        {/* Link Account Modal */}
        {showLinkModal && (
          <LinkAccountModal
            onClose={() => setShowLinkModal(false)}
            accentColor={accentColor}
          />
        )}
      </div>
    </PlatformLayout>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
  isLast,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  isLast?: boolean;
}) {
  const percent = Math.round((value / max) * 100);

  return (
    <div style={{ marginBottom: isLast ? 0 : 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--ig-text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}/{max}</span>
      </div>
      <div style={{
        height: 6,
        background: 'var(--ig-separator)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
    </div>
  );
}

function LinkedAccountRow({ account, isLast }: { account: LinkedAccount; isLast: boolean }) {
  const platformEmojis: Record<string, string> = {
    meta: '📸',
    youtube: '📹',
    linkedin: '💼',
    tiktok: '🎵',
    twitter: '🐦',
    twitch: '🎮',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px',
      borderBottom: isLast ? 'none' : '1px solid var(--ig-separator)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--ig-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      }}>
        {platformEmojis[account.platform] || '🔗'}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>@{account.username}</span>
          {account.isVerified && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0095f6">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          {account.followerCount >= 1000000
            ? `${(account.followerCount / 1000000).toFixed(1)}M`
            : account.followerCount >= 1000
              ? `${(account.followerCount / 1000).toFixed(0)}K`
              : account.followerCount}
        </div>
        <div style={{ fontSize: 11, color: '#10b981' }}>
          {account.engagementRate.toFixed(1)}% eng
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix?: string;
  color: string;
}) {
  return (
    <div style={{
      padding: '14px',
      background: 'var(--ig-card)',
      borderRadius: 10,
      border: '1px solid var(--ig-separator)',
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>
        {value}{suffix && <span style={{ fontSize: 14 }}> {suffix}</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function LinkAccountModal({
  onClose,
  accentColor,
}: {
  onClose: () => void;
  accentColor: string;
}) {
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C' },
    { id: 'youtube', name: 'YouTube', icon: '📹', color: '#FF0000' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
    { id: 'twitch', name: 'Twitch', icon: '🎮', color: '#9146FF' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        background: 'var(--ig-bg)',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--ig-separator)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Link Account</div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--ig-separator)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          <p style={{
            fontSize: 13,
            color: 'var(--ig-text-secondary)',
            marginBottom: 16,
            lineHeight: 1.5,
          }}>
            Connect your social accounts to verify your audience and unlock more opportunities.
            We only read public profile data.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => {
                  // Handle OAuth flow
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px',
                  background: 'var(--ig-card)',
                  border: '1px solid var(--ig-separator)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${platform.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {platform.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{platform.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                    Connect with OAuth
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ig-text-tertiary)" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>

          <p style={{
            fontSize: 11,
            color: 'var(--ig-text-tertiary)',
            textAlign: 'center',
            marginTop: 16,
          }}>
            By connecting, you agree to share your public profile metrics with Valueskins.
          </p>
        </div>
      </div>
    </div>
  );
}
