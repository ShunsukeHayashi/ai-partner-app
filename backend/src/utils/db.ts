/**
 * Prisma Client instance
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from './logger.js';

const logger = createLogger('database');

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug('Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on('error', (e: any) => {
  logger.error('Database error', e);
});

prisma.$on('warn', (e: any) => {
  logger.warn('Database warning', e);
});

export default prisma;
