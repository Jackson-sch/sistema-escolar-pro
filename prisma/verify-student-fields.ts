import { PrismaClient } from './client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🔍 Verifying Student CRUD with new fields...")

  // Get master data
  const estado = await prisma.estadoUsuario.findFirst()
  const institucion = await prisma.institucionEducativa.findFirst()

  if (!estado || !institucion) {
    throw new Error("❌ Missing master data (EstadoUsuario or InstitucionEducativa). Did you run seed?")
  }

  // 1. Create
  console.log("📝 Creating test student...")
  const newStudent = await prisma.user.create({
    data: {
      email: "test-verif-" + Date.now() + "@student.com",
      password: "password123",
      role: "estudiante", // using string directly as per schema/types sometimes, or verify enum
      name: "Test",
      apellidoPaterno: "Verified",
      apellidoMaterno: "Student",
      dni: "99" + Date.now().toString().slice(-6), // random unique
      sexo: "MASCULINO",
      fechaNacimiento: new Date("2010-01-01"),
      direccion: "Test Address",
      ubigeo: "123456",
      departamento: "TestDept",
      provincia: "TestProv",
      distrito: "TestDist",
      estadoId: estado.id,
      institucionId: institucion.id,

      // New fields to verify
      medicamentos: "Paracetamol",
      seguroMedico: "SIS",
      discapacidades: "Ninguna",
      carnetConadis: "C123",
      restriccionesAlimenticias: "Mani",
      centroSaludPreferido: "Hospital X",
      peso: 45.5,
      talla: 150,
      parentescoContactoEmergencia: "TIO",
      nombreContactoEmergencia2: "Juan Perez",
      telefonoContactoEmergencia2: "999888777",
      parentescoContactoEmergencia2: "ABUELO",
      paisNacimiento: "PERU",
      lugarNacimiento: "Lima",
      lenguaMaterna: "ESPAÑOL",
      religion: "CATOLICA",
      numeroHermanos: 2
    }
  })

  console.log(`✅ Created student with ID: ${newStudent.id}`)

  // Verify fields
  const verifyField = (field: string, expected: any, actual: any) => {
    if (actual !== expected) {
      throw new Error(`❌ Field '${field}': expected ${expected}, got ${actual}`)
    }
  }

  verifyField("medicamentos", "Paracetamol", newStudent.medicamentos)
  verifyField("seguroMedico", "SIS", newStudent.seguroMedico)
  verifyField("peso", 45.5, newStudent.peso)
  verifyField("talla", 150, newStudent.talla)
  verifyField("numeroHermanos", 2, newStudent.numeroHermanos)
  verifyField("paisNacimiento", "PERU", newStudent.paisNacimiento)

  console.log("✅ Create verification passed.")

  // 2. Update
  console.log("📝 Updating student...")
  const updatedStudent = await prisma.user.update({
    where: { id: newStudent.id },
    data: {
      peso: 50.0,
      medicamentos: "Ibuprofeno",
      numeroHermanos: 3
    }
  })

  verifyField("peso", 50.0, updatedStudent.peso)
  verifyField("medicamentos", "Ibuprofeno", updatedStudent.medicamentos)
  verifyField("numeroHermanos", 3, updatedStudent.numeroHermanos)

  console.log("✅ Update verification passed.")

  // 3. Delete
  console.log("🗑️ Deleting student...")
  await prisma.user.delete({ where: { id: newStudent.id } })
  console.log("✅ Delete verification passed.")
  
  // Verify deletion
  const deletedCheck = await prisma.user.findUnique({ where: { id: newStudent.id } })
  if (deletedCheck) throw new Error("❌ Student failed to delete")
    
  console.log("🎉 All validations passed successfully!")
}

main()
  .catch(e => {
    console.error("❌ Verification failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
