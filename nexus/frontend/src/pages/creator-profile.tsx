import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface CreatorProfile {
  id: number
  name: string
  handle: string
  bio: string
  avatar: string
  followers: number
  engagement_rate: number
  niches: string[]
  verified: boolean
  total_earnings: number
  deals_completed: number
}

export default function CreatorProfile() {
  const router = useRouter()
  const { id } = router.query
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchProfile()
  }, [id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const endpoint = id === 'me' ? '/api/creators?id=me' : `/api/creators?id=${id}`

      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data)
      setIsOwnProfile(id === 'me')
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Creator not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl">
              {profile.avatar || '👤'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.verified && <span className="text-blue-400">✓</span>}
              </div>
              <p className="text-gray-400 mb-4">@{profile.handle}</p>
              <p className="text-gray-300">{profile.bio}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-500 text-sm">Followers</p>
              <p className="text-2xl font-semibold">{profile.followers.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-500 text-sm">Engagement Rate</p>
              <p className="text-2xl font-semibold">{(profile.engagement_rate * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-500 text-sm">Deals Completed</p>
              <p className="text-2xl font-semibold">{profile.deals_completed}</p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-semibold">${profile.total_earnings.toLocaleString()}</p>
            </div>
          </div>

          {profile.niches && profile.niches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Niches</h3>
              <div className="flex flex-wrap gap-2">
                {profile.niches.map(niche => (
                  <span
                    key={niche}
                    className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isOwnProfile && (
            <div className="space-y-3 pt-6 border-t border-gray-700">
              <button className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 rounded transition">
                Edit Profile
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded transition">
                View My Deals
              </button>
            </div>
          )}

          {!isOwnProfile && (
            <button className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 rounded transition mt-8">
              Message Creator
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
