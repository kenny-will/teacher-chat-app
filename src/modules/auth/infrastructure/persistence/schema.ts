import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'

/**
 * Stores hashed session tokens.
 * The raw token lives only in the client cookie — the DB stores SHA-256(token).
 * This is the split-token pattern: a DB compromise does not expose live sessions.
 */
export const sessionsTable = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    /** SHA-256 hex digest of the raw session token sent in the cookie. */
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_token_hash_idx').on(table.tokenHash),
    index('sessions_expires_at_idx').on(table.expiresAt),
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
  ],
)

/**
 * Stores hashed passwords, decoupled from the user profile.
 * Allows multiple auth methods per user in the future (OAuth, passkeys).
 */
export const userCredentialsTable = pgTable(
  'user_credentials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().unique(),
    /** bcrypt(password, cost=12) */
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('credentials_user_id_idx').on(table.userId),
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
  ],
)

export type SessionRow = typeof sessionsTable.$inferSelect
export type NewSessionRow = typeof sessionsTable.$inferInsert
export type UserCredentialRow = typeof userCredentialsTable.$inferSelect
export type NewUserCredentialRow = typeof userCredentialsTable.$inferInsert
