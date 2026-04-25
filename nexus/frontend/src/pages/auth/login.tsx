import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [connectingWith, setConnectingWith] = useState<string | null>(null);
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userType = localStorage.getItem('user_type');

      if (token && userType) {
        router.push('/');
        return;
      }
    }
    setReady(true);
  }, [router]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setConnectingWith('google');
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();
      if (data.token && data.userType) {
        localStorage.setItem('user_type', data.userType);
        localStorage.setItem('auth_token', data.token);
        router.push('/');
      } else {
        console.error('Invalid response:', data);
      }
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setConnectingWith(null);
    }
  };

  const handleOAuthLogin = async (provider: 'apple') => {
    setConnectingWith(provider);
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.token && data.userType) {
        localStorage.setItem('user_type', data.userType);
        localStorage.setItem('auth_token', data.token);
        router.push('/');
      } else {
        console.error('Invalid response:', data);
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    } finally {
      setConnectingWith(null);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-6 py-2 rounded-sm shadow-[8px_8px_0px_0px_rgba(213,0,249,0.3)] font-headline inline-block">
              Nexus
            </h1>
            <p className="text-xl text-on-surface-variant mt-6 font-body">Where creators meet opportunities</p>
          </div>

          <div className="card-surface p-8">
            <h2 className="text-2xl font-headline font-bold mb-8 text-center">How do you want to sign in?</h2>

            <div className="space-y-3">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.error('Google login failed');
                    setConnectingWith(null);
                  }}
                  theme="filled_black"
                  size="large"
                  width="100%"
                />
              </div>
              <button
                onClick={() => handleOAuthLogin('apple')}
                disabled={connectingWith !== null}
                className="w-full bg-black hover:bg-gray-900 text-white font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">apple</span>
                {connectingWith === 'apple' ? 'Connecting...' : 'Continue with Apple'}
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-on-surface-variant mt-6">
            By continuing, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}