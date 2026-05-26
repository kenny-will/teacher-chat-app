import pino from 'pino'
import { env } from '@/shared/infrastructure/env'

const transport =
  env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined

/**
 * Structured application logger (pino).
 * Use child loggers for module-specific context:
 *   const log = logger.child({ module: 'users' })
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport,
})

export type Logger = typeof logger
