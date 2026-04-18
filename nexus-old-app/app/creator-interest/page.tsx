'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SignupForm {
  instagram_handle: string;
  email: string;
  name: string;
  reason_for_interest: string;
  primary_profession: string;
  target_annual_income_usd: string;
  preferred_platforms: string[];
  has_existing_audience: boolean;
  estimated_follower_count: string;
}

const PROFESSIONS = [
  'Software Engineer',
  'AI/ML Specialist',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'Designer',
  'Founder/CEO',
  'Marketing Manager',
  'Sales Executive',
  'Content Creator',
  'Doctor',
  'Fitness Coach',
  'Financial Advisor',
  'Consultant',
  'Other',
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter/X', icon: '𝕏' },
];

export default function CreatorInterestPage() {
  const [form, setForm] = useState<SignupForm>({
    instagram_handle: '',
    email: '',
    name: '',
    reason_for_interest: '',
    primary_profession: '',
    target_annual_income_usd: '',
    preferred_platforms: [],
    has_existing_audience: false,
    estimated_follower_count: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = <K extends keyof SignupForm>(field: K, value: SignupForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handlePlatformToggle = (platform: string) => {
    setForm(prev => ({
      ...prev,
      preferred_platforms: prev.preferred_platforms.includes(platform)
        ? prev.preferred_platforms.filter(p => p !== platform)
        : [...prev.preferred_platforms, platform]
    }));
  };

  const validateForm = (): boolean => {
    if (!form.instagram_handle.trim()) {
      setError('Instagram handle is required');
      return false;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!form.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!form.reason_for_interest.trim()) {
      setError('Tell us why you\'re interested');
      return false;
    }
    if (!form.primary_profession) {
      setError('Select your primary profession');
      return false;
    }
    if (form.preferred_platforms.length === 0) {
      setError('Select at least one platform');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('creator_interest_signups')
        .insert({
          instagram_handle: form.instagram_handle.replace(/^@/, '').toLowerCase().trim(),
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          reason_for_interest: form.reason_for_interest.trim(),
          primary_profession: form.primary_profession,
          target_annual_income_usd: form.target_annual_income_usd ? parseInt(form.target_annual_income_usd, 10) : 0,
          preferred_platforms: form.preferred_platforms,
          has_existing_audience: form.has_existing_audience,
          estimated_follower_count: form.estimated_follower_count ? parseInt(form.estimated_follower_count, 10) : 0,
          status: 'pending',
        });

      if (dbError) {
        // Postgres unique violation — handle already registered
        if (dbError.code === '23505') {
          setError('This Instagram handle is already registered. Thanks for your interest!');
        } else {
          setError('Failed to submit. Please try again.');
        }
        return;
      }

      setSubmitted(true);
      setForm({
        instagram_handle: '',
        email: '',
        name: '',
        reason_for_interest: '',
        primary_profession: '',
        target_annual_income_usd: '',
        preferred_platforms: [],
        has_existing_audience: false,
        estimated_follower_count: '',
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #EF4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Join ValueSkins
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '1rem', marginBottom: '1rem' }}>
            Express your interest in monetizing your expertise and influence
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#22c55e' }}>Thank you for your interest!</div>
            <p style={{ color: '#86efac', fontSize: '0.9rem' }}>We'll review your application and contact you within 48 hours at {form.email}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>⚠️ {error}</div>
          </div>
        )}

        {/* Form */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Basic Info */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Your Information</h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                    Instagram Handle <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="@yourhandle"
                    value={form.instagram_handle}
                    onChange={e => handleInputChange('instagram_handle', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                      Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Professional Details</h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                    Primary Profession <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={form.primary_profession}
                    onChange={e => handleInputChange('primary_profession', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  >
                    <option value="">Select your profession...</option>
                    {PROFESSIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                    Preferred Platforms <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {PLATFORMS.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handlePlatformToggle(p.value)}
                        style={{
                          padding: '0.75rem',
                          background: form.preferred_platforms.includes(p.value) ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.04)',
                          border: form.preferred_platforms.includes(p.value) ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: form.preferred_platforms.includes(p.value) ? '#c4b5fd' : '#a1a1aa',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                      Target Annual Income (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={form.target_annual_income_usd}
                      onChange={e => handleInputChange('target_annual_income_usd', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block', fontWeight: 600 }}>
                      Estimated Followers
                    </label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={form.estimated_follower_count}
                      onChange={e => handleInputChange('estimated_follower_count', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <input
                    type="checkbox"
                    id="audience"
                    checked={form.has_existing_audience}
                    onChange={e => handleInputChange('has_existing_audience', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="audience" style={{ cursor: 'pointer', fontSize: '0.9rem', flex: 1 }}>
                    I already have an existing audience
                  </label>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Why ValueSkins?</h3>

              <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>
                  Tell us why you're interested in ValueSkins <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  placeholder="I'm interested in monetizing my expertise in [field]. I want to... Tell us what excites you about ValueSkins!"
                  value={form.reason_for_interest}
                  onChange={e => handleInputChange('reason_for_interest', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                  }}
                />
                <p style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                  {form.reason_for_interest.length}/500 characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #EF4444)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              {loading ? 'Submitting...' : '✓ Submit My Interest'}
            </button>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
              We respect your privacy. Your information will only be used to contact you about ValueSkins.
            </p>
          </form>
        )}

        {/* Info Section */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>What is ValueSkins?</h3>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { icon: '💼', title: 'Monetize Expertise', desc: 'Turn your professional skills into revenue' },
              { icon: '🤝', title: 'Meet Brands', desc: 'Connect with companies seeking your expertise' },
              { icon: '📈', title: 'Scale Impact', desc: 'Grow influence and earn consistently' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>{item.title}</div>
                <p style={{ color: '#71717a', fontSize: '0.8rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
