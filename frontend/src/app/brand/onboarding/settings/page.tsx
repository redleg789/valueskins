'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * BRAND ONBOARDING: STEP 3 — BRAND SETTINGS
 * Configure budget, advance preferences, and discovery settings
 */

export default function BrandOnboardingSettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    offers_advances: true,
    advance_percentage: 30,
    preferred_deal_length: 'short_term',
    budget_per_creator_cents: '50000',
    allow_negotiations: true,
    require_follower_audit: false,
    min_follower_count: '10000',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('onboarding_brand_settings', JSON.stringify(formData));
      router.push('/brand/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 3 of 3: Brand Settings</p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚙️ Configure Your Preferences</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Set your budget, advance preferences, and discovery settings.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Budget Section */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>💰 Budget</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Typical Budget Per Creator
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: '#a1a1aa' }}>$</span>
                <input
                  type="number"
                  name="budget_per_creator_cents"
                  value={parseInt(formData.budget_per_creator_cents) / 100}
                  onChange={e => setFormData(prev => ({ ...prev, budget_per_creator_cents: String(parseInt(e.target.value) * 100) }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                Helps match you with creators in your budget range
              </p>
            </div>
          </div>

          {/* Advance Preferences Section */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🏦 Advance Preferences</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="offers_advances"
                  checked={formData.offers_advances}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>I offer payment advances to creators</span>
              </label>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.5rem', marginLeft: '2rem' }}>
                This attracts creators who need cash before completion. Advance is repaid from final deal payment.
              </p>
            </div>

            {formData.offers_advances && (
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Default Advance Percentage
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="range"
                    name="advance_percentage"
                    value={formData.advance_percentage}
                    onChange={handleChange}
                    min="10"
                    max="100"
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: 700, minWidth: '50px', textAlign: 'right' }}>{formData.advance_percentage}%</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
                  Creators will see this as your typical advance offer
                </p>
              </div>
            )}
          </div>

          {/* Deal Preferences */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🎯 Deal Preferences</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Preferred Deal Length
              </label>
              <select
                name="preferred_deal_length"
                value={formData.preferred_deal_length}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="short_term">Short-term (1-3 months)</option>
                <option value="medium_term">Medium-term (3-6 months)</option>
                <option value="long_term">Long-term (6+ months)</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="allow_negotiations"
                  checked={formData.allow_negotiations}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Allow price negotiations</span>
              </label>
            </div>
          </div>

          {/* Discovery Settings */}
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🔍 Discovery Settings</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="require_follower_audit"
                  checked={formData.require_follower_audit}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Require follower authenticity audit</span>
              </label>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.5rem', marginLeft: '2rem' }}>
                Only match with creators who passed our fake follower check
              </p>
            </div>

            {formData.require_follower_audit && (
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Minimum Follower Count
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: '#a1a1aa' }}>👥</span>
                  <input
                    type="number"
                    name="min_follower_count"
                    value={formData.min_follower_count}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/brand/dashboard')}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
