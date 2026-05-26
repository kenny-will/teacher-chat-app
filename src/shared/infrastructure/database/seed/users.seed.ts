import { db } from '@/shared/infrastructure/database/client'
import { usersTable } from '@/modules/users/infrastructure/persistence/schema'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'seed:users' })

const NAMES = [
  'Sara Patel', 'James Liu', 'Maria Garcia', 'David Kim', 'Emma Thompson',
  'Noah Williams', 'Olivia Martinez', 'Liam Johnson', 'Ava Brown', 'Lucas Davis',
  'Isabella Wilson', 'Mason Anderson', 'Sophia Taylor', 'Ethan Thomas', 'Charlotte Jackson',
  'Aiden White', 'Mia Harris', 'Logan Martin', 'Amelia Lee', 'Caleb Perez',
  'Harper Lewis', 'Elijah Walker', 'Evelyn Hall', 'Sebastian Allen', 'Abigail Young',
  'Jack Hernandez', 'Emily King', 'Owen Wright', 'Elizabeth Scott', 'Samuel Green',
  'Layla Baker', 'Benjamin Adams', 'Aria Nelson', 'Wyatt Carter', 'Chloe Mitchell',
  'Jackson Perez', 'Scarlett Roberts', 'Henry Turner', 'Zoey Phillips', 'Daniel Evans',
  'Nora Edwards', 'Michael Collins', 'Riley Stewart', 'Carter Sanchez', 'Penelope Morris',
  'Julian Rogers', 'Lillian Reed', 'Grayson Cook', 'Naomi Morgan', 'Isaac Bell',
]

function emailFrom(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + '@meridian.io'
}

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

type UserRole = 'admin' | 'editor' | 'viewer'
type UserStatus = 'active' | 'inactive' | 'suspended'

/**
 * Seeds 50 users with realistic distribution of roles and statuses.
 * Roles: 3 admins, 12 editors, 35 viewers
 * Statuses: 43 active, 5 inactive, 2 suspended
 */
export async function seedUsers(): Promise<void> {
  log.info('Seeding users…')

  const users = NAMES.map((name, i) => {
    let role: UserRole = 'viewer'
    if (i < 3) role = 'admin'
    else if (i < 15) role = 'editor'

    let status: UserStatus = 'active'
    if (i >= 43 && i < 48) status = 'inactive'
    if (i >= 48) status = 'suspended'

    const lastLoginDaysAgo = Math.floor(Math.random() * 90)

    return {
      email: emailFrom(name),
      name,
      avatarUrl: avatarUrl(name),
      role,
      status,
      lastLoginAt: daysAgo(lastLoginDaysAgo),
      createdAt: daysAgo(30 + Math.floor(Math.random() * 335)),
    }
  })

  await db.delete(usersTable)
  await db.insert(usersTable).values(users)

  log.info({ count: users.length }, 'Users seeded')
}
