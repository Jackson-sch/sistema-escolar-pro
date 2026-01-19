import { PrismaClient } from "../prisma/client"

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { nombre: "Indisciplina", descripcion: "Comportamiento contrario a las normas de convivencia." },
    { nombre: "Mérito", descripcion: "Reconocimiento por acciones destacadas." },
    { nombre: "Seguimiento Psicológico", descripcion: "Sesiones de apoyo y orientación emocional." },
    { nombre: "Entrevista a Padres", descripcion: "Reuniones de coordinación con la familia." },
    { nombre: "Asistencia Social", descripcion: "Visitas o gestiones de bienestar social." },
  ]

  console.log("Seeding incident categories...")

  for (const cat of categories) {
    await prisma.categoriaIncidente.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    })
  }

  console.log("Seeding completed successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
