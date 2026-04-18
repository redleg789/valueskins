// Creator Dashboard - Main view after login

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Opportunity {
  id: number;
  brand_name: string;
  title: string;
  reward_amount: number;
  category: string;
  deadline: string;
}

interface Deal {
  id: number;
  opportunity_id: number;
  brand_name: string;
  status: string;
  agreed_amount: number;
  deadline: string;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [creator, setCreator] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'deals' | 'earnings'>('opportunities');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch creator profile
    fetchCreatorProfile(token);
    fetchOpportunities(token);
    fetchDeals(token);
  }, []);

  const fetchCreatorProfile = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creators/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCreator(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOpportunities = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/opportunities/recommended`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setLoading(false);
    }
  };

  const fetchDeals = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/deals/my-deals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const applyToOpportunity = async (opportunityId: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/deals/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      });

      if (res.ok) {
        alert('Applied successfully!');
        fetchDeals(token!);
      } else {
        alert('Failed to apply');
      }
    } catch (error) {
      console.error('Error applying:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Creator Marketplace</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{creator?.name || 'Creator'}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active Deals</p>
            <p className="text-3xl font-bold">{deals.filter(d => d.status === 'active').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Completed Deals</p>
            <p className="text-3xl font-bold">{deals.filter(d => d.status === 'completed').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Earned</p>
            <p className="text-3xl font-bold">${(deals.reduce((sum, d) => sum + (d.agreed_amount || 0), 0) / 100).toFixed(0)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'opportunities'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Opportunities ({opportunities.length})
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'deals'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Deals ({deals.length})
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'earnings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Earnings
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'opportunities' && (
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <p className="text-gray-500">No opportunities available right now.</p>
                ) : (
                  opportunities.map(opp => (
                    <div key={opp.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-lg">{opp.title}</p>
                          <p className="text-gray-600 text-sm">by {opp.brand_name}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">${(opp.reward_amount / 100).toFixed(0)}</p>
                      </div>
                      <p className="text-gray-700 mb-3">{opp.category}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Deadline: {new Date(opp.deadline).toLocaleDateString()}</p>
                        <button
                          onClick={() => applyToOpportunity(opp.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="space-y-4">
                {deals.length === 0 ? (
                  <p className="text-gray-500">No deals yet. Apply to opportunities to get started!</p>
                ) : (
                  deals.map(deal => (
                    <div key={deal.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-lg">{deal.brand_name}</p>
                          <p className={`text-sm font-semibold ${
                            deal.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {deal.status.toUpperCase()}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">${(deal.agreed_amount / 100).toFixed(0)}</p>
                      </div>
                      <p className="text-sm text-gray-500">Deadline: {new Date(deal.deadline).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'earnings' && (
              <div>
                <p className="text-gray-600 mb-4">Payouts happen weekly on Mondays</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-lg mb-2">Next Payout</p>
                  <p className="text-2xl font-bold text-blue-600">${(deals.reduce((sum, d) => sum + (d.agreed_amount || 0), 0) / 100).toFixed(0)}</p>
                  <p className="text-sm text-gray-600 mt-2">Subject to 5% platform fee and applicable taxes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
