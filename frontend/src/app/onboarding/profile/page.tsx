'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CREATOR ONBOARDING: STEP 1 — PROFILE SETUP
 * Collect basic creator information and verified email
 */

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    display_name: '',
    handle: '',
    bio: '',
    profession: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // API call will be added later
      // const res = await api.onboarding.saveProfile(formData);
      // For now, store in localStorage and proceed
      localStorage.setItem('onboarding_profile', JSON.stringify(formData));
      router.push('/onboarding/identity');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = formData.display_name && formData.handle && formData.email && formData.profession;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#8b5cf6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 1 of 4: Profile Setup</p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>👤 Let's build your profile</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Creators see your profile when considering collaborations. Make it count.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Display Name
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="e.g., Alex Chen"
              required
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
            />
          </div>

          {/* Handle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Handle (@username)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: '#a1a1aa' }}>@</span>
              <input
                type="text"
                name="handle"
                value={formData.handle}
                onChange={handleChange}
                placeholder="yourhandle"
                required
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

          {/* Professional Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Professional Title / Category
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="e.g., Fashion Content Creator, Tech Reviewer"
              required
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
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Bio (optional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell brands what makes you unique..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
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
            />
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.25rem' }}>We'll send a verification link</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isComplete || loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: isComplete ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: isComplete ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              marginTop: '1rem',
              opacity: isComplete ? 1 : 0.5,
            }}
          >
            {loading ? 'Saving...' : 'Continue to Verification'}
          </button>

          {/* Skip for later */}
          <button
            type="button"
            onClick={() => router.push('/profile')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px dashed rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
