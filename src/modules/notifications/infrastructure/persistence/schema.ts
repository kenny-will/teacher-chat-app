import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'


export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'warning',
  'error',
  'success',
])

export const notificationSeverityEnum = pgEnum('notification_severity', [
  'low',
  'medium',
  'high',
  'critical',
])

export const notificationsTable = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    type: notificationTypeEnum('type').notNull().default('info'),
    severity: notificationSeverityEnum('severity').notNull().default('low'),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    actionUrl: varchar('action_url', { length: 1000 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
  },
  (table) => [
    index('notifications_user_idx').on(table.userId),
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_created_idx').on(table.createdAt),
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
  ],
)

export type NotificationRow = typeof notificationsTable.$inferSelect
export type NewNotificationRow = typeof notificationsTable.$inferInsert
