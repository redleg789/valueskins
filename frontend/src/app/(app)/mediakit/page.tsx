'use client';

import { useState } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS } from '@/lib/professions';
import {
  MOCK_MEDIA_KIT,
  MEDIA_KIT_TEMPLATES,
  MediaKit,
  formatPrice,
} from '@/lib/mediakit';
import {
  MOCK_AGGREGATED_PROFILE,
  formatFollowers,
  getPlatformIcon,
  getPlatformColor,
} from '@/lib/aggregation';

/*
 * PATENT-RELEVANT: Auto-Generated Professional Media Kit
 * ──────────────────────────────────────────────────────────────────────────
 * This page displays the creator's auto-generated media kit with:
 * - Live metrics pulled from connected platforms
 * - Professional templates
 * - Shareable public URL
 * - PDF download
 */

type Tab = 'preview' | 'analytics' | 'settings';

export default function MediaKitPage() {
  const { activePlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [showShareModal, setShowShareModal] = useState(false);

  const platformConfig = PLATFORM_CONFIGS[activePlatform];
  const accentColor = platformConfig.primaryColor;

  const mediaKit = MOCK_MEDIA_KIT;
  const profile = MOCK_AGGREGATED_PROFILE;

  return (
    <PlatformLayout title="Media Kit">
      <div style={{ padding: '0' }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          background: `linear-gradient(135deg, ${mediaKit.brandColors.primary}20, ${mediaKit.brandColors.secondary}10)`,
          borderBottom: '1px solid var(--ig-separator)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${mediaKit.brandColors.primary}, ${mediaKit.brandColors.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#fff',
              fontWeight: 700,
            }}>
              {mediaKit.creatorName.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{mediaKit.creatorName}</div>
              <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                {mediaKit.tagline}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            <QuickStat
              label="Followers"
              value={formatFollowers(mediaKit.totalFollowers)}
              color={accentColor}
            />
            <QuickStat
              label="Eng. Rate"
              value={`${mediaKit.avgEngagementRate.toFixed(1)}%`}
              color="#10b981"
            />
            <QuickStat
              label="Views"
              value={mediaKit.views.toString()}
              color="#f59e0b"
            />
            <QuickStat
              label="Downloads"
              value={mediaKit.downloads.toString()}
              color="#8b5cf6"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                flex: 1,
                padding: '12px',
                background: accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Share Media Kit
            </button>
            <button style={{
              padding: '12px 16px',
              background: 'var(--ig-card)',
              color: 'var(--ig-text-primary)',
              border: '1px solid var(--ig-separator)',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              📄 PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--ig-separator)',
        }}>
          {(['preview', 'analytics', 'settings'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--ig-text-primary)' : 'var(--ig-text-tertiary)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '16px' }}>
          {activeTab === 'preview' && (
            <PreviewTab mediaKit={mediaKit} profile={profile} accentColor={accentColor} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab mediaKit={mediaKit} accentColor={accentColor} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab mediaKit={mediaKit} accentColor={accentColor} />
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <ShareModal
            mediaKit={mediaKit}
            accentColor={accentColor}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </PlatformLayout>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1,
      padding: '10px 8px',
      background: 'var(--ig-card)',
      borderRadius: 8,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function PreviewTab({
  mediaKit,
  profile,
  accentColor,
}: {
  mediaKit: MediaKit;
  profile: typeof MOCK_AGGREGATED_PROFILE;
  accentColor: string;
}) {
  return (
    <div>
      {/* Bio Section */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>About</div>
        <p style={{
          fontSize: 13,
          color: 'var(--ig-text-secondary)',
          lineHeight: 1.6,
          marginBottom: 12,
        }}>
          {mediaKit.bio}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {mediaKit.specialties.map(s => (
            <span
              key={s}
              style={{
                padding: '4px 10px',
                background: `${accentColor}15`,
                color: accentColor,
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Platforms</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mediaKit.platforms.map(p => (
            <div
              key={p.platform}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px',
                background: 'var(--ig-elevated)',
                borderRadius: 10,
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${getPlatformColor(p.platform)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                {getPlatformIcon(p.platform)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>@{p.username}</div>
                <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>
                  {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{formatFollowers(p.followers)}</div>
                <div style={{ fontSize: 11, color: '#10b981' }}>{p.engagementRate}% eng</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Demographics */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Audience</div>

        {/* Age Distribution */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 8 }}>Age Distribution</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {mediaKit.audienceDemo.ageRanges.map(age => (
              <div
                key={age.range}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px 0',
                  background: 'var(--ig-elevated)',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700 }}>{age.percentage}%</div>
                <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>{age.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Split */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 8 }}>Gender Split</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GenderBar label="Male" value={mediaKit.audienceDemo.genderSplit.male} color="#0095f6" />
            <GenderBar label="Female" value={mediaKit.audienceDemo.genderSplit.female} color="#ec4899" />
          </div>
        </div>

        {/* Top Locations */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 8 }}>Top Locations</div>
          {mediaKit.audienceDemo.topLocations.slice(0, 3).map(loc => (
            <div
              key={loc.location}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--ig-separator)',
              }}
            >
              <span style={{ fontSize: 13 }}>{loc.location}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{loc.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rates */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Rates</div>
        {mediaKit.rates.slice(0, 4).map((rate, i) => (
          <div
            key={rate.type}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < 3 ? '1px solid var(--ig-separator)' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{rate.type}</div>
              <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>
                {getPlatformIcon(rate.platform)} {rate.description}
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>
              {formatPrice(rate.price)}
            </div>
          </div>
        ))}
      </div>

      {/* Collaborations */}
      {mediaKit.collaborations.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'var(--ig-card)',
          borderRadius: 12,
          border: '1px solid var(--ig-separator)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Past Collaborations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {mediaKit.collaborations.map(collab => (
              <div
                key={collab.brandName}
                style={{
                  padding: '10px 14px',
                  background: 'var(--ig-elevated)',
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>{collab.brandName}</div>
                <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>{collab.campaignType}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonial */}
      {mediaKit.testimonials.length > 0 && (
        <div style={{
          padding: '16px',
          background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
          borderRadius: 12,
          border: `1px solid ${accentColor}30`,
        }}>
          <div style={{ fontSize: 24, color: accentColor, marginBottom: 8 }}>"</div>
          <p style={{
            fontSize: 14,
            color: 'var(--ig-text-secondary)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            marginBottom: 12,
          }}>
            {mediaKit.testimonials[0].quote}
          </p>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            — {mediaKit.testimonials[0].contactName}, {mediaKit.testimonials[0].contactTitle}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>
            {mediaKit.testimonials[0].brandName}
          </div>
        </div>
      )}
    </div>
  );
}

function GenderBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{
        height: 6,
        background: 'var(--ig-separator)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: 3,
        }} />
      </div>
    </div>
  );
}

function AnalyticsTab({ mediaKit, accentColor }: { mediaKit: MediaKit; accentColor: string }) {
  return (
    <div>
      <div style={{
        padding: '20px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Media Kit Analytics</div>
        <p style={{ fontSize: 13, color: 'var(--ig-text-tertiary)' }}>
          Track who's viewing and downloading your media kit
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Total Views" value={mediaKit.views.toString()} trend="+12%" color={accentColor} />
        <StatCard label="Downloads" value={mediaKit.downloads.toString()} trend="+8%" color="#10b981" />
        <StatCard label="Avg. Time" value="2m 34s" trend="+5%" color="#f59e0b" />
        <StatCard label="Click Rate" value="24%" trend="+3%" color="#8b5cf6" />
      </div>

      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent Viewers</div>
        <p style={{ fontSize: 13, color: 'var(--ig-text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
          Viewer tracking coming soon
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <div style={{
      padding: '14px',
      background: 'var(--ig-card)',
      borderRadius: 10,
      border: '1px solid var(--ig-separator)',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>{label}</span>
        <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>{trend}</span>
      </div>
    </div>
  );
}

function SettingsTab({ mediaKit, accentColor }: { mediaKit: MediaKit; accentColor: string }) {
  const [isPublic, setIsPublic] = useState(mediaKit.isPublic);
  const [showRates, setShowRates] = useState(mediaKit.showRates);

  return (
    <div>
      {/* Public URL */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Public URL</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          background: 'var(--ig-elevated)',
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 13, color: 'var(--ig-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            valueskins.com/creators/{mediaKit.customSlug}
          </span>
          <button style={{
            padding: '6px 12px',
            background: accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Copy
          </button>
        </div>
      </div>

      {/* Visibility Settings */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Visibility</div>

        <ToggleSetting
          label="Public Profile"
          description="Anyone with the link can view your media kit"
          enabled={isPublic}
          onToggle={() => setIsPublic(!isPublic)}
          accentColor={accentColor}
        />

        <ToggleSetting
          label="Show Rates"
          description="Display your rates to viewers"
          enabled={showRates}
          onToggle={() => setShowRates(!showRates)}
          accentColor={accentColor}
        />
      </div>

      {/* Template Selection */}
      <div style={{
        padding: '16px',
        background: 'var(--ig-card)',
        borderRadius: 12,
        border: '1px solid var(--ig-separator)',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Template</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {MEDIA_KIT_TEMPLATES.slice(0, 2).map(template => (
            <div
              key={template.id}
              style={{
                padding: '12px',
                background: 'var(--ig-elevated)',
                borderRadius: 10,
                border: template.id === 'modern-dark' ? `2px solid ${accentColor}` : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{template.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>{template.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <button style={{
        width: '100%',
        padding: '12px',
        background: 'transparent',
        color: '#ef4444',
        border: '1px solid #ef4444',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        Reset Media Kit
      </button>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
  onToggle,
  accentColor,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid var(--ig-separator)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>{description}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: enabled ? accentColor : 'var(--ig-separator)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          left: enabled ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

function ShareModal({
  mediaKit,
  accentColor,
  onClose,
}: {
  mediaKit: MediaKit;
  accentColor: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(mediaKit.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--ig-bg)',
        borderRadius: 16,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--ig-separator)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Share Media Kit</div>
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

        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px',
            background: 'var(--ig-card)',
            borderRadius: 10,
            marginBottom: 16,
          }}>
            <input
              type="text"
              value={mediaKit.publicUrl}
              readOnly
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                fontSize: 13,
                color: 'var(--ig-text-secondary)',
                outline: 'none',
              }}
            />
            <button
              onClick={copyLink}
              style={{
                padding: '8px 16px',
                background: copied ? '#10b981' : accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {['Twitter', 'LinkedIn', 'Email'].map(platform => (
              <button
                key={platform}
                style={{
                  padding: '12px 20px',
                  background: 'var(--ig-card)',
                  border: '1px solid var(--ig-separator)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--ig-text-primary)',
                  cursor: 'pointer',
                }}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
