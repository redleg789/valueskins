'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * BRAND ONBOARDING: STEP 1 — COMPANY INFORMATION
 * Collect brand details and company information
 */

export default function BrandOnboardingCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    website: '',
    about: '',
    contact_email: '',
    annual_budget_cents: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('onboarding_brand_company', JSON.stringify(formData));
      router.push('/brand/onboarding/verification');
    } catch (err: any) {
      setError(err.message || 'Failed to save company info');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Fashion & Beauty',
    'Tech & SaaS',
    'Food & Beverage',
    'Travel & Hospitality',
    'Health & Wellness',
    'Finance & Banking',
    'E-commerce',
    'Entertainment',
    'Education',
    'Other',
  ];

  const isComplete = formData.company_name && formData.industry && formData.website && formData.contact_email;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Step 1 of 3: Company Information</p>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏢 Brand Setup</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Tell us about your brand and what you're looking to create with creators.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g., Acme Corp"
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

          {/* Industry */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Industry
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
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
            >
              <option value="">Select industry...</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
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

          {/* About */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              About Your Brand (optional)
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell us about your brand mission, target audience, and what you're looking for..."
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

          {/* Contact Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="partnerships@example.com"
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

          {/* Annual Budget */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Annual Creator Budget (optional)
            </label>
            <input
              type="number"
              name="annual_budget_cents"
              value={formData.annual_budget_cents}
              onChange={handleChange}
              placeholder="e.g., 500000 (for $5,000)"
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
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
              Helps us match you with creators in your budget range
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isComplete || loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: isComplete ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.1)',
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
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
