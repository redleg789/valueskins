'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS, Platform } from '@/lib/professions';
import { api } from '@/lib/api';
import { getCurrencyForCountry } from '@/lib/deals';

const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Portuguese', 'Arabic', 'Mandarin', 'German', 'Japanese', 'Korean', 'Russian', 'Italian', 'Dutch', 'Turkish', 'Polish', 'Swedish', 'Thai', 'Vietnamese', 'Indonesian', 'Tagalog'];
const CONTENT_FORMATS = ['Video', 'Photo', 'Text', 'Podcast', 'Live'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const TIMEZONES = ['UTC-12 (BIT)', 'UTC-11 (SST)', 'UTC-10 (HST)', 'UTC-9 (AKST)', 'UTC-8 (PST)', 'UTC-7 (MST)', 'UTC-6 (CST)', 'UTC-5 (EST)', 'UTC-4 (AST)', 'UTC-3 (ART)', 'UTC-2 (GST)', 'UTC-1 (CVT)', 'UTC+0 (GMT)', 'UTC+1 (CET)', 'UTC+2 (EET)', 'UTC+3 (MSK)', 'UTC+3:30 (IRST)', 'UTC+4 (GST)', 'UTC+4:30 (AFT)', 'UTC+5 (PKT)', 'UTC+5:30 (IST)', 'UTC+5:45 (NPT)', 'UTC+6 (BST)', 'UTC+6:30 (MMT)', 'UTC+7 (ICT)', 'UTC+8 (CST)', 'UTC+8:45 (ACWST)', 'UTC+9 (JST)', 'UTC+9:30 (ACST)', 'UTC+10 (AEST)', 'UTC+10:30 (LHST)', 'UTC+11 (SBT)', 'UTC+12 (NZST)', 'UTC+13 (PHOT)', 'UTC+14 (LINT)'];
const AUDIENCE_AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (DRC)', 'Congo (Republic)',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];
const POSTING_RULES = [
  'No posting between 10 PM–7 AM local time',
  'No reposting within 48 hours of original post',
  'No competitor mentions in same post',
  'Must keep sponsored post live for 30+ days',
  'No editing caption after brand approval',
  'No archiving/deleting within 90 days',
  'Must disclose sponsorship (#ad or #sponsored)',
  'No cross-posting to other platforms without approval',
  'No political/controversial content alongside brand content',
  'Must respond to brand comments within 24 hours',
];
const HOURS = ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];

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

// getCurrencyForCountry imported from @/lib/deals

