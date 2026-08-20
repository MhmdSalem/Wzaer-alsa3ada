import path from "path";
import { PrismaClient } from "@prisma/client";

const url = `file:${path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}`;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
