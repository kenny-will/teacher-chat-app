'use server'

import { DrizzleNotificationRepository } from '@/modules/notifications/infrastructure/persistence/notification.repository'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'notifications-queries' })
const repo = new DrizzleNotificationRepository()

/** Hardcoded current user id — replace with session-based user id when auth is wired. */
const DEMO_USER_ID = 'demo'

/**
 * Returns the count of unread notifications for the current user.
 * Returns 0 on error (non-critical UI element).
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const result = await repo.countUnread(DEMO_USER_ID)
  if (!result.success) {
    log.warn({ error: result.error }, 'Failed to fetch notification count')
    return 0
  }
  return result.data
}
