'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Portuguese', 'Arabic', 'Mandarin', 'German', 'Japanese', 'Korean'];
const CONTENT_FORMATS = ['Video', 'Photo', 'Text', 'Podcast', 'Live'];
const NICHES = ['Fashion', 'Beauty', 'Tech', 'Finance', 'Fitness', 'Food', 'Travel', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Entertainment', 'Health', 'Sports', 'Music', 'Art'];
const DEAL_TYPES = ['Paid', 'Gifted', 'Equity'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const TIMEZONES = ['UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+0 (GMT)', 'UTC+1 (CET)', 'UTC+3 (MSK)', 'UTC+5:30 (IST)', 'UTC+8 (CST)', 'UTC+9 (JST)', 'UTC+10 (AEST)'];
const PRODUCT_PREFS = ['Physical', 'Digital', 'Both'];
const AUDIENCE_AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

type Step = 'location' | 'identity' | 'audience' | 'deals';

interface Form {
  location_city: string;
  location_country: string;
  timezone: string;
  willing_to_relocate: boolean;
  willing_to_travel: boolean;
  willing_to_appear_at_events: boolean;
  availability_hours: string;
  age: string;
  gender: string;
  languages_spoken: string[];
  content_language: string;
  content_niche: string[];
  content_format: string[];
  posting_frequency: string;
  audience_age_range: string;
  audience_location_primary: string;
  primary_platform: string;
  deal_type_preference: string[];
  min_deal_size_usd: string;
  exclusivity_available: boolean;
  willing_to_sign_nda: boolean;
  willing_to_sign_usage_rights: boolean;
  on_camera_willing: boolean;
  product_preference: string;
  response_time_hours: string;
  content_rights_owned: boolean;
}

const STEPS: Step[] = ['location', 'identity', 'audience', 'deals'];
const STEP_LABELS: Record<Step, string> = {
  location: 'Location & Availability',
  identity: 'Identity & Content',
  audience: 'Your Audience',
  deals: 'Deal Preferences',
};

const inputStyle = {
  width: '100%', padding: '0.65rem 0.85rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: 'white', fontSize: '0.9rem',
  boxSizing: 'border-box' as const,
};

const labelStyle = { color: '#a1a1aa', fontSize: '0.82rem', marginBottom: '0.3rem', display: 'block', fontWeight: 600 };

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem' }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative',
          background: value ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
          transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: value ? 19 : 3,
          width: 14, height: 14, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s',
        }} />
      </div>
      {label}
    </label>
  );
}

function MultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onChange(active ? selected.filter(x => x !== o) : [...selected, o])}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer',
              background: active ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.04)',
              border: active ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: active ? '#c4b5fd' : '#a1a1aa',
            }}>{o}</button>
        );
      })}
    </div>
  );
}

