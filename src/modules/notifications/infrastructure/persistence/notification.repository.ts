import { eq, and, count, desc } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/client'
import { notificationsTable } from './schema'
import { NotificationEntity } from '@/modules/notifications/domain/entities/notification.entity'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'notification-repository' })

export class DrizzleNotificationRepository {
  /**
   * Returns the count of unread notifications for a user.
   * @param userId - The user's UUID
   * @returns Result<number>
   */
  async countUnread(userId: string): Promise<Result<number>> {
    try {
      const [{ total }] = await db
        .select({ total: count() })
        .from(notificationsTable)
        .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)))
      return ok(Number(total))
    } catch (error) {
      log.error({ error, userId }, 'countUnread failed')
      return err(new Error('Failed to count unread notifications', { cause: error }))
    }
  }

  /**
   * Returns the most recent notifications for a user.
   * @param userId - The user's UUID
   * @param limit - Max notifications to return
   * @returns Result<NotificationEntity[]>
   */
  async findRecent(userId: string, limit = 10): Promise<Result<NotificationEntity[]>> {
    try {
      const rows = await db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.userId, userId))
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)

      return ok(
        rows.map((row) =>
          NotificationEntity.create({
            id: row.id,
            userId: row.userId,
            type: row.type,
            severity: row.severity,
            title: row.title,
            message: row.message,
            isRead: row.isRead,
            actionUrl: row.actionUrl ?? null,
            readAt: row.readAt ?? null,
            createdAt: row.createdAt,
          }),
        ),
      )
    } catch (error) {
      log.error({ error, userId }, 'findRecent failed')
      return err(new Error('Failed to find recent notifications', { cause: error }))
    }
  }
}
