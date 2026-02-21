'use client';

import { useState } from 'react';

export default function BrandOnboardingPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        website: '',
        category: '',
        useCase: '',
        monthlyBudget: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 2000));
        setApiKey('vs_live_' + Math.random().toString(36).substring(2, 15));
        setIsSubmitting(false);
        setStep(4);
    };

    const categories = ['Fashion & Apparel', 'Technology', 'Gaming', 'DeFi & Web3', 'Consumer Goods', 'Entertainment', 'Other'];
    const useCases = ['Creator Sponsorships', 'Ambassador Programs', 'Content Creation', 'Community Management', 'Technical Projects', 'All of the above'];
    const budgets = ['< $5,000/mo', '$5K - $25K/mo', '$25K - $100K/mo', '$100K+/mo'];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'linear-gradient(90deg, #8b5cf6, #06b6d4)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                    ))}
                </div>

                {step === 1 && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏢 Join as a Brand</h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Access verified creators with transparent skill levels</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Company Name *</label>
                                <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="Nike, Coinbase, etc." style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Work Email *</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Website</label>
                                <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://company.com" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }} />
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} disabled={!formData.companyName || !formData.email} style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: formData.companyName && formData.email ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: formData.companyName && formData.email ? 'pointer' : 'not-allowed' }}>Continue →</button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>What describes your brand?</h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Help us match you with the right creators</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setFormData({ ...formData, category: cat })} style={{ padding: '1rem', background: formData.category === cat ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.category === cat ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', color: formData.category === cat ? 'white' : '#a1a1aa', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>{cat}</button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#a1a1aa', cursor: 'pointer' }}>← Back</button>
                            <button onClick={() => setStep(3)} disabled={!formData.category} style={{ flex: 2, padding: '1rem', background: formData.category ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, cursor: formData.category ? 'pointer' : 'not-allowed' }}>Continue →</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Final details</h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Tell us about your creator marketing goals</p>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>Primary Use Case</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {useCases.map(uc => (
                                    <button key={uc} onClick={() => setFormData({ ...formData, useCase: uc })} style={{ padding: '0.75rem', background: formData.useCase === uc ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.useCase === uc ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: formData.useCase === uc ? 'white' : '#a1a1aa', fontSize: '0.85rem', cursor: 'pointer' }}>{uc}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.75rem' }}>Monthly Creator Budget</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {budgets.map(b => (
                                    <button key={b} onClick={() => setFormData({ ...formData, monthlyBudget: b })} style={{ flex: 1, padding: '0.75rem 0.5rem', background: formData.monthlyBudget === b ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.monthlyBudget === b ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: formData.monthlyBudget === b ? 'white' : '#a1a1aa', fontSize: '0.75rem', cursor: 'pointer' }}>{b}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setStep(2)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#a1a1aa', cursor: 'pointer' }}>← Back</button>
                            <button onClick={handleSubmit} disabled={!formData.useCase || isSubmitting} style={{ flex: 2, padding: '1rem', background: formData.useCase ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, cursor: formData.useCase ? 'pointer' : 'not-allowed' }}>{isSubmitting ? 'Creating account...' : 'Complete Setup'}</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome to Valueskins!</h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Your brand account is ready</p>

                        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Your API Key</p>
                            <code style={{ display: 'block', fontSize: '1rem', fontWeight: 600, wordBreak: 'break-all' }}>{apiKey}</code>
                            <button onClick={() => navigator.clipboard.writeText(apiKey || '')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>Copy to Clipboard</button>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>What's Next?</h3>
                            <ul style={{ color: '#a1a1aa', lineHeight: 2 }}>
                                <li>✓ Post your first opportunity</li>
                                <li>✓ Verify creators with our API</li>
                                <li>✓ Embed badges on your site</li>
                            </ul>
                        </div>

                        <button onClick={() => window.location.href = '/brands/dashboard'} style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Go to Dashboard →</button>
                    </div>
                )}
            </div>
        </div>
    );
}
