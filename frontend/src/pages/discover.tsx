import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Creator {
  id: number;
  name: string;
  username: string;
  followers: number;
  engagement_rate: number;
  tier: string;
  reputation_score: number;
  niche: string;
  platforms: string[];
}

export default function Discover() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const type = localStorage.getItem('user_type');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setUserType(type);
    fetchCreators(token);
  }, []);

  const fetchCreators = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creators/discover`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCreators(data.creators || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter((c) => {
    if (filter === 'all') return true;
    return c.tier.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 mb-6">← Back</button>

        <h1 className="text-3xl font-bold mb-8">Discover Creators</h1>

        <div className="mb-8 flex space-x-2">
          {['all', 'nano', 'micro', 'midtier', 'macro'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === tier
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer" onClick={() => router.push(`/creator/${creator.id}`)}>
              <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="p-6 -mt-12 relative">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 border-4 border-white"></div>
                <h3 className="text-lg font-bold text-center">{creator.name}</h3>
                <p className="text-gray-600 text-center text-sm">@{creator.username}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{(creator.followers / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-600">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{creator.engagement_rate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">Engagement</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{creator.tier}</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{creator.niche}</span>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm font-semibold">Score: {creator.reputation_score}/100</p>
                </div>

                {userType === 'brand' && (
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
                    View Profile
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
