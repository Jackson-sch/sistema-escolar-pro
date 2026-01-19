
import { PrismaClient } from './prisma/client'
const prisma = new PrismaClient()

async function diagnostic() {
  const liam = await prisma.user.findFirst({
    where: { name: { contains: 'Liam' } },
    include: {
      nivelAcademico: { include: { grado: true } },
      matriculas: {
        include: {
          nivelAcademico: { include: { grado: true } }
        }
      },
      cronogramaPagos: {
        include: {
          concepto: true
        }
      }
    }
  })

  if (!liam) {
    console.log("Liam not found")
    return
  }

  console.log("USER DATA:")
  console.log(`ID: ${liam.id}`)
  console.log(`Name: ${liam.name} ${liam.apellidoPaterno}`)
  console.log(`User.nivelAcademico: ${liam.nivelAcademico?.grado?.nombre} ${liam.nivelAcademico?.seccion}`)

  console.log("\nENROLLMENTS (Matriculas):")
  liam.matriculas.forEach(m => {
    console.log(`Year: ${m.anioAcademico}, Grade: ${m.nivelAcademico.grado.nombre} ${m.nivelAcademico.seccion}, ID: ${m.id}`)
  })

  console.log("\nFINANCIAL RECORDS (CronogramaPago):")
  liam.cronogramaPagos.forEach(cp => {
    console.log(`Concept: ${cp.concepto.nombre}, Amount: ${cp.monto}, Date: ${cp.fechaVencimiento}`)
  })

  await prisma.$disconnect()
}

diagnostic()
