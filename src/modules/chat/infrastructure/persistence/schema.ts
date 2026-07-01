import { pgTable, uuid, varchar, integer, timestamp, index, foreignKey, customType } from 'drizzle-orm/pg-core'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'

/** Raw binary column — maps Postgres bytea to/from a Node Buffer. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const chatAttachmentsTable = pgTable(
  'chat_attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // The chat thread this image belongs to (chats/{chatUserId} in Firestore) —
    // distinct from uploaderId so admin-sent images stay visible to the thread owner.
    chatUserId: uuid('chat_user_id').notNull(),
    uploaderId: uuid('uploader_id').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: integer('size').notNull(),
    data: bytea('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('chat_attachments_chat_user_idx').on(table.chatUserId),
    foreignKey({ columns: [table.chatUserId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.uploaderId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
  ],
)

export type ChatAttachmentRow = typeof chatAttachmentsTable.$inferSelect
export type NewChatAttachmentRow = typeof chatAttachmentsTable.$inferInsert
