import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const anuncios = await prisma.anuncio.findMany({
    include: {
      niveles: true,
      grados: true,
    },
    orderBy: {
      fechaPublicacion: "desc",
    },
  });

  console.log(JSON.stringify(anuncios, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