export default function SettingsPage() {
  const { activePlatform, setPlatform } = usePlatform();
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Creator attributes state
  const [attrs, setAttrs] = useState({
    location_city: '', location_country: '', timezone: '',
    availability_from: '9:00 AM', availability_to: '6:00 PM', available_until: '', not_available_from: '',
    willing_to_relocate: false, willing_to_travel: false, willing_to_appear_at_events: false,
    age: '', gender: '', languages_spoken: [] as string[], content_language: '',
    content_format: [] as string[], posting_frequency: '',
    audience_age_range: '', audience_languages: [] as string[],
    min_deal_size_usd: '', response_time_hours: '',
    exclusivity_available: false, willing_to_sign_nda: false, willing_to_sign_usage_rights: false,
    on_camera_willing: true, product_preference: '', content_rights_owned: true,
    // International deals
    allow_international_deals: false,
    // Payment plan preferences (must total 100)
    payment_advance_pct: 30, payment_after_submission_pct: 50, payment_performance_pct: 20,
    payment_plan_negotiable: true,
    // Advance preferences
    creator_requires_advance: false, creator_advance_pct_wanted: 30, creator_advance_negotiable: true,
    // Content posting rules
    posting_rules: [] as string[],
  });

  const attrsDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist creator preferences to backend (debounced)
  const saveCreatorPreferences = useCallback((updated: typeof attrs) => {
    if (attrsDebounce.current) clearTimeout(attrsDebounce.current);
    attrsDebounce.current = setTimeout(async () => {
      setSettingsSaving(true);
      await api.settings.updateSettings({
        allow_international_deals: updated.allow_international_deals,
        payment_advance_pct: updated.payment_advance_pct,
        payment_after_submission_pct: updated.payment_after_submission_pct,
        payment_performance_pct: updated.payment_performance_pct,
        payment_plan_negotiable: updated.payment_plan_negotiable,
        creator_requires_advance: updated.creator_requires_advance,
        creator_advance_pct_wanted: updated.creator_advance_pct_wanted,
        creator_advance_negotiable: updated.creator_advance_negotiable,
        posting_rules: updated.posting_rules,
        exclusivity_available: updated.exclusivity_available,
        willing_to_sign_nda: updated.willing_to_sign_nda,
        willing_to_sign_usage_rights: updated.willing_to_sign_usage_rights,
        min_deal_size_usd: updated.min_deal_size_usd,
        response_time_hours: updated.response_time_hours,
        product_preference: updated.product_preference,
        location_country: updated.location_country,
      });
      setSettingsSaving(false);
    }, 600);
  }, []);

  const setA = <K extends keyof typeof attrs>(field: K, value: typeof attrs[K]) => setAttrs(prev => {
    const next = { ...prev, [field]: value };
    saveCreatorPreferences(next);
    return next;
  });

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
        // Restore creator preferences from backend
        setAttrs(prev => ({
          ...prev,
          allow_international_deals: res.data!.allow_international_deals ?? prev.allow_international_deals,
          payment_advance_pct: res.data!.payment_advance_pct ?? prev.payment_advance_pct,
          payment_after_submission_pct: res.data!.payment_after_submission_pct ?? prev.payment_after_submission_pct,
          payment_performance_pct: res.data!.payment_performance_pct ?? prev.payment_performance_pct,
          payment_plan_negotiable: res.data!.payment_plan_negotiable ?? prev.payment_plan_negotiable,
          creator_requires_advance: res.data!.creator_requires_advance ?? prev.creator_requires_advance,
          creator_advance_pct_wanted: res.data!.creator_advance_pct_wanted ?? prev.creator_advance_pct_wanted,
          creator_advance_negotiable: res.data!.creator_advance_negotiable ?? prev.creator_advance_negotiable,
          posting_rules: res.data!.posting_rules ?? prev.posting_rules,
          exclusivity_available: res.data!.exclusivity_available ?? prev.exclusivity_available,
          willing_to_sign_nda: res.data!.willing_to_sign_nda ?? prev.willing_to_sign_nda,
          willing_to_sign_usage_rights: res.data!.willing_to_sign_usage_rights ?? prev.willing_to_sign_usage_rights,
          min_deal_size_usd: res.data!.min_deal_size_usd ?? prev.min_deal_size_usd,
          response_time_hours: res.data!.response_time_hours ?? prev.response_time_hours,
          product_preference: res.data!.product_preference ?? prev.product_preference,
          location_country: res.data!.location_country ?? prev.location_country,
        }));
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

    // Profile completeness bonus
    const filledFields = [attrs.location_country, attrs.age, attrs.gender, attrs.content_language, attrs.audience_age_range].filter(Boolean).length;
    score += Math.min(filledFields * 3, 15);

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
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} placeholder="New York" value={attrs.location_city} onChange={e => setA('location_city', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <select style={inputStyle} value={attrs.location_country} onChange={e => setA('location_country', e.target.value)}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Timezone</label>
              <select style={inputStyle} value={attrs.timezone} onChange={e => setA('timezone', e.target.value)}>
                <option value="">Select timezone...</option>
                {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Availability Hours {attrs.timezone && <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--ig-text-secondary)' }}>({attrs.timezone})</span>}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
                <select style={inputStyle} value={attrs.availability_from} onChange={e => setA('availability_from', e.target.value)}>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', padding: '0 4px' }}>to</span>
                <select style={inputStyle} value={attrs.availability_to} onChange={e => setA('availability_to', e.target.value)}>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </SectionRow>
            <SectionRow>
              <label style={labelStyle}>Not available from</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginBottom: 4 }}>From</div>
                  <input style={inputStyle} type="date" value={attrs.not_available_from ?? ''} onChange={e => setA('not_available_from' as keyof typeof attrs, e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginBottom: 4 }}>To</div>
                  <input style={inputStyle} type="date" value={attrs.available_until} onChange={e => setA('available_until', e.target.value)} />
                </div>
              </div>
              {(attrs.not_available_from || attrs.available_until) && (
                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>
                  You will appear as unavailable during this period. Clear both dates when back.
                </div>
              )}
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
              <label style={labelStyle}>Audience Languages</label>
              <MultiChips options={LANGUAGES} selected={attrs.audience_languages} onChange={v => setA('audience_languages', v)} />
              <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginTop: 6 }}>
                Select all languages your audience primarily speaks.
              </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Min Deal Size</label><input style={inputStyle} type="number" placeholder="500" value={attrs.min_deal_size_usd} onChange={e => setA('min_deal_size_usd', e.target.value)} /></div>
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
            <SectionRow>
              <InlineToggle value={attrs.allow_international_deals} onChange={v => setA('allow_international_deals', v)} label="Open to international deals" />
              {attrs.allow_international_deals && (
                <div style={{ fontSize: 11, color: '#06b6d4', marginTop: 4 }}>
                  International deals show amounts in the brand's local currency. Your home currency ({attrs.location_country ? getCurrencyForCountry(attrs.location_country) : 'set your country first'}) is used for domestic deals.
                </div>
              )}
            </SectionRow>
          </>}
        </div>

        {/* Payment Plan */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('payment_plan')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Payment Plan</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'payment_plan' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'payment_plan' && <>
            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                Set your default payment split across three stages. Must total 100%. Brands see this when reviewing your profile.
              </div>

              {/* Advance */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Advance (upfront)</label>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{attrs.payment_advance_pct}%</span>
                </div>
                <input type="range" min="0" max="100" value={attrs.payment_advance_pct} onChange={e => {
                  const adv = parseInt(e.target.value);
                  const remaining = 100 - adv;
                  const sub = Math.min(attrs.payment_after_submission_pct, remaining);
                  setAttrs(prev => ({ ...prev, payment_advance_pct: adv, payment_after_submission_pct: sub, payment_performance_pct: remaining - sub }));
                }} style={{ width: '100%' }} />
              </div>

              {/* After Submission */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>After Submission</label>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4' }}>{attrs.payment_after_submission_pct}%</span>
                </div>
                <input type="range" min="0" max={100 - attrs.payment_advance_pct} value={attrs.payment_after_submission_pct} onChange={e => {
                  const sub = parseInt(e.target.value);
                  setAttrs(prev => ({ ...prev, payment_after_submission_pct: sub, payment_performance_pct: 100 - prev.payment_advance_pct - sub }));
                }} style={{ width: '100%' }} />
              </div>

              {/* Performance Based */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Performance-based</label>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{attrs.payment_performance_pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--ig-separator)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${attrs.payment_performance_pct}%`, background: '#10b981', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--ig-text-tertiary)', marginTop: 4 }}>Auto-calculated from remaining balance</div>
              </div>

              {/* Visual split bar */}
              <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                {attrs.payment_advance_pct > 0 && <div style={{ width: `${attrs.payment_advance_pct}%`, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>{attrs.payment_advance_pct}%</div>}
                {attrs.payment_after_submission_pct > 0 && <div style={{ width: `${attrs.payment_after_submission_pct}%`, background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>{attrs.payment_after_submission_pct}%</div>}
                {attrs.payment_performance_pct > 0 && <div style={{ width: `${attrs.payment_performance_pct}%`, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>{attrs.payment_performance_pct}%</div>}
              </div>

              <InlineToggle value={attrs.payment_plan_negotiable} onChange={v => setA('payment_plan_negotiable', v)} label="Payment split is negotiable" />
              {!attrs.payment_plan_negotiable && (
                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
                  Brands must accept your exact split. Deals with incompatible payment plans won't match.
                </div>
              )}
            </SectionRow>
          </>}
        </div>

        {/* Content Posting Rules */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('posting_rules')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Content Posting Rules</span>
            <span style={{ fontSize: 16 }}>{expandedSection === 'posting_rules' ? '▲' : '▼'}</span>
          </button>
          {expandedSection === 'posting_rules' && <>
            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                Select the rules you follow for sponsored content. Brands see these upfront so there are no surprises during the deal.
              </div>
              {POSTING_RULES.map(rule => {
                const active = attrs.posting_rules.includes(rule);
                return (
                  <div key={rule} onClick={() => setA('posting_rules', active ? attrs.posting_rules.filter(r => r !== rule) : [...attrs.posting_rules, rule])}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--ig-separator)', cursor: 'pointer' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: active ? 'none' : '2px solid var(--ig-separator)', background: active ? '#8b5cf6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {active && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: active ? 'var(--ig-text-primary)' : 'var(--ig-text-secondary)' }}>{rule}</span>
                  </div>
                );
              })}
              {attrs.posting_rules.length > 0 && (
                <div style={{ fontSize: 11, color: '#8b5cf6', marginTop: 10 }}>
                  {attrs.posting_rules.length} rule{attrs.posting_rules.length !== 1 ? 's' : ''} active — brands will see these before entering a deal room with you.
                </div>
              )}
            </SectionRow>
          </>}
        </div>

        {/* Advance Preferences */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <button onClick={() => toggleSection('advance')} style={{ width: '100%', ...sectionHeaderStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Advance Preferences</span>
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
                  <div style={{ marginBottom: 4 }}>✓ Profile completeness: +15</div>
                  <div style={{ marginBottom: 4 }}>✓ Trust & authenticity: +17</div>
                  <div>✓ Advance compatibility: +{attrs.creator_requires_advance ? 5 : 0}</div>
                </div>
              </div>
            </SectionRow>

            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                Control whether you want advances on deals. Set your preference and non-negotiable terms. Your match score updates in real-time as you adjust these settings.
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
