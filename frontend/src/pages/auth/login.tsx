import { useState } from 'react';
import { isDemoModeEnabled } from '@/lib/demoMode';
import { setDemoSession } from '@/lib/demoSession';

export default function Login() {
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async () => {
    if (!userType) return;
    if (!isDemoModeEnabled()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create demo session');
      }

      const data = (await response.json()) as { token: string };
      setDemoSession(data.token, userType);

      window.location.href = userType === 'creator' ? '/creator/dashboard' : '/brand/dashboard';
    } catch {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-2">Nexus</h1>
            <p className="text-xl text-gray-400">Where creators meet opportunities</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('creator')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition text-lg"
            >
              I&apos;m a Creator 🎬
            </button>
            <button
              onClick={() => setUserType('brand')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-xl transition text-lg"
            >
              I&apos;m a Brand 🏢
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-8 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="max-w-md w-full px-6">
        <button
          onClick={() => setUserType(null)}
          className="text-blue-400 hover:text-blue-300 mb-8 text-sm font-bold"
        >
          ← Back
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">
            {userType === 'creator' ? 'Welcome, Creator' : 'Welcome, Brand'}
          </h1>
          <p className="text-gray-400">Connect your account to get started</p>
        </div>

        <div className="space-y-3">
          {userType === 'creator' && (
            <>
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-4 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : '📸 Instagram'}
              </button>
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : '▶️ YouTube'}
              </button>
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-4 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : '🎵 TikTok'}
              </button>
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-4 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : '💼 LinkedIn'}
              </button>
            </>
          )}

          {userType === 'brand' && (
            <>
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-4 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : '🔷 Google'}
              </button>
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : '✉️ Email'}
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-8 text-center">
          {isDemoModeEnabled() ? 'Demo mode: All logins work instantly' : 'Demo mode is disabled'}
        </p>
      </div>
    </div>
  );
}
