import { defineConfig } from 'drizzle-kit'

// Inline DATABASE_URL to avoid circular env import at config parse time
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required for drizzle-kit')
}

export default defineConfig({
  schema: [
    './src/modules/analytics/infrastructure/persistence/schema.ts',
    './src/modules/users/infrastructure/persistence/schema.ts',
    './src/modules/projects/infrastructure/persistence/schema.ts',
    './src/modules/documents/infrastructure/persistence/schema.ts',
    './src/modules/notifications/infrastructure/persistence/schema.ts',
    './src/modules/auth/infrastructure/persistence/schema.ts',
    './src/modules/financial/infrastructure/persistence/schema.ts',
    './src/modules/chat/infrastructure/persistence/schema.ts',
  ],
  out: './src/shared/infrastructure/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
