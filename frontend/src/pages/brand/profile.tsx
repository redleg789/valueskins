import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BrandProfile() {
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/brands/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBrand(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-blue-600 mb-6">← Back</button>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-24 h-24 bg-gray-300 rounded"></div>
            <div>
              <h1 className="text-3xl font-bold">{brand?.name}</h1>
              <p className="text-gray-600">{brand?.website}</p>
              <p className="text-sm text-gray-500 mt-2">{brand?.description}</p>
              <div className="flex space-x-4 mt-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Active Campaigns</p>
              <p className="text-2xl font-bold">{brand?.active_campaigns || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Creators Partnered</p>
              <p className="text-2xl font-bold">{brand?.creators_partnered || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Spend</p>
              <p className="text-2xl font-bold">${(brand?.total_spend || 0) / 100}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Company Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Industry</span>
                <span className="font-semibold">{brand?.industry || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Founded</span>
                <span className="font-semibold">{brand?.founded_year || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
