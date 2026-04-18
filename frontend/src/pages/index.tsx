// Home page - Landing / Login redirect

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userType = localStorage.getItem('user_type'); // 'creator' or 'brand'

    if (token && userType) {
      router.push(userType === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Creator Marketplace</h1>
        <p className="text-xl text-gray-600 mb-8">Where creators meet brands.</p>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
