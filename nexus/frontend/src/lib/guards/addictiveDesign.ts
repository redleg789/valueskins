export const MAX_FEED_POSTS_PER_PAGE = 10
export const NOTIFICATION_HOUR_START = 8
export const NOTIFICATION_HOUR_END = 21
export const MAX_NOTIFICATIONS_PER_DAY = 1

export const shouldShowLoadMore = (offset: number, total: number): boolean => {
  return offset + MAX_FEED_POSTS_PER_PAGE < total
}

export const shouldSendNotification = (
  lastNotificationTime: number | null,
  currentHour: number
): boolean => {
  const now = Date.now()

  if (lastNotificationTime === null) return true

  const timeSinceLastNotification = now - lastNotificationTime
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const hasBeenADay = timeSinceLastNotification >= millisecondsPerDay

  const isWithinNotificationHours = currentHour >= NOTIFICATION_HOUR_START && currentHour < NOTIFICATION_HOUR_END

  return hasBeenADay && isWithinNotificationHours
}

export const getAddictiveDesignFeatures = (): { disabled: string[] } => {
  return {
    disabled: [
      'infinite_scroll',
      'streaks',
      'badges',
      'engagement_counters',
      'read_receipts',
      'typing_indicators',
      'social_validation_notifications',
      'push_notifications',
      'live_engagement_metrics'
    ]
  }
}
