import { useState } from 'react'
import { User } from '@/types'
import { getPrivacyDashboardData, downloadDataExport, deleteAccountPermanently } from '@/lib/guards/privacyControls'

interface PrivacyDashboardProps {
  user: User
  onClose: () => void
}

export default function PrivacyDashboard({ user, onClose }: PrivacyDashboardProps) {
  const [deleting, setDeleting] = useState(false)
  const privacyData = getPrivacyDashboardData(user)

  const handleExportData = async () => {
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        created_at: new Date().toISOString()
      },
      exported_at: new Date().toISOString()
    }
    downloadDataExport(payload)
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete account permanently? This cannot be undone.')) return

    setDeleting(true)
    try {
      const result = await deleteAccountPermanently(user.id)
      if (result.success) {
        window.location.href = '/auth/login'
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded w-full max-w-2xl max-h-96 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Privacy & Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            X
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-white mb-2">What We Collect</h3>
            <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 space-y-1">
              <div>Profile: {privacyData.data_collected.profile.join(', ')}</div>
              <div>Activity: {privacyData.data_collected.activity.join(', ')}</div>
              <div>Messages: {privacyData.data_collected.interactions[0]}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">What We DON'T Collect</h3>
            <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
              {privacyData.data_not_collected.join(' • ')}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Tracking</h3>
            <div className="bg-gray-800 p-3 rounded text-sm text-green-400">
              ✓ {privacyData.tracking}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Data Sharing</h3>
            <div className="bg-gray-800 p-3 rounded text-sm text-green-400">
              ✓ {privacyData.data_sharing}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Security</h3>
            <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 space-y-1">
              <div>Messages: {privacyData.encryption.messages}</div>
              <div>Storage: {privacyData.encryption.storage}</div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleExportData}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2 rounded text-sm transition"
            >
              Download My Data (JSON)
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold py-2 rounded text-sm transition"
            >
              {deleting ? 'Deleting...' : 'Delete Account Permanently'}
            </button>
          </div>

          <div className="bg-gray-800 p-3 rounded text-xs text-gray-400">
            Your privacy is a right, not a feature. Nexus doesn't profit from your data.
          </div>
        </div>
      </div>
    </div>
  )
}
