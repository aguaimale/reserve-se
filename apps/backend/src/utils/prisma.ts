import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
   prisma: PrismaClient | undefined;
};

export const prisma =
   globalForPrisma.prisma ??
   new PrismaClient({
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
            level: 'info',
         },
         {
            emit: 'event',
            level: 'warn',
         },
      ],
   });

if (process.env.NODE_ENV !== 'production') {
   globalForPrisma.prisma = prisma;
}

// Log queries in development
if (process.env.NODE_ENV === 'development') {
   (prisma as any).$on('query', (e: any) => {
      logger.debug(
         {
            query: e.query,
            params: e.params,
            duration: e.duration,
         },
         'Database query'
      );
   });
}

(prisma as any).$on('error', (e: any) => {
   logger.error(e, 'Database error');
});

// Test connection
prisma
   .$connect()
   .then(() => {
      logger.info('Connected to database');
   })
   .catch((error: any) => {
      logger.error(error, 'Failed to connect to database');
      process.exit(1);
   });
