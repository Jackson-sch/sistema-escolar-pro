import prisma from "@/lib/prisma";

async function checkRelations() {
  const padreId = "cmljqhdpm0001egtj58xyaatm";
  try {
    const relaciones = await prisma.relacionFamiliar.findMany({
      where: { padreTutorId: padreId },
      include: {
        hijo: {
          include: {
            nivelAcademico: true,
          },
        },
      },
    });

    relaciones.forEach((r) => {
      console.log(`Child: ${r.hijo.name} (ID: ${r.hijo.id})`);
      console.log(`Grade Profile Name: ${r.hijo.nivelAcademico?.nombre}`);
      console.log(`---`);
    });
  } catch (e) {
    console.error(e);
  }
}

checkRelations();
