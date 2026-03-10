'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS, Platform } from '@/lib/professions';
import { api } from '@/lib/api';

const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Portuguese', 'Arabic', 'Mandarin', 'German', 'Japanese', 'Korean'];
const CONTENT_FORMATS = ['Video', 'Photo', 'Text', 'Podcast', 'Live'];
const NICHES = ['Fashion', 'Beauty', 'Tech', 'Finance', 'Fitness', 'Food', 'Travel', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Entertainment', 'Health', 'Sports', 'Music', 'Art'];
const DEAL_TYPES = ['Paid', 'Gifted', 'Equity'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const TIMEZONES = ['UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+0 (GMT)', 'UTC+1 (CET)', 'UTC+3 (MSK)', 'UTC+5:30 (IST)', 'UTC+8 (CST)', 'UTC+9 (JST)', 'UTC+10 (AEST)'];
const AUDIENCE_AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

const sectionHeaderStyle = {
  padding: '16px',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  color: 'var(--ig-text-tertiary)',
  letterSpacing: 0.5,
};

const inputStyle = {
  width: '100%', padding: '8px 10px',
  background: 'var(--ig-elevated)',
  border: '1px solid var(--ig-separator)',
  borderRadius: '8px', color: 'var(--ig-text-primary)', fontSize: '13px',
  boxSizing: 'border-box' as const,
};

const labelStyle = { color: 'var(--ig-text-tertiary)', fontSize: '11px', marginBottom: '4px', display: 'block', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.4 };

function SectionRow({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ig-separator)' }}>{children}</div>;
}

function MultiChips({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 4 }}>
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onChange(active ? selected.filter(x => x !== o) : [...selected, o])}
            style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: active ? 'rgba(139,92,246,0.2)' : 'var(--ig-elevated)',
              border: active ? '1px solid rgba(139,92,246,0.5)' : '1px solid var(--ig-separator)',
              color: active ? '#c4b5fd' : 'var(--ig-text-secondary)',
            }}>{o}</button>
        );
      })}
    </div>
  );
}

function InlineToggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--ig-text-primary)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11, position: 'relative',
        background: value ? '#8b5cf6' : 'var(--ig-separator)', border: 'none', cursor: 'pointer', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { activePlatform, setPlatform } = usePlatform();
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Creator attributes state
  const [attrs, setAttrs] = useState({
    location_city: '', location_country: '', timezone: '', availability_hours: '',
    willing_to_relocate: false, willing_to_travel: false, willing_to_appear_at_events: false,
    age: '', gender: '', languages_spoken: [] as string[], content_language: '',
    content_niche: [] as string[], content_format: [] as string[], posting_frequency: '',
    audience_age_range: '', audience_location_primary: '', primary_platform: '',
    deal_type_preference: [] as string[], min_deal_size_usd: '', response_time_hours: '',
    exclusivity_available: false, willing_to_sign_nda: false, willing_to_sign_usage_rights: false,
    on_camera_willing: true, product_preference: '', content_rights_owned: true,
    // Advance preferences
    creator_requires_advance: false, creator_advance_pct_wanted: 30, creator_advance_negotiable: true,
  });

  const setA = <K extends keyof typeof attrs>(field: K, value: typeof attrs[K]) => setAttrs(prev => ({ ...prev, [field]: value }));

  // Backend-synced settings
  const [backendSettings, setBackendSettings] = useState({
    willing_to_barter: false,
    energy_state: 'available',
    price_band: 'mid-tier',
    auto_escalation: false,
    notifications_enabled: true,
    profile_visibility: 'public',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const saveDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from backend on mount
  useEffect(() => {
    async function load() {
      const res = await api.settings.getSettings();
      if (res.data) {
        setBackendSettings({
          willing_to_barter: res.data.willing_to_barter,
          energy_state: res.data.energy_state,
          price_band: res.data.price_band,
          auto_escalation: res.data.auto_escalation,
          notifications_enabled: res.data.notifications_enabled,
          profile_visibility: res.data.profile_visibility,
        });
        setSettingsLoaded(true);
      }
    }
    load();
  }, []);

  // Auto-save backend settings (debounced)
  const saveBackendSettings = useCallback((updated: typeof backendSettings) => {
    if (saveDebounce.current) clearTimeout(saveDebounce.current);
    saveDebounce.current = setTimeout(async () => {
      setSettingsSaving(true);
      await api.settings.updateSettings(updated);
      setSettingsSaving(false);
    }, 600);
  }, []);

  const setBS = <K extends keyof typeof backendSettings>(field: K, value: typeof backendSettings[K]) => {
    setBackendSettings(prev => {
      const next = { ...prev, [field]: value };
      saveBackendSettings(next);
      return next;
    });
  };

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  // Real-time matching score calculation based on current preferences
  // Formula from backend/matching_service/src/service.rs get_suggestions()
  const calculateMatchScore = () => {
    // Simulated creator level (would come from persona in production)
    const creatorLevel = 3;

    let score = 40; // base ValuSkin match

    // Level fit bonus: min(creator_level * 4, 20)
    score += Math.min(creatorLevel * 4, 20);

    // Price band overlap (assuming brand would offer 'mid-tier' by default)
    if (['mid-tier', 'premium'].includes(backendSettings.price_band)) {
      score += 15;
    }

    // Trust bonus (mock: 70 out of 100 = 7 bonus)
    const mockTrustScore = 70;
    score += Math.min(mockTrustScore / 10, 10);

    // Audit bonus (mock: 75 authenticity score = 7.5 bonus)
    const mockAuditScore = 75;
    score += Math.min(mockAuditScore / 10, 10);

    // Advance bonus: +5 if advance preferences match
    if (attrs.creator_requires_advance) {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const matchScore = calculateMatchScore();

  return (
    <PlatformLayout title="Settings">
      <div style={{ padding: 0 }}>

        {/* Account */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={sectionHeaderStyle}>Account</div>
          <SettingsRow label="Email" value="creator@example.com" onClick={() => {}} />
          <SettingsRow label="Profession" value="Tech Creator" onClick={() => {}} />
        </div>

        {/* Creator Profile — Location */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('location')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Location & Availability</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'location' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'location' && <>
            <SectionRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>City</label><input style={inputStyle} placeholder="New York" value={attrs.location_city} onChange={e => setA('location_city', e.target.value)} /></div>
                <div><label style={labelStyle}>Country</label><input style={inputStyle} placeholder="USA" value={attrs.location_country} onChange={e => setA('location_country', e.target.value)} /></div>
              </div>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Timezone</label>
              <select style={inputStyle} value={attrs.timezone} onChange={e => setA('timezone', e.target.value)}>
                <option value="">Select...</option>
                {TIMEZONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Availability Hours</label>
              <input style={inputStyle} placeholder="e.g. 9am–6pm EST" value={attrs.availability_hours} onChange={e => setA('availability_hours', e.target.value)} />
            </SectionRow>
            <SectionRow>
              <InlineToggle value={attrs.willing_to_relocate} onChange={v => setA('willing_to_relocate', v)} label="Willing to relocate for a project" />
              <InlineToggle value={attrs.willing_to_travel} onChange={v => setA('willing_to_travel', v)} label="Willing to travel" />
              <InlineToggle value={attrs.willing_to_appear_at_events} onChange={v => setA('willing_to_appear_at_events', v)} label="Available for live events / appearances" />
            </SectionRow>
          </>}
        </div>

        {/* Identity & Content */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('identity')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Identity & Content</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'identity' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'identity' && <>
            <SectionRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Age</label><input style={inputStyle} type="number" placeholder="25" value={attrs.age} onChange={e => setA('age', e.target.value)} /></div>
                <div><label style={labelStyle}>Gender</label>
                  <select style={inputStyle} value={attrs.gender} onChange={e => setA('gender', e.target.value)}>
                    <option value="">Select...</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Languages Spoken</label>
              <MultiChips options={LANGUAGES} selected={attrs.languages_spoken} onChange={v => setA('languages_spoken', v)} />
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Primary Content Language</label>
              <select style={inputStyle} value={attrs.content_language} onChange={e => setA('content_language', e.target.value)}>
                <option value="">Select...</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Content Niche</label>
              <MultiChips options={NICHES} selected={attrs.content_niche} onChange={v => setA('content_niche', v)} />
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Content Format</label>
              <MultiChips options={CONTENT_FORMATS} selected={attrs.content_format} onChange={v => setA('content_format', v)} />
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Posting Frequency</label>
              <input style={inputStyle} placeholder="e.g. 3x/week" value={attrs.posting_frequency} onChange={e => setA('posting_frequency', e.target.value)} />
            </SectionRow>
            <SectionRow>
              <InlineToggle value={attrs.on_camera_willing} onChange={v => setA('on_camera_willing', v)} label="Comfortable appearing on camera" />
              <InlineToggle value={attrs.content_rights_owned} onChange={v => setA('content_rights_owned', v)} label="I own all rights to my content" />
            </SectionRow>
          </>}
        </div>

        {/* Audience */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('audience')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Your Audience</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'audience' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'audience' && <>
            <SectionRow>
              <label style={labelStyle}>Audience Age Range</label>
              <select style={inputStyle} value={attrs.audience_age_range} onChange={e => setA('audience_age_range', e.target.value)}>
                <option value="">Select...</option>
                {AUDIENCE_AGE_RANGES.map(a => <option key={a}>{a}</option>)}
              </select>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Audience Primary Location</label>
              <input style={inputStyle} placeholder="USA" value={attrs.audience_location_primary} onChange={e => setA('audience_location_primary', e.target.value)} />
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Primary Platform</label>
              <input style={inputStyle} placeholder="Instagram" value={attrs.primary_platform} onChange={e => setA('primary_platform', e.target.value)} />
            </SectionRow>
          </>}
        </div>

        {/* Deal Preferences */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('deals')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Deal Preferences</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'deals' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'deals' && <>
            <SectionRow>
              <label style={labelStyle}>Deal Type Preference</label>
              <MultiChips options={DEAL_TYPES} selected={attrs.deal_type_preference} onChange={v => setA('deal_type_preference', v)} />
            </SectionRow>
            <SectionRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Min Deal Size (USD)</label><input style={inputStyle} type="number" placeholder="500" value={attrs.min_deal_size_usd} onChange={e => setA('min_deal_size_usd', e.target.value)} /></div>
                <div><label style={labelStyle}>Response Time (hrs)</label><input style={inputStyle} type="number" placeholder="24" value={attrs.response_time_hours} onChange={e => setA('response_time_hours', e.target.value)} /></div>
              </div>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Product Preference</label>
              <select style={inputStyle} value={attrs.product_preference} onChange={e => setA('product_preference', e.target.value)}>
                <option value="">Select...</option>
                {['Physical', 'Digital', 'Both'].map(p => <option key={p}>{p}</option>)}
              </select>
            </SectionRow>
            <SectionRow>
              <InlineToggle value={attrs.exclusivity_available} onChange={v => setA('exclusivity_available', v)} label="Open to brand exclusivity" />
              <InlineToggle value={attrs.willing_to_sign_nda} onChange={v => setA('willing_to_sign_nda', v)} label="Willing to sign NDA" />
              <InlineToggle value={attrs.willing_to_sign_usage_rights} onChange={v => setA('willing_to_sign_usage_rights', v)} label="Willing to grant usage rights" />
            </SectionRow>
          </>}
        </div>

        {/* Advance Preferences */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('advance')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💳 Advance Preferences</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'advance' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'advance' && <>
            {/* Real-time Matching Score */}
            <SectionRow>
              <div style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.05))`, padding: 14, borderRadius: 8, marginBottom: 12, border: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, color: 'var(--ig-text-tertiary)', marginBottom: 6, letterSpacing: 0.4 }}>
                  Your Match Score (Real-time)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {Math.round(matchScore)}%
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${matchScore}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginTop: 4 }}>
                      {matchScore < 50 ? 'Low compatibility' : matchScore < 70 ? 'Fair match' : matchScore < 85 ? 'Good match' : 'Excellent match'}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', lineHeight: '1.5' }}>
                  <div style={{ marginBottom: 4 }}>✓ Base ValuSkin match: +40</div>
                  <div style={{ marginBottom: 4 }}>✓ Creator level fit: +{Math.min(3 * 4, 20)}</div>
                  <div style={{ marginBottom: 4 }}>✓ Price band overlap ({backendSettings.price_band}): +{['mid-tier', 'premium'].includes(backendSettings.price_band) ? 15 : 0}</div>
                  <div style={{ marginBottom: 4 }}>✓ Trust & authenticity: +17</div>
                  <div>✓ Advance compatibility: +{attrs.creator_requires_advance ? 5 : 0}</div>
                </div>
              </div>
            </SectionRow>

            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                💡 Control whether you want advances on deals. Set your preference and non-negotiable terms. Your match score updates in real-time as you adjust these settings.
              </div>
              <InlineToggle value={attrs.creator_requires_advance} onChange={v => setA('creator_requires_advance', v)} label="I want/need advances on deals" />
            </SectionRow>
            {attrs.creator_requires_advance && <>
              <SectionRow>
                <label style={labelStyle}>Advance % (e.g. 30% upfront)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={attrs.creator_advance_pct_wanted}
                    onChange={e => setA('creator_advance_pct_wanted', parseInt(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <div style={{ fontSize: 16, fontWeight: 600, minWidth: 50, textAlign: 'center' }}>
                    {attrs.creator_advance_pct_wanted}%
                  </div>
                </div>
              </SectionRow>
              <SectionRow>
                <InlineToggle value={attrs.creator_advance_negotiable} onChange={v => setA('creator_advance_negotiable', v)} label="Open to negotiating on advance %" />
                {!attrs.creator_advance_negotiable && (
                  <div style={{ fontSize: 12, color: 'var(--ig-blue)', marginTop: 8 }}>
                    ✓ Advances are non-negotiable. Only matching brands will be suggested.
                  </div>
                )}
              </SectionRow>
            </>}
          </>}
        </div>

        {/* Platform Settings */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={sectionHeaderStyle}>Creator Platform</div>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ig-separator)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Current Platform</div>
              <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)' }}>{PLATFORM_CONFIGS[activePlatform].name}</div>
            </div>
            <button onClick={() => setShowPlatformSelector(!showPlatformSelector)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Switch</button>
          </div>
          {showPlatformSelector && (
            <div style={{ padding: '12px 16px', background: 'var(--ig-elevated)' }}>
              {(['meta', 'linkedin', 'youtube', 'across'] as Platform[]).map(platformId => {
                const config = PLATFORM_CONFIGS[platformId];
                const isActive = activePlatform === platformId;
                return (
                  <button key={platformId} onClick={() => { setPlatform(platformId); setShowPlatformSelector(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: isActive ? 'var(--ig-card)' : 'transparent', border: isActive ? '1px solid #8b5cf6' : '1px solid transparent', borderRadius: 8, textAlign: 'left', marginBottom: 8, cursor: 'pointer' }}>
                    <span style={{ fontSize: 20 }}>{config.logoEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ig-text-primary)' }}>{config.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 2 }}>{config.description}</div>
                    </div>
                    {isActive && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                );
              })}
            </div>
          )}
          <SettingsRow label="Active Stickers" value="3 owned" onClick={() => {}} />
          <SettingsRow label="Marketplace Access" value="Enabled" onClick={() => {}} />
        </div>

        {/* Insurance & Claims */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('insurance')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💼 Insurance & Claims</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'insurance' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'insurance' && <>
            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                ✓ All deals on Valueskins are backed by creator protection insurance. File claims for non-payment or disputes.
              </div>
            </SectionRow>
            <SettingsRow label="View Claims" value="1 filed" onClick={() => {}} />
            <SettingsRow label="File New Claim" value="Access form" onClick={() => {}} />
            <SectionRow>
              <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 8 }}>
                ✓ Non-payment claims processed within 48 hours<br/>
                ✓ Dispute mediation with evidence bundle export<br/>
                ✓ Full protection up to deal amount
              </div>
            </SectionRow>
          </>}
        </div>

        {/* Tax & Earnings */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('tax')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📊 Tax & Earnings</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'tax' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'tax' && <>
            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                Track earnings, view 1099-NEC, and manage deductions for tax filing.
              </div>
            </SectionRow>
            <SettingsRow label="Earnings Statement" value="2024 Year-to-date" onClick={() => {}} />
            <SettingsRow label="1099-NEC Documents" value="Download" onClick={() => {}} />
            <SettingsRow label="Deductions & Expenses" value="Manage" onClick={() => {}} />
            <SettingsRow label="Export for Accounting" value="CSV / PDF" onClick={() => {}} />
            <SectionRow>
              <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 8 }}>
                ✓ Automatic earnings tracking across all deals<br/>
                ✓ Deductible expenses tracking<br/>
                ✓ 1099-NEC issued by January 31st
              </div>
            </SectionRow>
          </>}
        </div>

        {/* Privacy & Data */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('privacy')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔐 Privacy & Data</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'privacy' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'privacy' && <>
            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                GDPR & privacy regulations: manage your data, request export, or delete your account.
              </div>
            </SectionRow>
            <SettingsRow label="Export Your Data" value="Request ZIP" onClick={() => {}} />
            <SettingsRow label="Data Download History" value="View" onClick={() => {}} />
            <SectionRow>
              <div style={{ marginTop: 12, padding: 12, background: '#ef4444' + '20', borderRadius: 8, border: '1px solid #ef4444' + '40' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>Danger Zone: Delete Account</div>
                <button style={{ width: '100%', background: '#ef4444', border: 'none', borderRadius: 6, padding: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  Permanently Delete My Account
                </button>
                <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 8 }}>
                  ⚠️ This is permanent. You will lose access to all deals and history.
                </div>
              </div>
            </SectionRow>
          </>}
        </div>

        {/* Synced Settings */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={{ ...sectionHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Synced Settings</span>
            {settingsSaving && <span style={{ fontSize: 10, color: 'var(--ig-text-tertiary)' }}>Saving...</span>}
            {settingsLoaded && !settingsSaving && <span style={{ fontSize: 10, color: '#22c55e' }}>Synced</span>}
          </div>
          <SectionRow>
            <InlineToggle value={backendSettings.willing_to_barter} onChange={v => setBS('willing_to_barter', v)} label="Open to barter deals" />
            <InlineToggle value={backendSettings.auto_escalation} onChange={v => setBS('auto_escalation', v)} label="Auto-escalate lowball offers" />
            <InlineToggle value={backendSettings.notifications_enabled} onChange={v => setBS('notifications_enabled', v)} label="Notifications enabled" />
          </SectionRow>
          <SectionRow>
            <label style={labelStyle}>Energy State</label>
            <select style={inputStyle} value={backendSettings.energy_state} onChange={e => setBS('energy_state', e.target.value)}>
              {['available', 'limited', 'burnout', 'pause'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </SectionRow>
          <SectionRow>
            <label style={labelStyle}>Price Band</label>
            <select style={inputStyle} value={backendSettings.price_band} onChange={e => setBS('price_band', e.target.value)}>
              {['experimental', 'mid-tier', 'premium', 'exclusive'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </SectionRow>
          <SectionRow>
            <label style={labelStyle}>Profile Visibility</label>
            <select style={inputStyle} value={backendSettings.profile_visibility} onChange={e => setBS('profile_visibility', e.target.value)}>
              {['public', 'private', 'connections_only'].map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </SectionRow>
        </div>

        {/* Information */}
        <div>
          <div style={sectionHeaderStyle}>Information</div>
          <SettingsRow label="About Valueskins" value="Learn more" onClick={() => {}} />
          <SettingsRow label="Privacy Policy" value="View" onClick={() => {}} />
          <SettingsRow label="Terms of Service" value="View" onClick={() => {}} />
          <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--ig-separator)', marginTop: 12 }}>
            <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Log Out</button>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}

function SettingsRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--ig-separator)', textAlign: 'left', cursor: 'pointer' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ig-elevated)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ig-text-primary)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ig-text-tertiary)' }}>{value}</div>
    </button>
  );
}

function ToggleSetting({ label, enabled }: { label: string; enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--ig-separator)' }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
      <button onClick={() => setIsEnabled(!isEnabled)} style={{ width: 48, height: 28, borderRadius: 14, background: isEnabled ? '#8b5cf6' : 'var(--ig-separator)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease' }}>
        <div style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', background: '#fff', top: 2, left: isEnabled ? 22 : 2, transition: 'left 0.2s ease' }} />
      </button>
    </div>
  );
}
