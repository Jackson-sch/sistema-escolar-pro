import prisma from "./src/lib/prisma";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'master@sistema.pro' },
    select: { id: true, email: true, role: true }
  });
  console.log("DB_USER:", JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
