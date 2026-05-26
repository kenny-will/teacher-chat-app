import { pgTable, uuid, varchar, text, timestamp, pgEnum, index, foreignKey } from 'drizzle-orm/pg-core'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'

export const documentTypeEnum = pgEnum('document_type', [
  'report',
  'presentation',
  'spreadsheet',
  'contract',
  'other',
])

export const documentStatusEnum = pgEnum('document_status', ['draft', 'review', 'published'])

export const documentsTable = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    type: documentTypeEnum('type').notNull().default('other'),
    status: documentStatusEnum('status').notNull().default('draft'),
    fileUrl: varchar('file_url', { length: 1000 }),
    ownerId: uuid('owner_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('documents_owner_idx').on(table.ownerId),
    index('documents_status_idx').on(table.status),
    index('documents_type_idx').on(table.type),
    foreignKey({ columns: [table.ownerId], foreignColumns: [usersTable.id] }),
  ],
)

export type DocumentRow = typeof documentsTable.$inferSelect
export type NewDocumentRow = typeof documentsTable.$inferInsert