export default function AttributesPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('location');
  const [form, setForm] = useState<Form>({
    location_city: '', location_country: '', timezone: '',
    willing_to_relocate: false, willing_to_travel: false, willing_to_appear_at_events: false,
    availability_hours: '', age: '', gender: '', languages_spoken: [], content_language: '',
    content_niche: [], content_format: [], posting_frequency: '',
    audience_age_range: '', audience_location_primary: '', primary_platform: '',
    deal_type_preference: [], min_deal_size_usd: '', exclusivity_available: false,
    willing_to_sign_nda: false, willing_to_sign_usage_rights: false,
    on_camera_willing: true, product_preference: '', response_time_hours: '',
    content_rights_owned: true,
  });

  const set = <K extends keyof Form>(field: K, value: Form[K]) => setForm(prev => ({ ...prev, [field]: value }));
  const stepIndex = STEPS.indexOf(step);

  const next = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
    else router.push('/feed');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? '#8b5cf6' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.3rem' }}>{STEP_LABELS[step]}</h2>
        <p style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Used to recommend matches. Brands may mark some as required.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {step === 'location' && <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={labelStyle}>City</label><input style={inputStyle} placeholder="New York" value={form.location_city} onChange={e => set('location_city', e.target.value)} /></div>
              <div><label style={labelStyle}>Country</label><input style={inputStyle} placeholder="USA" value={form.location_country} onChange={e => set('location_country', e.target.value)} /></div>
            </div>
            <div><label style={labelStyle}>Timezone</label>
              <select style={inputStyle} value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                <option value="">Select...</option>
                {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Availability Hours</label><input style={inputStyle} placeholder="e.g. 9am–6pm EST" value={form.availability_hours} onChange={e => set('availability_hours', e.target.value)} /></div>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <Toggle value={form.willing_to_relocate} onChange={v => set('willing_to_relocate', v)} label="Willing to relocate for a project" />
              <Toggle value={form.willing_to_travel} onChange={v => set('willing_to_travel', v)} label="Willing to travel" />
              <Toggle value={form.willing_to_appear_at_events} onChange={v => set('willing_to_appear_at_events', v)} label="Available for live events / appearances" />
            </div>
          </>}

          {step === 'identity' && <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={labelStyle}>Age</label><input style={inputStyle} type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} /></div>
              <div><label style={labelStyle}>Gender</label>
                <select style={inputStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select...</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Languages Spoken</label><MultiSelect options={LANGUAGES} selected={form.languages_spoken} onChange={v => set('languages_spoken', v)} /></div>
            <div><label style={labelStyle}>Primary Content Language</label>
              <select style={inputStyle} value={form.content_language} onChange={e => set('content_language', e.target.value)}>
                <option value="">Select...</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Content Niche</label><MultiSelect options={NICHES} selected={form.content_niche} onChange={v => set('content_niche', v)} /></div>
            <div><label style={labelStyle}>Content Format</label><MultiSelect options={CONTENT_FORMATS} selected={form.content_format} onChange={v => set('content_format', v)} /></div>
            <div><label style={labelStyle}>Posting Frequency</label><input style={inputStyle} placeholder="e.g. 3x/week" value={form.posting_frequency} onChange={e => set('posting_frequency', e.target.value)} /></div>
            <Toggle value={form.content_rights_owned} onChange={v => set('content_rights_owned', v)} label="I own all rights to my content" />
            <Toggle value={form.on_camera_willing} onChange={v => set('on_camera_willing', v)} label="Comfortable appearing on camera" />
          </>}

          {step === 'audience' && <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={labelStyle}>Audience Age Range</label>
                <select style={inputStyle} value={form.audience_age_range} onChange={e => set('audience_age_range', e.target.value)}>
                  <option value="">Select...</option>
                  {AUDIENCE_AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Audience Primary Location</label><input style={inputStyle} placeholder="USA" value={form.audience_location_primary} onChange={e => set('audience_location_primary', e.target.value)} /></div>
            </div>
            <div><label style={labelStyle}>Primary Platform</label><input style={inputStyle} placeholder="Instagram" value={form.primary_platform} onChange={e => set('primary_platform', e.target.value)} /></div>
          </>}

          {step === 'deals' && <>
            <div><label style={labelStyle}>Deal Type Preference</label><MultiSelect options={DEAL_TYPES} selected={form.deal_type_preference} onChange={v => set('deal_type_preference', v)} /></div>
            <div><label style={labelStyle}>Minimum Deal Size (USD)</label><input style={inputStyle} type="number" placeholder="500" value={form.min_deal_size_usd} onChange={e => set('min_deal_size_usd', e.target.value)} /></div>
            <div><label style={labelStyle}>Typical Response Time (hours)</label><input style={inputStyle} type="number" placeholder="24" value={form.response_time_hours} onChange={e => set('response_time_hours', e.target.value)} /></div>
            <div><label style={labelStyle}>Product Preference</label>
              <select style={inputStyle} value={form.product_preference} onChange={e => set('product_preference', e.target.value)}>
                <option value="">Select...</option>
                {PRODUCT_PREFS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <Toggle value={form.exclusivity_available} onChange={v => set('exclusivity_available', v)} label="Open to brand exclusivity" />
              <Toggle value={form.willing_to_sign_nda} onChange={v => set('willing_to_sign_nda', v)} label="Willing to sign NDA" />
              <Toggle value={form.willing_to_sign_usage_rights} onChange={v => set('willing_to_sign_usage_rights', v)} label="Willing to grant usage rights" />
            </div>
          </>}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          {stepIndex > 0 && (
            <button type="button" onClick={() => setStep(STEPS[stepIndex - 1])}
              style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button type="button" onClick={next}
            style={{ flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg, #8b5cf6, #EF4444)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
            {stepIndex === STEPS.length - 1 ? 'Finish Setup' : 'Continue'}
          </button>
        </div>

        <button type="button" onClick={() => router.push('/feed')}
          style={{ width: '100%', marginTop: '0.75rem', padding: '0.6rem', background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '0.85rem' }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
