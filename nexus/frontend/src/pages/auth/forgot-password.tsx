import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // In development, show the token for testing
        if (data._devToken) {
          setDevToken(data._devToken);
        }
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Connection error. Please try again. Report a problem at valueskinsfounder@gmail.com');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-6 py-2 rounded-sm shadow-[8px_8px_0px_0px_rgba(213,0,249,0.3)] font-headline inline-block">
            Nexus
          </h1>
          <p className="text-xl text-on-surface-variant mt-6 font-body">Reset Your Password</p>
        </div>

        <div className="card-surface p-8">
          {success ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-on-surface font-headline font-bold mb-2">Check Your Email</p>
              <p className="text-on-surface-variant mb-6">
                If an account exists with this email, you will receive a password reset link.
              </p>

              {devToken && (
                <div className="bg-surface-container-highest p-4 rounded border border-outline-variant/50 mb-6 text-left">
                  <p className="text-xs font-mono text-on-surface-variant mb-2">
                    DEV: Reset token (valid 15 minutes)
                  </p>
                  <p className="text-xs font-mono text-on-surface break-all">{devToken}</p>
                </div>
              )}

              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-3 px-6 rounded-sm transition-all"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded px-4 py-3 text-red-100 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-headline mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-3 px-6 rounded-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending reset link...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-on-surface-variant">
                  Remember your password?{' '}
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-primary hover:underline font-headline font-bold"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
