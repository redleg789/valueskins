// Brand Dashboard - Main view after login

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Opportunity {
  id: number;
  title: string;
  category: string;
  reward_amount: number;
  deadline: string;
  status: string;
  applications_count: number;
}

interface Application {
  id: number;
  opportunity_id: number;
  creator_name: string;
  creator_platform: string;
  creator_followers: number;
  reputation_score: number;
  status: string;
}

interface Deal {
  id: number;
  opportunity_id: number;
  creator_name: string;
  status: string;
  agreed_amount: number;
  deadline: string;
}

export default function BrandDashboard() {
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState<'post' | 'applications' | 'deals' | 'analytics'>('post');
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    reward_amount: '',
    deadline: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchBrandProfile(token);
    fetchOpportunities(token);
    fetchApplications(token);
    fetchDeals(token);
  }, []);

  const fetchBrandProfile = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/brands/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBrand(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOpportunities = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/brands/opportunities`, {
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

  const fetchApplications = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/brands/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchDeals = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/brands/deals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const postOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/opportunities/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          reward_amount: parseInt(formData.reward_amount) * 100,
          deadline: formData.deadline,
        }),
      });

      if (res.ok) {
        alert('Opportunity posted successfully!');
        setFormData({ title: '', description: '', category: '', reward_amount: '', deadline: '' });
        setShowPostForm(false);
        fetchOpportunities(token!);
      } else {
        alert('Failed to post opportunity');
      }
    } catch (error) {
      console.error('Error posting opportunity:', error);
    }
  };

  const acceptApplication = async (applicationId: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/${applicationId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Application accepted!');
        fetchApplications(token!);
        fetchDeals(token!);
      } else {
        alert('Failed to accept application');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
    }
  };

  const rejectApplication = async (applicationId: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Application rejected');
        fetchApplications(token!);
      } else {
        alert('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
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

  const activeApplications = applications.filter(a => a.status === 'pending');
  const totalSpend = deals.reduce((sum, d) => sum + (d.agreed_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Creator Marketplace</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{brand?.name || 'Brand'}</span>
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
            <p className="text-gray-600 text-sm">Active Opportunities</p>
            <p className="text-3xl font-bold">{opportunities.filter(o => o.status === 'active').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Applications Received</p>
            <p className="text-3xl font-bold">{activeApplications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Spend</p>
            <p className="text-3xl font-bold">${(totalSpend / 100).toFixed(0)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'post'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Post Opportunity
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'applications'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Applications ({activeApplications.length})
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
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'post' && (
              <div>
                {!showPostForm ? (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                  >
                    + Post New Opportunity
                  </button>
                ) : (
                  <form onSubmit={postOpportunity} className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Opportunity Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="e.g., Instagram Reel for Product Launch"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Description</label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Describe what you need..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">Select category</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Tech">Tech</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Fitness">Fitness</option>
                          <option value="Food">Food</option>
                          <option value="Travel">Travel</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1">Reward Amount ($)</label>
                        <input
                          type="number"
                          required
                          min="100"
                          value={formData.reward_amount}
                          onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="2500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Deadline</label>
                      <input
                        type="date"
                        required
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        Post Opportunity
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPostForm(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {opportunities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Your Opportunities</h3>
                    <div className="space-y-3">
                      {opportunities.map((opp) => (
                        <div key={opp.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">{opp.title}</p>
                              <p className="text-sm text-gray-600">{opp.category}</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">${(opp.reward_amount / 100).toFixed(0)}</p>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <p className="text-sm text-gray-500">Deadline: {new Date(opp.deadline).toLocaleDateString()}</p>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                              {opp.applications_count} applications
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-4">
                {activeApplications.length === 0 ? (
                  <p className="text-gray-500">No pending applications yet. Post opportunities to receive applications!</p>
                ) : (
                  activeApplications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">{app.creator_name}</p>
                          <p className="text-sm text-gray-600">{app.creator_platform}</p>
                          <p className="text-sm text-gray-600">{app.creator_followers?.toLocaleString() || 0} followers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">Score</p>
                          <p className="text-lg font-semibold">{app.reputation_score}/100</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => acceptApplication(app.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectApplication(app.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Reject
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
                  <p className="text-gray-500">No deals yet. Accept applications to create deals!</p>
                ) : (
                  deals.map((deal) => (
                    <div key={deal.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-lg">{deal.creator_name}</p>
                          <p className={`text-sm font-semibold ${
                            deal.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {deal.status.toUpperCase()}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">${(deal.agreed_amount / 100).toFixed(0)}</p>
                      </div>
                      <p className="text-sm text-gray-500">Deadline: {new Date(deal.deadline).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">Total Opportunities Posted</p>
                    <p className="text-3xl font-bold text-blue-600">{opportunities.length}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">Deals Completed</p>
                    <p className="text-3xl font-bold text-green-600">{deals.filter(d => d.status === 'completed').length}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">Average Deal Value</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ${deals.length > 0 ? (totalSpend / deals.length / 100).toFixed(0) : 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">Application Response Rate</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {opportunities.length > 0
                        ? ((applications.length / opportunities.length / 2) * 100).toFixed(0)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
