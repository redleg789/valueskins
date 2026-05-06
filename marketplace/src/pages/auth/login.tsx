'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [router]);

  const quickLogin = (userType: string) => {
    const email = userType === 'BRAND' ? 'brand_demo' : 'creator_demo';
    localStorage.setItem('auth_token', 'demo_token_' + Date.now());
    localStorage.setItem('user_id', 'user_' + Date.now());
    localStorage.setItem('user_name', email);
    localStorage.setItem('user_type', userType);
    router.push('/');
  };

  if (!ready) return <div className="min-h-screen bg-surface" />;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-surface-container border border-outline-variant/20 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">ValueSkins Marketplace</h1>
        <p className="text-outline mb-8">Direct creator-brand collaboration. No middlemen.</p>

        <div className="space-y-4">
          <button
            onClick={() => quickLogin('CREATOR')}
            className="w-full px-6 py-4 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Login as Creator
          </button>

          <button
            onClick={() => quickLogin('BRAND')}
            className="w-full px-6 py-4 bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Login as Brand
          </button>

          <div className="pt-4 border-t border-outline-variant/20">
            <p className="text-xs text-outline text-center">Demo mode — No password required</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <p className="font-semibold mb-2">Quick Start:</p>
          <ul className="space-y-1 text-xs text-outline">
            <li>✓ Creator: Browse deals on Deal Board</li>
            <li>✓ Brand: Post campaigns or search creators</li>
            <li>✓ Both: Chat, negotiate, track ROI</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
