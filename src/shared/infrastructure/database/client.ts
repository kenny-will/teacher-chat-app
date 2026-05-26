import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/shared/infrastructure/env'

/** Singleton postgres connection — re-used across hot reloads in development. */
declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined
}

function createClient(): ReturnType<typeof postgres> {
  return postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

const pgClient = globalThis.__pgClient ?? createClient()

if (env.NODE_ENV !== 'production') {
  globalThis.__pgClient = pgClient
}

/** The Drizzle ORM database client. Import this in repositories only — never in components or actions directly. */
export const db = drizzle(pgClient)

export type Database = typeof db
