'use client';

import { useState } from 'react';

/**
 * OAuth Callback Handler
 * 
 * Handles OAuth callbacks from Twitter, Instagram, etc.
 * Verifies the connection and updates the user's profile.
 */

export default function OAuthCallbackPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [platform, setPlatform] = useState<string>('');
    const [error, setError] = useState<string>('');

    // In real implementation, this would:
    // 1. Extract code from URL params
    // 2. Call backend to exchange code for token
    // 3. Fetch user info and verify ownership
    // 4. Update persona with verified connection

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '400px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '3rem'
            }}>
                {status === 'loading' && (
                    <>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid rgba(139,92,246,0.2)',
                            borderTopColor: '#8b5cf6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1.5rem'
                        }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verifying Connection...</h1>
                        <p style={{ color: '#a1a1aa' }}>Please wait while we verify your account.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1rem'
                        }}>✅</div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {platform} Connected!
                        </h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
                            Your account has been verified and added to your profile.
                        </p>
                        <button
                            onClick={() => window.location.href = '/profile'}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Go to Profile →
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1rem'
                        }}>❌</div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Connection Failed
                        </h1>
                        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
                            Please try again or contact support if the issue persists.
                        </p>
                        <button
                            onClick={() => window.location.href = '/profile'}
                            style={{
                                padding: '1rem 2rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Back to Profile
                        </button>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
