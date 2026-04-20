import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface Deal {
  id: number
  title: string
  description: string
  budget: number
  creator_count: number
  brand?: { id: number; name: string }
  status: string
  createdAt: string
}

export default function DealsFeed() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchDeals()
  }, [router])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/deals?limit=10&offset=${offset}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch deals')
      }

      const data = await response.json()
      setDeals(prev => offset === 0 ? data.opportunities || [] : [...prev, ...(data.opportunities || [])])
      setHasMore((data.opportunities?.length || 0) >= 10)
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    const newOffset = offset + 10
    setOffset(newOffset)
    fetchDeals()
  }

  const handleApplyDeal = (dealId: number) => {
    router.push(`/deal/${dealId}`)
  }

  if (loading && deals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading deals...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Available Deals</h1>

        <div className="space-y-6">
          {deals.map(deal => (
            <div key={deal.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-2">{deal.title}</h2>
              <p className="text-gray-400 mb-4">{deal.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Budget</p>
                  <p className="text-lg font-semibold">${deal.budget}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Applicants</p>
                  <p className="text-lg font-semibold">{deal.creator_count}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="text-lg font-semibold capitalize">{deal.status}</p>
                </div>
              </div>

              {deal.brand && (
                <p className="text-sm text-gray-400 mb-4">
                  Posted by <span className="text-white font-semibold">{deal.brand.name}</span>
                </p>
              )}

              <button
                onClick={() => handleApplyDeal(deal.id)}
                className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 rounded transition"
              >
                View Deal
              </button>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Deals'}
            </button>
          </div>
        )}

        {!hasMore && deals.length > 0 && (
          <p className="text-center text-gray-400 mt-8">No more deals to load</p>
        )}
      </div>
    </div>
  )
}
