import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { clearDemoSession, getDemoToken } from '@/lib/demoSession';

export default function BrandDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'applications' | 'deals' | 'analytics'>('campaigns');
  const [brand] = useState({
    name: 'Nike',
    handle: '@nike',
    logo: '🏃',
    bio: 'Just Do It. Athletic innovation for everyone.',
    verified: true,
  });

  useEffect(() => {
    const token = getDemoToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  const campaigns = [
    {
      id: 1,
      title: 'Air Max Campaign',
      budget: '$50,000',
      applications: 45,
      status: 'Active',
      deadline: 'Apr 30',
    },
    {
      id: 2,
      title: 'Summer Collection',
      budget: '$75,000',
      applications: 23,
      status: 'Active',
      deadline: 'May 15',
    },
  ];

  const applications = [
    {
      id: 1,
      creator: 'Sarah Chen',
      handle: '@sarahchen',
      followers: '248K',
      engagement: '8.2%',
      status: 'Pending',
    },
    {
      id: 2,
      creator: 'Alex Rivers',
      handle: '@alexrivers',
      followers: '512K',
      engagement: '12.1%',
      status: 'Approved',
    },
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
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Browse Creators</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/brand/profile" className="block text-xl hover:text-blue-400">👤 Profile</a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          {/* Brand Header */}
          <div className="border-b border-gray-700">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-6xl">
              {brand.logo}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{brand.name}</h1>
                  <p className="text-gray-500">{brand.handle}</p>
                </div>
                <button className="border border-gray-500 hover:border-white px-6 py-2 rounded-full font-bold">
                  Settings
                </button>
              </div>
              <p className="text-white">{brand.bio}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="border-b border-gray-700 p-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Active Campaigns</p>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Applications</p>
              <p className="text-2xl font-bold">68</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Spent</p>
              <p className="text-2xl font-bold">$125K</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 flex">
            {['campaigns', 'applications', 'deals', 'analytics'].map(tab => (
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
          <div className="min-h-screen p-4 space-y-4">
            {activeTab === 'campaigns' && (
              <>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
                  + Create Campaign
                </button>
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{campaign.title}</h3>
                        <p className="text-gray-500 text-sm">Budget: {campaign.budget}</p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        campaign.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{campaign.applications} applications</span>
                      <span>Due: {campaign.deadline}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold">{app.creator}</h3>
                        <p className="text-gray-500 text-sm">{app.handle}</p>
                        <p className="text-gray-500 text-sm">{app.followers} · {app.engagement} engagement</p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        app.status === 'Approved' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-bold">
                        Approve
                      </button>
                      <button className="flex-1 border border-gray-700 hover:border-red-500 py-2 rounded-lg text-sm font-bold">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="space-y-3">
                <div className="border border-gray-700 rounded-2xl p-4">
                  <h3 className="font-bold mb-2">Air Max Campaign Deal</h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Creator: Sarah Chen (@sarahchen)</p>
                    <p>Budget: $2,500</p>
                    <p className="text-green-400">Status: Active</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="border border-gray-700 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Total Spend (This Month)</p>
                  <h2 className="text-3xl font-bold">$125,000</h2>
                </div>
                <div className="border border-gray-700 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm mb-2">ROI Estimate</p>
                  <h2 className="text-3xl font-bold text-green-400">3.2x</h2>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Campaign Performance</p>
                <p className="font-bold">97% Complete</p>
              </div>
              <div>
                <p className="text-gray-500">Avg. Creator Reach</p>
                <p className="font-bold">512K followers</p>
              </div>
              <div>
                <p className="text-gray-500">Budget Utilization</p>
                <p className="font-bold">78%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
