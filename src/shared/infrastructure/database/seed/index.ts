/**
 * Master seed runner.
 * Run with: npm run db:seed
 *
 * Seeds are executed in dependency order:
 *   1. analytics (no deps)
 *   2. users (no deps)
 *   3. projects (depends on users)
 *   4. documents (depends on users)
 */
import { seedAnalytics } from './analytics.seed'
import { seedUsers } from './users.seed'
import { seedProjects } from './projects.seed'
import { seedDocuments } from './documents.seed'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'seed' })

async function main(): Promise<void> {
  log.info('Starting database seed…')

  try {
    await seedAnalytics()
    await seedUsers()
    await seedProjects()
    await seedDocuments()
    log.info('All seed data inserted successfully')
    process.exit(0)
  } catch (error) {
    log.error({ error }, 'Seed failed')
    process.exit(1)
  }
}

main()
