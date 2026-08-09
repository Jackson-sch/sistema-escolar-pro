import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const getPrismaClient = () => {
  if (globalThis.prisma && (globalThis.prisma as any).auditLog) {
    return globalThis.prisma;
  }
  const client = prismaClientSingleton();
  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
  }
  return client;
};

const prisma = getPrismaClient();

export default prisma;
