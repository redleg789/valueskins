import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const getServerSideProps = async () => {
  return { props: {} };
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('auth_token');
    const userType = localStorage.getItem('user_type');

    if (!token || userType !== 'creator') {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur p-4">
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/creator/analytics')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 text-left hover:from-blue-700 hover:to-blue-800 transition"
          >
            <h2 className="text-2xl font-bold mb-2">📊 Analytics</h2>
            <p className="text-blue-200">View your engagement metrics (private)</p>
          </button>

          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-8 text-left hover:from-purple-700 hover:to-purple-800 transition"
          >
            <h2 className="text-2xl font-bold mb-2">📝 My Posts</h2>
            <p className="text-purple-200">View and manage your content</p>
          </button>

          <button
            onClick={() => router.push('/deals-feed')}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-8 text-left hover:from-green-700 hover:to-green-800 transition"
          >
            <h2 className="text-2xl font-bold mb-2">💼 Opportunities</h2>
            <p className="text-green-200">Browse brand collaboration deals</p>
          </button>

          <button
            onClick={() => router.push('/chat')}
            className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg p-8 text-left hover:from-pink-700 hover:to-pink-800 transition"
          >
            <h2 className="text-2xl font-bold mb-2">💬 Messages</h2>
            <p className="text-pink-200">Direct messages from brands</p>
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">About Nexus</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>✓ No vanity metrics displayed to public (focus on quality, not reach)</li>
            <li>✓ Your engagement stats are private (visible only in Analytics)</li>
            <li>✓ No dark patterns or engagement-baiting</li>
            <li>✓ Fair monetization via direct brand partnerships</li>
            <li>✓ Community-focused, not algorithm-driven</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
