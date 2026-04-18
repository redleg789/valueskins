// Login page - OAuth for creators/brands

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (platform: string) => {
    if (!userType) return;

    setLoading(true);
    try {
      // Redirect to backend OAuth callback
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      window.location.href = `${backendUrl}/oauth/${platform}?user_type=${userType}`;
    } catch (error) {
      console.error('OAuth error:', error);
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">Creator Marketplace</h1>
          <p className="text-gray-600 mb-8 text-center">Choose your role</p>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('creator')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              I'm a Creator
            </button>
            <button
              onClick={() => setUserType('brand')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              I'm a Brand
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <button
          onClick={() => setUserType(null)}
          className="text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-2 text-center">
          {userType === 'creator' ? 'Creator Sign In' : 'Brand Sign In'}
        </h1>
        <p className="text-gray-600 mb-8 text-center">Connect your social account</p>

        <div className="space-y-3">
          {userType === 'creator' && (
            <>
              <button
                onClick={() => handleOAuthLogin('instagram')}
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Instagram'}
              </button>
              <button
                onClick={() => handleOAuthLogin('youtube')}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'YouTube'}
              </button>
              <button
                onClick={() => handleOAuthLogin('tiktok')}
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'TikTok'}
              </button>
              <button
                onClick={() => handleOAuthLogin('linkedin')}
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'LinkedIn'}
              </button>
            </>
          )}

          {userType === 'brand' && (
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Google Sign In'}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
