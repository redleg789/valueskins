import { useRouter } from 'next/router';

export default function BrandProfile() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nexus</h1>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_type');
              router.push('/auth/login');
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Browse Creators</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/brand/profile" className="block text-xl hover:text-blue-400">👤 Profile</a>
          </nav>
        </div>

        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          <div className="border-b border-gray-700">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-6xl">
              🏃
            </div>
            <div className="p-4">
              <div className="text-5xl mb-4 -mt-16">🏃</div>
              <h1 className="text-3xl font-bold">Nike</h1>
              <p className="text-gray-500">@nike</p>
              <p className="text-white mt-2">Just Do It. Athletic innovation for everyone.</p>
              <div className="flex gap-4 mt-4 text-sm">
                <span><strong className="text-white text-lg">2</strong> <span className="text-gray-500">campaigns</span></span>
                <span><strong className="text-white text-lg">68</strong> <span className="text-gray-500">applications</span></span>
                <span><strong className="text-white text-lg">$125K</strong> <span className="text-gray-500">spent</span></span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-700 p-4">
            <div className="space-y-2 text-sm">
              <p><strong>Verified:</strong> ✓ Official</p>
              <p><strong>Founded:</strong> 1972</p>
              <p><strong>Headquarters:</strong> Beaverton, Oregon</p>
              <p><strong>Website:</strong> nike.com</p>
              <p><strong>Focus Areas:</strong> Apparel, Footwear, Sports Equipment</p>
            </div>
          </div>

          <div className="border-b border-gray-700 p-4">
            <h3 className="font-bold mb-3">Active Campaigns</h3>
            <div className="space-y-3">
              {[
                { name: 'Air Max Campaign', budget: '$50,000', apps: 45 },
                { name: 'Summer Collection', budget: '$75,000', apps: 23 },
              ].map((campaign, i) => (
                <div key={i} className="border border-gray-700 rounded-2xl p-4 hover:bg-gray-900/50">
                  <p className="font-bold">{campaign.name}</p>
                  <div className="flex justify-between text-gray-500 text-sm mt-2">
                    <span>Budget: {campaign.budget}</span>
                    <span>{campaign.apps} applications</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
              Settings
            </button>
          </div>

          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Campaign Stats</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Avg. Cost per Creator</p>
                <p className="font-bold">$3,676</p>
              </div>
              <div>
                <p className="text-gray-500">Approval Rate</p>
                <p className="font-bold">62%</p>
              </div>
              <div>
                <p className="text-gray-500">ROI Estimate</p>
                <p className="font-bold text-green-400">3.2x</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
