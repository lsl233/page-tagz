import { PrismaClient } from "./generated/client";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaAdapter } from "@auth/prisma-adapter"

const prisma = new PrismaClient().$extends(withAccelerate())

const globalForPrisma = global as unknown as { prisma: typeof prisma }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const prismaAdapter = PrismaAdapter(prisma)

export { prisma, prismaAdapter };