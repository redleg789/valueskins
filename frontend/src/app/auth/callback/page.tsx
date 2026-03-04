'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface LoginResponse {
    token: string;
    user: {
        id: number;
        instagram_user_id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
        role: string;
        persona_id: number | null;
    };
}

/**
 * OAuth Callback Handler
 *
 * Handles the Instagram OAuth redirect. Extracts the authorization code
 * from the URL, exchanges it with the backend for a JWT, persists the
 * session, and redirects to /demo/instagram.
 *
 * Security notes:
 *  - The code exchange happens server-side (POST /auth/login).
 *  - State parameter is validated to prevent CSRF.
 *  - Token is stored via the shared HttpClient.setToken path (localStorage).
 *  - The authorization code is single-use; replaying it will fail.
 */
export default function OAuthCallbackPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    // Prevent double-execution in React StrictMode dev re-renders
    const exchangeAttempted = useRef(false);

    useEffect(() => {
        if (exchangeAttempted.current) return;
        exchangeAttempted.current = true;

        async function exchangeCode() {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const errorParam = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            // Instagram redirects with ?error=... when user denies access
            if (errorParam) {
                setErrorMessage(errorDescription || errorParam || 'Authorization was denied.');
                setStatus('error');
                return;
            }

            if (!code) {
                setErrorMessage('Missing authorization code. Please try logging in again.');
                setStatus('error');
                return;
            }

            // Validate CSRF state if one was stored before redirect
            if (typeof window !== 'undefined') {
                const storedState = sessionStorage.getItem('oauth_state');
                if (storedState && state !== storedState) {
                    setErrorMessage('State mismatch. Possible CSRF attack. Please try again.');
                    setStatus('error');
                    return;
                }
                // Clean up stored state regardless of outcome
                sessionStorage.removeItem('oauth_state');
            }

            // Determine the redirect_uri that was used to initiate the OAuth flow.
            // This must match exactly what was sent to Instagram's authorize endpoint.
            const redirectUri = `${window.location.origin}/auth/callback`;

            // Retrieve stored role preference (defaults to 'creator')
            const storedRole = (typeof window !== 'undefined'
                ? localStorage.getItem('valueskins_pending_role')
                : null) || 'creator';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        redirect_uri: redirectUri,
                        role: storedRole,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const msg = errorData.error || `Server returned HTTP ${response.status}`;
                    setErrorMessage(msg);
                    setStatus('error');
                    return;
                }

                const data: LoginResponse = await response.json();

                // The backend sets an httpOnly `valueskins_session` cookie on the
                // /auth/login response — do NOT store the raw JWT in localStorage
                // (XSS risk). The cookie is sent automatically on subsequent requests
                // because the API client uses `credentials: 'include'`.

                // Persist non-sensitive user profile for display purposes only
                if (data.user) {
                    localStorage.setItem('valueskins_user', JSON.stringify(data.user));
                }

                // Clean up pending role
                localStorage.removeItem('valueskins_pending_role');

                setStatus('success');

                // Redirect to the Instagram demo page after a brief moment
                // so the success state is visible
                setTimeout(() => {
                    window.location.href = '/demo/instagram';
                }, 800);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Network error during login.';
                setErrorMessage(message);
                setStatus('error');
            }
        }

        exchangeCode();
    }, [searchParams]);

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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Verifying Connection...
                        </h1>
                        <p style={{ color: '#a1a1aa' }}>
                            Exchanging authorization with Instagram. Please wait.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(34,197,94,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '1.5rem',
                            color: '#22c55e',
                            fontWeight: 700,
                        }}>
                            OK
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Instagram Connected
                        </h1>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
                            Your account has been verified. Redirecting...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(239,68,68,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '1.2rem',
                            color: '#ef4444',
                            fontWeight: 700,
                        }}>
                            ERR
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Connection Failed
                        </h1>
                        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{errorMessage}</p>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
                            Please try again or contact support if the issue persists.
                        </p>
                        <a
                            href="/demo/instagram"
                            style={{
                                display: 'inline-block',
                                padding: '1rem 2rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textDecoration: 'none',
                            }}
                        >
                            Back to Login
                        </a>
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
