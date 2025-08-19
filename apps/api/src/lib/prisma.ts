import { PrismaClient } from '../../generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['info', 'query', 'warn', 'error'],
  });

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}
