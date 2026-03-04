'use client';

import { useState } from 'react';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { PLATFORM_CONFIGS, Platform } from '@/lib/professions';

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

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

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
            <SectionRow>
              <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--ig-text-secondary)' }}>
                💡 Control whether you want advances on deals. Set your preference and non-negotiable terms.
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

        {/* Notifications */}
        <div style={{ borderBottom: '1px solid var(--ig-separator)' }}>
          <div style={sectionHeaderStyle}>Notifications</div>
          <ToggleSetting label="New Matches" enabled={true} />
          <ToggleSetting label="Brand Messages" enabled={true} />
          <ToggleSetting label="Marketing" enabled={false} />
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
