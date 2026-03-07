'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BrandOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        website: '',
        category: '',
        useCase: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsSubmitting(false);
        router.push('/brands/dashboard');
    };

    const categories = ['Fashion & Apparel', 'Technology', 'Gaming', 'DeFi & Web3', 'Consumer Goods', 'Entertainment', 'Other'];
    const useCases = ['Creator Sponsorships', 'Ambassador Programs', 'Content Creation', 'Community Management', 'Technical Projects', 'All of the above'];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                    ))}
                </div>

                {step === 1 && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Brand Account</h1>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Find creators matched to your brand</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Company Name *</label>
                                <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="Nike, Coinbase, etc." style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f5f5f5', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Work Email *</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f5f5f5', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Website</label>
                                <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://company.com" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f5f5f5', fontSize: '1rem', outline: 'none' }} />
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} disabled={!formData.companyName || !formData.email} style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: formData.companyName && formData.email ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#f5f5f5', fontSize: '1rem', fontWeight: 600, cursor: formData.companyName && formData.email ? 'pointer' : 'not-allowed' }}>Next</button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Brand category</h1>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>What describes your company?</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setFormData({ ...formData, category: cat })} style={{ padding: '1rem', background: formData.category === cat ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.category === cat ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', color: formData.category === cat ? '#f5f5f5' : '#888', textAlign: 'left', cursor: 'pointer', fontWeight: formData.category === cat ? 600 : 400 }}>{cat}</button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#888', cursor: 'pointer' }}>Back</button>
                            <button onClick={() => setStep(3)} disabled={!formData.category} style={{ flex: 2, padding: '1rem', background: formData.category ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#f5f5f5', fontWeight: 600, cursor: formData.category ? 'pointer' : 'not-allowed' }}>Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Creator marketing goals</h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>How will you work with creators?</p>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {useCases.map(uc => (
                                    <button key={uc} onClick={() => setFormData({ ...formData, useCase: uc })} style={{ padding: '0.75rem', background: formData.useCase === uc ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${formData.useCase === uc ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: formData.useCase === uc ? '#f5f5f5' : '#888', fontSize: '0.85rem', cursor: 'pointer', fontWeight: formData.useCase === uc ? 600 : 400 }}>{uc}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setStep(2)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#888', cursor: 'pointer' }}>Back</button>
                            <button onClick={handleSubmit} disabled={!formData.useCase || isSubmitting} style={{ flex: 2, padding: '1rem', background: formData.useCase ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#f5f5f5', fontWeight: 600, cursor: formData.useCase ? 'pointer' : 'not-allowed' }}>{isSubmitting ? 'Creating...' : 'Complete'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
