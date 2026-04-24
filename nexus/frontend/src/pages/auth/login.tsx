import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [connectingWith, setConnectingWith] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'apple', type: 'creator' | 'brand') => {
    setConnectingWith(provider);
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: type })
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('user_type', type);
        localStorage.setItem('auth_token', data.token);
        if (type === 'creator') {
          router.push('/creator/dashboard');
        } else {
          router.push('/brand/dashboard');
        }
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    } finally {
      setConnectingWith(null);
    }
  };

  const handleGuestBrowse = () => {
    localStorage.setItem('user_type', 'guest');
    localStorage.setItem('auth_token', 'guest_token_' + Date.now());
    router.push('/deals-feed');
  };

  if (!userType) {
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
            <h2 className="text-2xl font-headline font-bold mb-6 text-center">Join the Platform</h2>

            <div className="space-y-4">
              <button
                onClick={() => setUserType('creator')}
                className="w-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline font-bold py-5 px-6 rounded-sm transition-all border-2 border-transparent hover:border-primary"
              >
                <span className="material-symbols-outlined text-2xl mr-3 align-middle">movie</span>
                I am a Creator
              </button>
              <button
                onClick={() => setUserType('brand')}
                className="w-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline font-bold py-5 px-6 rounded-sm transition-all border-2 border-transparent hover:border-secondary"
              >
                <span className="material-symbols-outlined text-2xl mr-3 align-middle">store</span>
                I am a Brand
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleGuestBrowse}
              className="text-primary hover:text-primary-dim font-headline transition-colors"
            >
              Browse as a guest
            </button>
          </div>

          <p className="text-xs text-center text-on-surface-variant mt-6">
            By continuing, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => setUserType(null)}
          className="flex items-center gap-2 text-primary mb-8 font-headline hover:text-primary-dim transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        <div className="card-surface p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-black italic text-primary mb-2">
              {userType === 'creator' ? 'Welcome, Creator' : 'Welcome, Brand'}
            </h1>
            <p className="text-on-surface-variant">Login with</p>
          </div>

          <div className="space-y-3">
            {userType === 'creator' && (
              <>
                <button
                  onClick={() => handleOAuthLogin('google', 'creator')}
                  disabled={connectingWith !== null}
                  className="w-full bg-white hover:bg-gray-100 text-black font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                  {connectingWith === 'google' ? 'Connecting...' : 'Login with Google'}
                </button>
                <button
                  onClick={() => handleOAuthLogin('apple', 'creator')}
                  disabled={connectingWith !== null}
                  className="w-full bg-black hover:bg-gray-900 text-white font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">apple</span>
                  {connectingWith === 'apple' ? 'Connecting...' : 'Login with Apple'}
                </button>
              </>
            )}

            {userType === 'brand' && (
              <>
                <button
                  onClick={() => handleOAuthLogin('google', 'brand')}
                  disabled={connectingWith !== null}
                  className="w-full bg-white hover:bg-gray-100 text-black font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                  {connectingWith === 'google' ? 'Connecting...' : 'Login with Google'}
                </button>
                <button
                  onClick={() => handleOAuthLogin('apple', 'brand')}
                  disabled={connectingWith !== null}
                  className="w-full bg-black hover:bg-gray-900 text-white font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">apple</span>
                  {connectingWith === 'apple' ? 'Connecting...' : 'Login with Apple'}
                </button>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant">
            <button
              onClick={handleGuestBrowse}
              className="w-full btn-secondary"
            >
              Browse as a guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}