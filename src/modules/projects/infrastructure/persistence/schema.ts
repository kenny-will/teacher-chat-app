import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'archived',
  'completed',
  'on_hold',
])

export const projectPriorityEnum = pgEnum('project_priority', ['low', 'medium', 'high', 'critical'])

export const projectMemberRoleEnum = pgEnum('project_member_role', [
  'owner',
  'contributor',
  'viewer',
])

export const projectsTable = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull().default('active'),
    priority: projectPriorityEnum('priority').notNull().default('medium'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    createdById: uuid('created_by_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('projects_status_idx').on(table.status),
    index('projects_created_by_idx').on(table.createdById),
    foreignKey({ columns: [table.createdById], foreignColumns: [usersTable.id] }).onDelete('cascade'),
  ],
)

export const projectMembersTable = pgTable(
  'project_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: projectMemberRoleEnum('role').notNull().default('contributor'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('project_members_project_idx').on(table.projectId),
    index('project_members_user_idx').on(table.userId),
    foreignKey({ columns: [table.projectId], foreignColumns: [projectsTable.id] }),
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
  ],
)

export type ProjectRow = typeof projectsTable.$inferSelect
export type NewProjectRow = typeof projectsTable.$inferInsert
export type ProjectMemberRow = typeof projectMembersTable.$inferSelect
export type NewProjectMemberRow = typeof projectMembersTable.$inferInsert
