import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { clearDemoSession, getDemoToken } from '@/lib/demoSession';

export default function CreatorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'opportunities' | 'deals' | 'earnings'>('feed');
  const [creator] = useState({
    name: 'Sarah Chen',
    handle: '@sarahchen',
    followers: '248K',
    following: '156',
    engagement: '8.2%',
    avatar: '👩‍🎨',
    bio: 'Digital creator | Fashion & Lifestyle | She/Her 🌍',
    verified: true,
    coverImage: '🎨',
  });

  useEffect(() => {
    const token = getDemoToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  const opportunities = [
    { id: 1, brand: 'Nike', title: 'Air Max Campaign', reward: '$2,500', deadline: 'Apr 30' },
    { id: 2, brand: 'Apple', title: 'Product Demo', reward: '$5,000', deadline: 'May 15' },
    { id: 3, brand: 'Spotify', title: 'Playlist Feature', reward: '$1,200', deadline: 'May 10' },
  ];

  const deals = [
    { id: 1, brand: 'Nike', status: 'Active', amount: '$2,500', deadline: 'Apr 30' },
    { id: 2, brand: 'Apple', status: 'Pending', amount: '$5,000', deadline: 'May 15' },
  ];

  const handleLogout = () => {
    clearDemoSession();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nexus</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        {/* Sidebar */}
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Discover</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/creator/profile" className="block text-xl hover:text-blue-400">👤 Profile</a>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          {/* Cover + Profile */}
          <div className="border-b border-gray-700">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-6xl">
              {creator.coverImage}
            </div>
            <div className="p-4 pb-0">
              <div className="flex justify-between items-start mb-4">
                <div className="text-5xl -mt-16">{creator.avatar}</div>
                <button className="border border-gray-500 hover:border-white px-6 py-2 rounded-full font-bold">
                  Edit Profile
                </button>
              </div>
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              <p className="text-gray-500">{creator.handle}</p>
              <p className="text-white mt-2">{creator.bio}</p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span><strong className="text-white">{creator.followers}</strong> followers</span>
                <span><strong className="text-white">{creator.following}</strong> following</span>
                <span><strong className="text-white">{creator.engagement}</strong> engagement</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 flex">
            {['feed', 'opportunities', 'deals', 'earnings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 font-bold hover:bg-gray-900/50 transition ${
                  activeTab === tab ? 'border-b-2 border-blue-500 text-white' : 'text-gray-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-screen">
            {activeTab === 'feed' && (
              <div className="space-y-4 p-4">
                <div className="border border-gray-700 rounded-2xl p-4">
                  <textarea
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
                    rows={3}
                  />
                  <button className="mt-4 bg-blue-500 text-white font-bold px-8 py-2 rounded-full hover:bg-blue-600">
                    Post
                  </button>
                </div>
                {[
                  { text: 'Just wrapped an amazing collab with Nike! 🔥', likes: 2341 },
                  { text: 'New video out now on YouTube - link in bio', likes: 1523 },
                  { text: 'Excited to announce my partnership with Spotify', likes: 3421 },
                ].map((post, i) => (
                  <div key={i} className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50 cursor-pointer">
                    <p className="text-white">{post.text}</p>
                    <div className="mt-3 flex gap-6 text-gray-500 text-sm">
                      <button>💬</button>
                      <button>🔄</button>
                      <button>❤️ {post.likes}</button>
                      <button>📤</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="p-4 space-y-3">
                {opportunities.map(opp => (
                  <div key={opp.id} className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{opp.title}</h3>
                        <p className="text-gray-500">{opp.brand}</p>
                      </div>
                      <span className="text-lg font-bold text-green-400">{opp.reward}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-gray-500 text-sm">Due: {opp.deadline}</span>
                      <button className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full font-bold text-sm">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="p-4 space-y-3">
                {deals.map(deal => (
                  <div key={deal.id} className="border border-gray-700 rounded-2xl p-4 bg-gray-900/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{deal.brand}</h3>
                        <p className={`text-sm ${deal.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {deal.status}
                        </p>
                      </div>
                      <span className="text-lg font-bold">{deal.amount}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">Due: {deal.deadline}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="p-4">
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-2xl p-6">
                  <p className="text-gray-400 mb-2">Total Earned (This Month)</p>
                  <h2 className="text-4xl font-bold mb-4">$7,500</h2>
                  <p className="text-gray-400 text-sm mb-4">Next payout: Monday, April 21</p>
                  <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold">
                    Withdraw
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="border border-gray-700 rounded-2xl p-4">
                    <div className="flex justify-between">
                      <span>Nike Campaign</span>
                      <span className="font-bold">$2,500</span>
                    </div>
                  </div>
                  <div className="border border-gray-700 rounded-2xl p-4">
                    <div className="flex justify-between">
                      <span>Apple Demo</span>
                      <span className="font-bold">$5,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <input
              type="text"
              placeholder="Search Nexus"
              className="w-full bg-gray-800 text-white rounded-full px-4 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Recommended Brands</h3>
            <div className="space-y-3">
              {['Nike', 'Apple', 'Spotify'].map(brand => (
                <div key={brand} className="hover:bg-gray-800 p-2 rounded cursor-pointer">
                  <p className="font-bold">{brand}</p>
                  <p className="text-gray-500 text-sm">$2,000+ opportunities</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
