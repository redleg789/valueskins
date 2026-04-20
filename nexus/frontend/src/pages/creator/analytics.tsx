import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const getServerSideProps = async () => {
  return { props: {} };
};

export default function CreatorAnalytics() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageLikesPerPost: 0,
    topPost: null as any,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('auth_token');
    const userType = localStorage.getItem('user_type');

    if (!token || userType !== 'creator') {
      router.push('/auth/login');
      return;
    }

    fetchAnalytics();
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur p-4">
        <h1 className="text-2xl font-bold">Creator Analytics</h1>
        <p className="text-gray-400 text-sm">Your metrics (visible only to you)</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Likes</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalLikes}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Comments</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalComments}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Shares</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalShares}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Avg per Post</p>
            <p className="text-3xl font-bold mt-2">{metrics.averageLikesPerPost}</p>
          </div>
        </div>

        {metrics.topPost && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Best Post</h2>
            <p className="text-gray-300">{metrics.topPost.content}</p>
            <div className="flex gap-6 mt-4 text-sm text-gray-400">
              <span>❤️ {metrics.topPost.likes} likes</span>
              <span>💬 {metrics.topPost.comments} comments</span>
              <span>🔄 {metrics.topPost.shares} shares</span>
            </div>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <p className="text-blue-300 text-sm">
            💡 Your metrics are private. Other users see engagement actions but not counts. This keeps the focus on quality, not vanity metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
