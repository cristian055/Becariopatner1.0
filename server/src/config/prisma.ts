import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

/**
 * Prisma Client Singleton
 * Manages database connection with proper lifecycle handling
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: unknown) => {
    const event = e as { query: string; duration: number }
    logger.debug(`Query: ${event.query} (${event.duration}ms)`, 'Prisma')
  })
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  logger.info('Prisma disconnected', 'Prisma')
})

export default prisma
