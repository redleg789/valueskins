import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ResetPassword() {
  const router = useRouter();
  const { userId, token } = router.query;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId || !token) {
      setError('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-surface p-8 text-center">
            <p className="text-red-100 text-sm mb-4">Invalid reset link</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-3 px-6 rounded-sm transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-6 py-2 rounded-sm shadow-[8px_8px_0px_0px_rgba(213,0,249,0.3)] font-headline inline-block">
            ValueSkins
          </h1>
          <p className="text-xl text-on-surface-variant mt-6 font-body">Reset Your Password</p>
        </div>

        <div className="card-surface p-8">
          {success ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-on-surface font-headline font-bold mb-2">Password Reset Successful</p>
              <p className="text-on-surface-variant">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded px-4 py-3 text-red-100 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-headline mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    At least 8 characters, with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-headline mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-3 px-6 rounded-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Resetting password...' : 'Reset Password'}
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
