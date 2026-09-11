let PrismaClientClass: any;
try {
  // Dynamic requirement for Prisma Client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prismaPkg = require('@prisma/client');
  PrismaClientClass = prismaPkg.PrismaClient;
} catch (e) {
  PrismaClientClass = class DummyPrismaClient {};
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any =
  globalForPrisma.prisma ??
  (PrismaClientClass
    ? new PrismaClientClass({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : null);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
