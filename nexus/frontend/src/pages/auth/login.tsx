import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (type: 'creator' | 'brand') => {
    setLoading(true);
    localStorage.setItem('user_type', type);
    localStorage.setItem('auth_token', 'demo_token_' + Date.now());
    
    setTimeout(() => {
      if (type === 'creator') {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    }, 500);
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
            <h2 className="text-2xl font-headline font-bold mb-6 text-center">Join the Grimoire</h2>
            
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

            <div className="mt-8 pt-6 border-t border-outline-variant">
              <p className="text-center text-sm text-on-surface-variant">
                Demo mode: Click any option to enter instantly
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-on-surface-variant mt-6">
            By continuing, you agree to our Terms of Service
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
            <p className="text-on-surface-variant">Connect your account to begin</p>
          </div>

          <div className="space-y-3">
            {userType === 'creator' && (
              <>
                <button
                  onClick={() => handleDemoLogin('creator')}
                  disabled={loading}
                  className="w-full bg-[#E1306C] hover:bg-[#c62858] text-white font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                  {loading ? 'Connecting...' : 'Instagram'}
                </button>
                <button
                  onClick={() => handleDemoLogin('creator')}
                  disabled={loading}
                  className="w-full bg-[#FF0000] hover:bg-[#cc0000] text-white font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  {loading ? 'Connecting...' : 'YouTube'}
                </button>
                <button
                  onClick={() => handleDemoLogin('creator')}
                  disabled={loading}
                  className="w-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline font-bold py-4 px-6 rounded-sm transition-all border border-outline-variant flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">link</span>
                  {loading ? 'Connecting...' : 'TikTok'}
                </button>
              </>
            )}

            {userType === 'brand' && (
              <>
                <button
                  onClick={() => handleDemoLogin('brand')}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">search</span>
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </button>
                <button
                  onClick={() => handleDemoLogin('brand')}
                  disabled={loading}
                  className="w-full bg-[#333] hover:bg-[#1a1a1a] text-white font-headline font-bold py-4 px-6 rounded-sm transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">code</span>
                  {loading ? 'Connecting...' : 'Continue with GitHub'}
                </button>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant">
            <button
              onClick={() => handleDemoLogin(userType)}
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Entering...' : 'Skip & Enter Demo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}