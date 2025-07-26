import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.NETLIFY_DATABASE_URL_UNPOOLED;

  if (!dbUrl) {
    console.warn('DATABASE_URL, NETLIFY_DATABASE_URL, or NETLIFY_DATABASE_URL_UNPOOLED environment variable is not set. PrismaClient might not connect correctly.');
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma