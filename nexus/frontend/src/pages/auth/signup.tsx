import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface SignupResponse {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    name: string;
    handle: string;
    userType: string;
    token: string;
  };
  requiresEmailVerification?: boolean;
  verificationTokenExpiresAt?: string;
  _devToken?: string;
  error?: string;
  errors?: Record<string, string>;
}

export default function Signup() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [userType, setUserType] = useState<'CREATOR' | 'BRAND'>('CREATOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [signupData, setSignupData] = useState<SignupResponse['data']>(null);
  const [devToken, setDevToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        router.push('/');
        return;
      }
    }
    setReady(true);
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!handle || handle.length < 3) {
      setError('Handle must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, handle, userType })
      });

      const data: SignupResponse = await response.json();

      if (response.ok && data.success && data.data) {
        // Store signup data for verification step
        setSignupData(data.data);
        setSuccess(true);
        if (data._devToken) {
          setDevToken(data._devToken);
        }
        // Don't auto-login, require email verification first
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  // Success screen after signup
  if (success && signupData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-6 py-2 rounded-sm shadow-[8px_8px_0px_0px_rgba(213,0,249,0.3)] font-headline inline-block">
              Nexus
            </h1>
            <p className="text-xl text-on-surface-variant mt-6 font-body">Where creators meet opportunities</p>
          </div>

          <div className="card-surface p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-headline font-bold mb-4">Account Created!</h2>
              <p className="text-on-surface-variant mb-6">
                Welcome, <span className="font-bold text-primary">{signupData.name}</span>
              </p>
            </div>

            <div className="bg-surface-container-highest p-4 rounded mb-8 text-sm">
              <p className="text-on-surface-variant mb-4">
                To complete setup, verify your email address:
              </p>
              <p className="text-on-surface font-mono text-xs bg-surface px-3 py-2 rounded mb-4 break-all">
                {signupData.email}
              </p>
              {devToken && (
                <div className="bg-primary/20 border border-primary/50 p-3 rounded text-xs">
                  <p className="text-primary font-bold mb-2">Dev Mode: Verification Token</p>
                  <p className="text-primary/80 font-mono break-all mb-3">{devToken}</p>
                  <button
                    onClick={() => router.push(`/auth/verify-email?userId=${signupData.userId}&token=${devToken}`)}
                    className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-2 px-4 rounded text-sm"
                  >
                    Verify Email Now
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-primary hover:bg-primary-dim text-surface font-headline font-bold py-3 px-6 rounded-sm transition-all"
            >
              Go to Login
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-on-surface-variant">
                Email sent to {signupData.email}
              </p>
            </div>
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
            Nexus
          </h1>
          <p className="text-xl text-on-surface-variant mt-6 font-body">Where creators meet opportunities</p>
        </div>

        <div className="card-surface p-8">
          <h2 className="text-2xl font-headline font-bold mb-8 text-center">Create Account</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded px-4 py-3 text-red-100 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-headline mb-2">Account Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('CREATOR')}
                  className={`flex-1 py-2 px-4 rounded border transition-all ${
                    userType === 'CREATOR'
                      ? 'bg-primary border-primary text-surface'
                      : 'bg-surface-container border-outline-variant hover:border-primary'
                  }`}
                >
                  Creator
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('BRAND')}
                  className={`flex-1 py-2 px-4 rounded border transition-all ${
                    userType === 'BRAND'
                      ? 'bg-primary border-primary text-surface'
                      : 'bg-surface-container border-outline-variant hover:border-primary'
                  }`}
                >
                  Brand
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-headline mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm font-headline mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm font-headline mb-2">Username (Handle)</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="your_handle"
                required
                className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
              />
              <p className="text-xs text-on-surface-variant mt-1">3-30 characters, letters, numbers, underscore</p>
            </div>

            <div>
              <label className="block text-sm font-headline mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container-highest px-4 py-3 rounded border border-outline-variant/50 focus:border-primary focus:ring-0"
              />
              <p className="text-xs text-on-surface-variant mt-1">At least 8 characters, with uppercase, lowercase, number, and special character</p>
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-on-surface-variant">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-primary hover:underline font-headline font-bold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className="text-xs text-center text-on-surface-variant mt-6">
          By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
