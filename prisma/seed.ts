import { PrismaClient } from "./client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando proceso de siembra de datos...")

  // 1. Cargos del Sistema
  console.log("- Sembrando Cargos...")
  const cargos = [
    // Nivel Directivo
    { codigo: "ADMIN_GLOBAL", nombre: "Administrador del Sistema", descripcion: "Acceso total a todas las funciones", jerarquia: 1, sistemico: true },
    { codigo: "DIRECTOR", nombre: "Director/a General", descripcion: "Máxima autoridad institucional", jerarquia: 2 },
    { codigo: "SUBDIRECTOR", nombre: "Subdirector/a", descripcion: "Apoyo a dirección general", jerarquia: 3 },
    // Nivel Académico
    { codigo: "COORD_ACAD", nombre: "Coordinador/a Académico/a", descripcion: "Supervisión de malla curricular", jerarquia: 4 },
    { codigo: "COORD_NIVEL", nombre: "Coordinador/a de Nivel", descripcion: "Por nivel (Inicial/Primaria/Secundaria)", jerarquia: 5 },
    { codigo: "DOCENTE", nombre: "Docente de Aula", descripcion: "Profesor titular de cursos", jerarquia: 6 },
    { codigo: "AUXILIAR", nombre: "Auxiliar de Educación", descripcion: "Apoyo en disciplina y acompañamiento", jerarquia: 7 },
    // Nivel Administrativo
    { codigo: "TESORERO", nombre: "Tesorero/a", descripcion: "Gestión de pagos y finanzas", jerarquia: 8 },
    { codigo: "SECRETARIA", nombre: "Secretario/a", descripcion: "Atención, documentos y archivo", jerarquia: 9 },
    { codigo: "PSICOLOGO", nombre: "Psicólogo/a", descripcion: "Bienestar estudiantil", jerarquia: 10 },
    { codigo: "ENFERMERIA", nombre: "Personal de Enfermería", descripcion: "Salud y primeros auxilios", jerarquia: 11 },
    { codigo: "SISTEMAS", nombre: "Soporte TI", descripcion: "Mantenimiento tecnológico", jerarquia: 12 },
    // Nivel de Servicios
    { codigo: "BIBLIOTECARIO", nombre: "Bibliotecario/a", descripcion: "Gestión de biblioteca", jerarquia: 13 },
    { codigo: "MANTENIMIENTO", nombre: "Personal de Mantenimiento", descripcion: "Limpieza e infraestructura", jerarquia: 14 },
    { codigo: "VIGILANCIA", nombre: "Personal de Vigilancia", descripcion: "Seguridad perimetral", jerarquia: 15 },
  ]

  let cargoAdmin: any
  for (const c of cargos) {
    const cargo = await prisma.cargo.upsert({
      where: { codigo: c.codigo },
      update: {},
      create: {
        codigo: c.codigo,
        nombre: c.nombre,
        descripcion: c.descripcion,
        jerarquia: c.jerarquia,
        sistemico: c.sistemico || false,
      },
    })
    if (c.codigo === "ADMIN_GLOBAL") cargoAdmin = cargo
  }

  // 2. Estados de Usuario
  console.log("- Sembrando Estados de Usuario...")
  const estadoActivo = await prisma.estadoUsuario.upsert({
    where: { codigo: "ACTIVO" },
    update: {},
    create: {
      codigo: "ACTIVO",
      nombre: "Activo",
      color: "#10b981",
      permiteLogin: true,
      esActivo: true,
      sistemico: true,
    },
  })

  // 3. Institución Educativa
  console.log("- Sembrando Institución por defecto...")
  const institucion = await prisma.institucionEducativa.upsert({
    where: { codigoModular: "1234567" },
    update: {},
    create: {
      codigoModular: "1234567",
      nombreInstitucion: "Colegio EduPeru Pro",
      nombreComercial: "EduPeru Pro",
      tipoGestion: "PRIVADA",
      modalidad: "PRESENCIAL",
      ugel: "UGEL 03",
      dre: "DRE LIMA",
      ubigeo: "150101",
      direccion: "Av. La Educación 123",
      distrito: "Lima",
      provincia: "Lima",
      departamento: "Lima",
      email: "contacto@eduperu.pro",
      fechaInicioClases: new Date("2025-03-01"),
      fechaFinClases: new Date("2025-12-20"),
    },
  })

  // 4. Niveles y Grados
  console.log("- Sembrando Niveles y Grados...")
  const niveles = [
    { nombre: "INICIAL", grados: ["3 años", "4 años", "5 años"] },
    { nombre: "PRIMARIA", grados: ["1ero", "2do", "3ero", "4to", "5to", "6to"] },
    { nombre: "SECUNDARIA", grados: ["1ero", "2do", "3ero", "4to", "5to"] },
  ]

  for (const n of niveles) {
    const nivel = await prisma.nivel.upsert({
      where: { institucionId_nombre: { institucionId: institucion.id, nombre: n.nombre } },
      update: {},
      create: {
        nombre: n.nombre,
        institucionId: institucion.id,
      },
    })

    for (let i = 0; i < n.grados.length; i++) {
      await prisma.grado.upsert({
        where: { nivelId_codigo: { nivelId: nivel.id, codigo: `G${i + 1}-${n.nombre.substring(0, 3)}` } },
        update: {},
        create: {
          nombre: n.grados[i],
          codigo: `G${i + 1}-${n.nombre.substring(0, 3)}`,
          orden: i + 1,
          nivelId: nivel.id,
        },
      })
    }
  }

  // 5. Usuario Administrador Inicial
  console.log("- Sembrando Usuario Administrador...")
  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@colegio.edu.pe" },
    update: {
      password: hashedPassword,
      cargoId: cargoAdmin.id,
      estadoId: estadoActivo.id,
      institucionId: institucion.id,
    },
    create: {
      email: "admin@colegio.edu.pe",
      name: "Administrador Global",
      password: hashedPassword,
      role: "administrativo",
      dni: "00000000",
      cargoId: cargoAdmin.id,
      estadoId: estadoActivo.id,
      institucionId: institucion.id,
    },
  })

  // 6. Tipos de Evaluación
  console.log("- Sembrando Tipos de Evaluación...")
  const tiposEval = [
    { codigo: "DIAG", nombre: "Diagnóstica", categoria: "DIAGNOSTICA" },
    { codigo: "FORM", nombre: "Formativa", categoria: "FORMATIVA" },
    { codigo: "SUMA", nombre: "Sumativa", categoria: "SUMATIVA" },
  ]

  for (const t of tiposEval) {
    await prisma.tipoEvaluacion.upsert({
      where: { codigo: t.codigo },
      update: {},
      create: {
        codigo: t.codigo,
        nombre: t.nombre,
        categoria: t.categoria,
        sistemico: true,
      },
    })
  }

  // 7. Categorías de Incidente / Seguimiento Psicopedagógico
  console.log("- Sembrando Categorías de Incidente...")
  const categoriasIncidente = [
    { nombre: "Conductual", descripcion: "Reportes relacionados con el comportamiento" },
    { nombre: "Académico", descripcion: "Dificultades o logros en el desempeño escolar" },
    { nombre: "Bienestar Emocional", descripcion: "Estado de ánimo y salud mental" },
    { nombre: "Salud / Enfermería", descripcion: "Atención médica básica" },
    { nombre: "Entrevista a Padres", descripcion: "Reuniones con tutores legales" },
    { nombre: "Seguimiento", descripcion: "Continuación de casos previos" },
  ]

  for (const c of categoriasIncidente) {
    await prisma.categoriaIncidente.upsert({
      where: { nombre: c.nombre },
      update: {},
      create: c,
    })
  }

  console.log("✅ Proceso de siembra finalizado con éxito.")
}

main()
  .catch((e) => {
    console.error("❌ Error en la siembra:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
