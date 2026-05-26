/** Validated environment variables. Fails fast at startup if required vars are missing. */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  NODE_ENV: optionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
} as const
