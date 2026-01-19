
import { PrismaClient } from './prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Liam' } },
        { apellidoPaterno: { contains: 'Sebastian' } }
      ]
    },
    include: {
      nivelAcademico: { include: { grado: true } },
      matriculas: {
        include: {
          nivelAcademico: { include: { grado: true } }
        }
      }
    }
  })

  users.forEach(u => {
    console.log(`--- Student: ${u.name} ${u.apellidoPaterno} ---`)
    console.log(`User.nivelAcademicoId: ${u.nivelAcademicoId}`)
    console.log(`User Level Display: ${u.nivelAcademico?.grado?.nombre || 'None'} ${u.nivelAcademico?.seccion || ''}`)
    console.log("Matriculas:")
    u.matriculas.forEach(m => {
        console.log(` - ${m.anioAcademico}: ${m.nivelAcademico.grado.nombre} ${m.nivelAcademico.seccion} (ID: ${m.nivelAcademicoId})`)
    })
  })

  await prisma.$disconnect()
}

main()
