import { db } from '@/shared/infrastructure/database/client'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'
import { projectsTable, projectMembersTable } from '@/modules/projects/infrastructure/persistence/schema'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'seed:projects' })

const PROJECT_NAMES = [
  'Meridian API v2 Migration',
  'Payment Rail Consolidation',
  'Auth Hardening — MFA',
  'Real-time Ledger Engine',
  'Compliance Dashboard',
  'Card Issuance Platform',
  'Treasury Sweep Automation',
  'Data Warehouse Migration',
  'Mobile SDK 3.0',
  'Fraud Detection ML Model',
  'ISO 27001 Certification',
  'Self-serve Onboarding',
  'Invoice Factoring Module',
  'SWIFT Integration Gateway',
  'FX Rate Engine',
  'Reporting Pipeline v3',
  'Webhook Event Bus',
  'Multi-currency Accounts',
  'Admin Console Redesign',
  'Platform Observability',
]

type ProjectStatus = 'active' | 'archived' | 'completed' | 'on_hold'
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'
type MemberRole = 'owner' | 'contributor' | 'viewer'

const STATUSES: ProjectStatus[] = ['active', 'active', 'active', 'active', 'completed', 'completed', 'archived', 'on_hold']
const PRIORITIES: ProjectPriority[] = ['low', 'medium', 'medium', 'high', 'high', 'critical']

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Seeds 20 projects with 2–8 members each.
 */
export async function seedProjects(): Promise<void> {
  log.info('Seeding projects…')

  const allUsers = await db.select({ id: usersTable.id }).from(usersTable)
  if (allUsers.length === 0) {
    log.warn('No users found — seed users first')
    return
  }

  await db.delete(projectMembersTable)
  await db.delete(projectsTable)

  const memberRoles: MemberRole[] = ['owner', 'contributor', 'contributor', 'viewer']

  for (let i = 0; i < PROJECT_NAMES.length; i++) {
    const createdBy = allUsers[i % allUsers.length]
    const status = STATUSES[i % STATUSES.length]

    const [project] = await db
      .insert(projectsTable)
      .values({
        name: PROJECT_NAMES[i],
        description: `${PROJECT_NAMES[i]} — internal engineering initiative`,
        status,
        priority: pick(PRIORITIES),
        dueDate: status === 'active' ? daysFromNow(30 + i * 7) : null,
        createdById: createdBy.id,
      })
      .returning()

    const memberCount = 2 + Math.floor(Math.random() * 7)
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5).slice(0, memberCount)

    const members = shuffled.map((u, mi) => ({
      projectId: project.id,
      userId: u.id,
      role: mi === 0 ? 'owner' as MemberRole : pick(memberRoles),
    }))

    await db.insert(projectMembersTable).values(members)
  }

  log.info({ count: PROJECT_NAMES.length }, 'Projects seeded')
}
