let PrismaClientClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prismaPkg = require('@prisma/client');
  PrismaClientClass = prismaPkg.PrismaClient;
} catch (e) {
  PrismaClientClass = class DummyPrismaClient {};
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const hasDatabaseUrl = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('username:password');

export const prisma: any =
  globalForPrisma.prisma ??
  (PrismaClientClass && hasDatabaseUrl
    ? new PrismaClientClass({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    : null);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

