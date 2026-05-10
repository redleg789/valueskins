import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function VerifyEmail() {
  const router = useRouter();
  const { userId, token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!userId || !token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Token may have expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Connection error. Please try again.');
        console.error('Verification error:', err);
      }
    };

    verifyEmail();
  }, [userId, token, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-6 py-2 rounded-sm shadow-[8px_8px_0px_0px_rgba(213,0,249,0.3)] font-headline inline-block">
            ValueSkins
          </h1>
          <p className="text-xl text-on-surface-variant mt-6 font-body">Verify Your Email</p>
        </div>

        <div className="card-surface p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="mt-4 text-on-surface">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-6xl mb-4">✓</div>
                <p className="text-on-surface font-headline font-bold mb-2">Success!</p>
                <p className="text-on-surface-variant">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-6xl mb-4">✕</div>
                <p className="text-on-surface font-headline font-bold mb-2">Verification Failed</p>
                <p className="text-on-surface-variant mb-6">{message}</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-3 px-6 rounded-sm transition-all"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
