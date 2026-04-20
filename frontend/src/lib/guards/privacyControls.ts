import { User } from '@/types'

export const getMinimalUserData = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatar: user.avatar
  }
}

export const canTrack = (): boolean => {
  return false
}

export const getDataExportPayload = (user: User) => {
  return {
    user: {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      created_at: user.created_at
    },
    exported_at: new Date().toISOString()
  }
}

export const downloadDataExport = (payload: any) => {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nexus-data-export-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const deleteAccountPermanently = async (userId: string) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: 'DELETE'
    })
    return { success: response.ok }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}

export const getPrivacyDashboardData = (user: User) => {
  return {
    data_collected: {
      profile: ['name', 'handle', 'bio', 'avatar', 'niches'],
      activity: ['posts created', 'deals applied', 'messages sent', 'deals completed'],
      interactions: ['direct messages', 'post comments']
    },
    data_not_collected: [
      'Location data',
      'Browsing history',
      'Device identifiers',
      'Third-party data',
      'Video/audio recordings',
      'Keystroke logs'
    ],
    tracking: 'No tracking. No analytics. No user monitoring.',
    data_sharing: 'Your data is never shared with third parties. Ever.',
    encryption: {
      messages: 'End-to-end encrypted (AEAD)',
      storage: 'AES-256-GCM at rest'
    }
  }
}
