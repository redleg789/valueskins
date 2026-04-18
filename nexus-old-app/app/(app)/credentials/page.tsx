'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, VerificationData } from '@/lib/api';

type Tab = 'credentials' | 'sharing' | 'verify';

export default function CredentialsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('credentials');
    const [data, setData] = useState<VerificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await api.verification.getMyVerification();
        if (res.data) setData(res.data);
        else setError(res.error || 'Failed to load credentials');
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div style={{ background: '#000', minHeight: '100vh', color: '#8e8e8e', padding: '20px' }}>Loading credentials...</div>;
    if (error || !data) return <div style={{ background: '#000', minHeight: '100vh', color: '#ef4444', padding: '20px' }}>{error}</div>;

    return (
        <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{
                padding: '20px', borderBottom: '1px solid #262626',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.1))',
            }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Your Credentials</h1>
                <p style={{ color: '#8e8e8e', fontSize: '14px' }}>Verified credentials. Portable anywhere.</p>
            </div>

            {/* Trust Score Badge */}
            <div style={{
                padding: '16px 20px', background: '#1c1c1e', borderBottom: '1px solid #262626',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 18 }}>✓</span>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Trust Score</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.trust_score} / 100</div>
                </div>
                <div style={{
                    background: data.verification_level >= 4 ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                    color: data.verification_level >= 4 ? '#fbbf24' : '#3b82f6',
                    padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold',
                }}>
                    Level {data.verification_level}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #262626' }}>
                {(['credentials', 'sharing', 'verify'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, padding: '14px', background: 'none', border: 'none',
                        borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
                        color: activeTab === tab ? '#fff' : '#8e8e8e',
                        fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize',
                    }}>{tab}</button>
                ))}
            </div>

            <div style={{ padding: '20px' }}>
                {activeTab === 'credentials' && <CredentialsTab data={data} />}
                {activeTab === 'sharing' && <SharingTab data={data} />}
                {activeTab === 'verify' && <VerifyTab data={data} />}
            </div>
        </div>
    );
}

function CredentialsTab({ data }: { data: VerificationData }) {
    return (
        <>
            {/* Reputation Score Card */}
            <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '16px', padding: '20px', marginBottom: '20px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Verified Trust Score</div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.trust_score}</div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)', padding: '6px 12px',
                        borderRadius: '16px', fontSize: '12px', fontWeight: 'bold',
                    }}>
                        Level {data.verification_level}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                        <div style={{ opacity: 0.7 }}>Deals</div>
                        <div style={{ fontWeight: 'bold' }}>{data.deals_completed}</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.7 }}>Rating</div>
                        <div style={{ fontWeight: 'bold' }}>{data.avg_rating.toFixed(1)}/5</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.7 }}>ID Verified</div>
                        <div style={{ fontWeight: 'bold' }}>{data.id_verified ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </div>

            {/* Credentials List */}
            <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                Your Credentials ({data.credentials.length})
            </div>

            {data.credentials.length === 0 ? (
                <div style={{ background: '#1c1c1e', borderRadius: 12, padding: 20, textAlign: 'center', color: '#8e8e8e' }}>
                    No credentials yet. Complete deals to earn verified credentials.
                </div>
            ) : data.credentials.map(cred => (
                <div key={cred.id} style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', background: '#3b82f6',
                                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                            }}>📜</div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{cred.type}</div>
                                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{cred.url}</div>
                            </div>
                        </div>
                        <div style={{
                            background: cred.verified_at ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107,114,128,0.2)',
                            color: cred.verified_at ? '#10b981' : '#6b7280',
                            padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                        }}>
                            {cred.verified_at ? '✓ Verified' : 'Pending'}
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {cred.created_at && <span>Created: {new Date(cred.created_at).toLocaleDateString()}</span>}
                        {cred.verified_at && <span> · Verified: {new Date(cred.verified_at).toLocaleDateString()}</span>}
                    </div>
                </div>
            ))}

            {/* Identity Proofs */}
            {data.identity_proofs.length > 0 && (
                <>
                    <div style={{ marginBottom: '12px', marginTop: '20px', fontWeight: 'bold' }}>
                        Identity Proofs ({data.identity_proofs.length})
                    </div>
                    {data.identity_proofs.map(proof => (
                        <div key={proof.id} style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{proof.platform}</div>
                                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                                        {proof.verified_at ? `Verified ${new Date(proof.verified_at).toLocaleDateString()}` : 'Pending verification'}
                                    </div>
                                </div>
                                <div style={{
                                    background: proof.verified_at ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.2)',
                                    color: proof.verified_at ? '#10b981' : '#6b7280',
                                    padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
                                }}>
                                    {proof.verified_at ? '✓' : '⏳'}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}

function SharingTab({ data }: { data: VerificationData }) {
    return (
        <>
            <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Export Your Credentials</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                        { icon: '📄', label: 'JSON', desc: 'Raw data' },
                        { icon: '📑', label: 'PDF', desc: 'Portfolio' },
                        { icon: '💼', label: 'LinkedIn', desc: 'Auto-import' },
                        { icon: '🔐', label: 'VC', desc: 'W3C Standard' },
                    ].map(format => (
                        <button key={format.label} style={{
                            background: '#262626', border: 'none', borderRadius: '8px',
                            padding: '16px', textAlign: 'center', cursor: 'pointer',
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{format.icon}</div>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{format.label}</div>
                            <div style={{ color: '#8e8e8e', fontSize: '11px' }}>{format.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Embed on Your Website</div>
                <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
                    Add a verified badge to your portfolio, website, or media kit.
                </p>
                <div style={{
                    background: '#262626', borderRadius: '8px', padding: '12px',
                    fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#8e8e8e',
                }}>
                    {`<script src="https://valueskins.com/embed/verify.js"></script>`}
                </div>
                <button onClick={() => navigator.clipboard.writeText(`<script src="https://valueskins.com/embed/verify.js"></script>`)} style={{
                    width: '100%', marginTop: '12px', background: '#8b5cf6', border: 'none',
                    padding: '12px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                }}>
                    Copy Embed Code
                </button>
            </div>
        </>
    );
}

function VerifyTab({ data }: { data: VerificationData }) {
    return (
        <>
            <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.1))',
                borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center',
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>Anyone Can Verify You</div>
                <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
                    Share this link with brands, employers, or anyone who wants to verify your credentials.
                </p>
                <div style={{
                    background: '#1c1c1e', borderRadius: '8px', padding: '12px',
                    fontFamily: 'monospace', fontSize: '13px', marginBottom: '12px',
                }}>
                    valueskins.com/verify/me
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigator.clipboard.writeText('valueskins.com/verify/me')} style={{
                        flex: 1, background: '#fff', color: '#000', border: 'none',
                        padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                    }}>Copy Link</button>
                </div>
            </div>

            <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>API Verification</div>
                <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '16px' }}>
                    Third parties can programmatically verify your credentials via our API.
                </p>
                <div style={{
                    background: '#262626', borderRadius: '8px', padding: '12px',
                    fontFamily: 'monospace', fontSize: '11px',
                }}>
                    <div style={{ color: '#8e8e8e', marginBottom: '8px' }}>GET /v1/verify/reputation/:id</div>
                    <div style={{ color: '#10b981' }}>
                        {`{ "verified": ${data.id_verified}, "score": ${data.trust_score}, "level": ${data.verification_level} }`}
                    </div>
                </div>
            </div>
        </>
    );
}
