import { PrismaClient } from "./client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { studentsSeed } from "./students";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando proceso de siembra de datos...");

  // 1. Cargos del Sistema
  console.log("- Sembrando Cargos...");
  const cargos = [
    // Nivel Directivo
    {
      codigo: "ADMIN_GLOBAL",
      nombre: "Administrador del Sistema",
      descripcion: "Acceso total a todas las funciones",
      jerarquia: 1,
      sistemico: true,
    },
    {
      codigo: "DIRECTOR",
      nombre: "Director/a General",
      descripcion: "Máxima autoridad institucional",
      jerarquia: 2,
    },
    {
      codigo: "SUBDIRECTOR",
      nombre: "Subdirector/a",
      descripcion: "Apoyo a dirección general",
      jerarquia: 3,
    },
    // Nivel Académico
    {
      codigo: "COORD_ACAD",
      nombre: "Coordinador/a Académico/a",
      descripcion: "Supervisión de malla curricular",
      jerarquia: 4,
    },
    {
      codigo: "COORD_NIVEL",
      nombre: "Coordinador/a de Nivel",
      descripcion: "Por nivel (Inicial/Primaria/Secundaria)",
      jerarquia: 5,
    },
    {
      codigo: "DOCENTE",
      nombre: "Docente de Aula",
      descripcion: "Profesor titular de cursos",
      jerarquia: 6,
    },
    {
      codigo: "AUXILIAR",
      nombre: "Auxiliar de Educación",
      descripcion: "Apoyo en disciplina y acompañamiento",
      jerarquia: 7,
    },
    // Nivel Administrativo
    {
      codigo: "TESORERO",
      nombre: "Tesorero/a",
      descripcion: "Gestión de pagos y finanzas",
      jerarquia: 8,
    },
    {
      codigo: "SECRETARIA",
      nombre: "Secretario/a",
      descripcion: "Atención, documentos y archivo",
      jerarquia: 9,
    },
    {
      codigo: "PSICOLOGO",
      nombre: "Psicólogo/a",
      descripcion: "Bienestar estudiantil",
      jerarquia: 10,
    },
    {
      codigo: "ENFERMERIA",
      nombre: "Personal de Enfermería",
      descripcion: "Salud y primeros auxilios",
      jerarquia: 11,
    },
    {
      codigo: "SISTEMAS",
      nombre: "Soporte TI",
      descripcion: "Mantenimiento tecnológico",
      jerarquia: 12,
    },
    // Nivel de Servicios
    {
      codigo: "BIBLIOTECARIO",
      nombre: "Bibliotecario/a",
      descripcion: "Gestión de biblioteca",
      jerarquia: 13,
    },
    {
      codigo: "MANTENIMIENTO",
      nombre: "Personal de Mantenimiento",
      descripcion: "Limpieza e infraestructura",
      jerarquia: 14,
    },
    {
      codigo: "VIGILANCIA",
      nombre: "Personal de Vigilancia",
      descripcion: "Seguridad perimetral",
      jerarquia: 15,
    },
  ];

  let cargoAdmin: any;
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
    });
    if (c.codigo === "ADMIN_GLOBAL") cargoAdmin = cargo;
  }

  // 2. Estados de Usuario
  console.log("- Sembrando Estados de Usuario...");
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
  });

  // 3. Institución Educativa
  console.log("- Sembrando Institución por defecto...");
  const institucion = await prisma.institucionEducativa.upsert({
    where: { codigoModular: "1234567" },
    update: {},
    create: {
      codigoModular: "1234567",
      nombreInstitucion: "Colegio EduPeru Pro",
      nombreComercial: "EduPeru Pro",
      tipoGestion: "PRIVADA",
      modalidad: "PRESENCIAL",
      ugel: "UGEL 01",
      dre: "DRE LA LIBERTAD",
      ubigeo: "130101",
      direccion: "Av. La Educación 123",
      distrito: "Trujillo",
      provincia: "Trujillo",
      departamento: "La Libertad",
      email: "contacto@eduperu.pro",
      fechaInicioClases: new Date("2025-03-01"),
      fechaFinClases: new Date("2025-12-20"),
    },
  });

  // 4. Niveles y Grados
  console.log("- Sembrando Niveles y Grados...");
  const niveles = [
    { nombre: "INICIAL", grados: ["3 años", "4 años", "5 años"] },
    {
      nombre: "PRIMARIA",
      grados: ["1ero", "2do", "3ero", "4to", "5to", "6to"],
    },
    { nombre: "SECUNDARIA", grados: ["1ero", "2do", "3ero", "4to", "5to"] },
  ];

  for (const n of niveles) {
    const nivel = await prisma.nivel.upsert({
      where: {
        institucionId_nombre: {
          institucionId: institucion.id,
          nombre: n.nombre,
        },
      },
      update: {},
      create: {
        nombre: n.nombre,
        institucionId: institucion.id,
      },
    });

    for (let i = 0; i < n.grados.length; i++) {
      await prisma.grado.upsert({
        where: {
          nivelId_codigo: {
            nivelId: nivel.id,
            codigo: `G${i + 1}-${n.nombre.substring(0, 3)}`,
          },
        },
        update: {},
        create: {
          nombre: n.grados[i],
          codigo: `G${i + 1}-${n.nombre.substring(0, 3)}`,
          orden: i + 1,
          nivelId: nivel.id,
        },
      });
    }
  }

  // 5. Usuario Administrador Inicial
  console.log("- Sembrando Usuario Administrador...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

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
  });

  // 6. Tipos de Evaluación
  console.log("- Sembrando Tipos de Evaluación...");
  const tiposEval = [
    { codigo: "DIAG", nombre: "Diagnóstica", categoria: "DIAGNOSTICA" },
    { codigo: "FORM", nombre: "Formativa", categoria: "FORMATIVA" },
    { codigo: "SUMA", nombre: "Sumativa", categoria: "SUMATIVA" },
  ];

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
    });
  }

  // 7. Categorías de Incidente / Seguimiento Psicopedagógico
  console.log("- Sembrando Categorías de Incidente...");
  const categoriasIncidente = [
    {
      nombre: "Conductual",
      descripcion: "Reportes relacionados con el comportamiento",
    },
    {
      nombre: "Académico",
      descripcion: "Dificultades o logros en el desempeño escolar",
    },
    {
      nombre: "Bienestar Emocional",
      descripcion: "Estado de ánimo y salud mental",
    },
    { nombre: "Salud / Enfermería", descripcion: "Atención médica básica" },
    {
      nombre: "Entrevista a Padres",
      descripcion: "Reuniones con tutores legales",
    },
    { nombre: "Seguimiento", descripcion: "Continuación de casos previos" },
  ];

  // 8. Áreas Curriculares y Competencias (Malla Curricular)
  console.log("- Sembrando Malla Curricular (Áreas y Competencias)...");
  const mallaCurricular = [
    {
      nombre: "Matemática",
      codigo: "MAT",
      color: "#3b82f6",
      competencias: [
        "Resuelve problemas de cantidad",
        "Resuelve problemas de regularidad, equivalencia y cambio",
        "Resuelve problemas de forma, movimiento y localización",
        "Resuelve problemas de gestión de datos e incertidumbre",
      ],
    },
    {
      nombre: "Comunicación",
      codigo: "COM",
      color: "#ef4444",
      competencias: [
        "Se comunica oralmente en su lengua materna",
        "Lee diversos tipos de textos escritos en su lengua materna",
        "Escribe diversos tipos de textos en su lengua materna",
      ],
    },
    {
      nombre: "Ciencia y Tecnología",
      codigo: "CYT",
      color: "#10b981",
      competencias: [
        "Indaga mediante métodos científicos para construir sus conocimientos",
        "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
        "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
      ],
    },
    {
      nombre: "Personal Social",
      codigo: "PS",
      color: "#f59e0b",
      competencias: [
        "Construye su identidad",
        "Convive y participa democráticamente en la búsqueda del bien común",
        "Gestiona responsablemente el espacio y el ambiente",
        "Gestiona responsablemente los recursos económicos",
        "Interpreta críticamente fuentes diversas",
      ],
    },
    {
      nombre: "Inglés",
      codigo: "ING",
      color: "#6366f1",
      competencias: [
        "Se comunica oralmente en inglés como lengua extranjera",
        "Lee diversos tipos de textos en inglés como lengua extranjera",
        "Escribe diversos tipos de textos en inglés como lengua extranjera",
      ],
    },
    {
      nombre: "Educación Religiosa",
      codigo: "REL",
      color: "#8b5cf6",
      competencias: [
        "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente",
        "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa",
      ],
    },
    {
      nombre: "Computación",
      codigo: "COMP",
      color: "#06b6d4",
      competencias: [
        "Se desenvuelve en los entornos virtuales generados por las TIC",
        "Gestiona su aprendizaje de manera autónoma",
      ],
    },
  ];

  for (const a of mallaCurricular) {
    const area = await prisma.areaCurricular.upsert({
      where: {
        codigo_institucionId: {
          codigo: a.codigo,
          institucionId: institucion.id,
        },
      },
      update: {
        nombre: a.nombre,
        color: a.color,
      },
      create: {
        nombre: a.nombre,
        codigo: a.codigo,
        color: a.color,
        institucionId: institucion.id,
      },
    });

    for (const comp of a.competencias) {
      await prisma.competencia.create({
        data: {
          nombre: comp,
          areaCurricularId: area.id,
        },
      });
    }
  }

  // 9. Sedes y Secciones (Nivel Académico)
  console.log("- Sembrando Sedes y Secciones...");
  const sedeCentral = await prisma.sede.upsert({
    where: {
      institucionId_nombre: {
        institucionId: institucion.id,
        nombre: "Sede Central",
      },
    },
    update: {},
    create: {
      nombre: "Sede Central",
      direccion: "Av. Principal 456",
      institucionId: institucion.id,
    },
  });

  // Obtener grados para primaria
  const nivelPrimaria = await prisma.nivel.findFirst({
    where: { nombre: "PRIMARIA", institucionId: institucion.id },
  });

  const gradosPrimaria = await prisma.grado.findMany({
    where: { nivelId: nivelPrimaria?.id },
  });

  const secciones = [];
  for (const grado of gradosPrimaria) {
    const seccion = await prisma.nivelAcademico.upsert({
      where: {
        nivelId_gradoId_seccion_anioAcademico_institucionId: {
          nivelId: nivelPrimaria!.id,
          gradoId: grado.id,
          seccion: "A",
          anioAcademico: 2026,
          institucionId: institucion.id,
        },
      },
      update: {},
      create: {
        seccion: "A",
        nivelId: nivelPrimaria!.id,
        gradoId: grado.id,
        institucionId: institucion.id,
        sedeId: sedeCentral.id,
        anioAcademico: 2026,
        turno: "MANANA",
      },
    });
    secciones.push(seccion);
  }

  // 10. Docentes (Teachers)
  console.log("- Sembrando Docentes de Prueba...");
  const docenteCargo = await prisma.cargo.findUnique({
    where: { codigo: "DOCENTE" },
  });
  const docentesData = [
    {
      name: "Ana",
      apellidoPaterno: "Garcia",
      apellidoMaterno: "Lopez",
      email: "ana.garcia@eduperu.pro",
      dni: "11111111",
    },
    {
      name: "Carlos",
      apellidoPaterno: "Mendoza",
      apellidoMaterno: "Ruiz",
      email: "carlos.mendoza@eduperu.pro",
      dni: "22222222",
    },
    {
      name: "Elena",
      apellidoPaterno: "Ruiz",
      apellidoMaterno: "Bravo",
      email: "elena.ruiz@eduperu.pro",
      dni: "33333333",
    },
  ];

  const docentes = [];
  for (const d of docentesData) {
    const docente = await prisma.user.upsert({
      where: { email: d.email },
      update: {
        name: d.name,
        apellidoPaterno: d.apellidoPaterno,
        apellidoMaterno: d.apellidoMaterno,
      },
      create: {
        name: d.name,
        apellidoPaterno: d.apellidoPaterno,
        apellidoMaterno: d.apellidoMaterno,
        email: d.email,
        dni: d.dni,
        password: hashedPassword,
        role: "profesor",
        cargoId: docenteCargo?.id,
        estadoId: estadoActivo.id,
        institucionId: institucion.id,
      },
    });
    docentes.push(docente);
  }

  // 11. Cursos (Courses)
  console.log("- Sembrando Cursos y asignando a Docentes...");
  const cursoList = [
    { nombre: "Matematica", codigo: "MAT-PRI", area: "MAT" },
    { nombre: "Razonamiento Matematico", codigo: "RMA-PRI", area: "MAT" },
    { nombre: "Desafios", codigo: "DES-PRI", area: "MAT" },
    { nombre: "Comunicacion", codigo: "COM-PRI", area: "COM" },
    { nombre: "Razonamiento Verbal", codigo: "RVE-PRI", area: "COM" },
    { nombre: "Dictado", codigo: "DIC-PRI", area: "COM" },
    { nombre: "Ciencia Tecnologia y Ambiente", codigo: "CTA-PRI", area: "CYT" },
    { nombre: "Personal Social", codigo: "PSO-PRI", area: "PS" },
    { nombre: "Ingles", codigo: "ING-PRI", area: "ING" },
    { nombre: "Religion", codigo: "REL-PRI", area: "REL" },
    { nombre: "Computacion", codigo: "CMP-PRI", area: "COMP" },
  ];

  // Asignar cursos al primer grado de primaria (1ero A) para demostración
  const primeraSeccion = secciones[0];
  if (primeraSeccion) {
    for (let i = 0; i < cursoList.length; i++) {
      const c = cursoList[i];
      const area = await prisma.areaCurricular.findUnique({
        where: {
          codigo_institucionId: {
            codigo: c.area,
            institucionId: institucion.id,
          },
        },
      });

      if (area) {
        await prisma.curso.upsert({
          where: {
            codigo_anioAcademico_nivelAcademicoId: {
              codigo: `${c.codigo}-1A`,
              anioAcademico: 2026,
              nivelAcademicoId: primeraSeccion.id,
            },
          },
          update: {},
          create: {
            nombre: c.nombre,
            codigo: `${c.codigo}-1A`,
            anioAcademico: 2026,
            areaCurricularId: area.id,
            nivelAcademicoId: primeraSeccion.id,
            gradoId: primeraSeccion.gradoId,
            profesorId: docentes[i % docentes.length].id, // Rotar entre los 3 docentes
            institucionId: institucion.id,
            nivelId: primeraSeccion.nivelId,
          },
        });
      }
    }
  }

  // 12. Estudiantes de Prueba
  console.log(
    "- Limpiando datos de estudiantes previos (Relaciones, Matrículas, etc.)...",
  );
  // Eliminar en orden inverso a las dependencias
  await prisma.matriculaCurso.deleteMany({});
  await prisma.matricula.deleteMany({});
  await prisma.relacionFamiliar.deleteMany({});
  await prisma.nota.deleteMany({});
  await prisma.asistencia.deleteMany({});
  await prisma.pago.deleteMany({});
  await prisma.cronogramaPago.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "estudiante" } });

  console.log("- Sembrando Estudiantes de Prueba...");

  for (const s of studentsSeed) {
    await prisma.user.upsert({
      where: { dni: s.dni },
      update: {
        email: s.email || undefined,
        estadoId: estadoActivo.id,
        institucionId: institucion.id,
      },
      create: {
        name: s.name,
        apellidoPaterno: s.apellidoPaterno,
        apellidoMaterno: s.apellidoMaterno,
        dni: s.dni,
        email: s.email || null,
        fechaNacimiento: s.fechaNacimiento,
        sexo: s.sexo,
        nacionalidad: s.nacionalidad,
        direccion: s.direccion,
        departamento: s.departamento,
        provincia: s.provincia,
        distrito: s.distrito,
        ubigeo: s.ubigeo,
        codigoEstudiante: s.codigoEstudiante,
        codigoSiagie: s.codigoSiagie,
        role: "estudiante",
        estadoId: estadoActivo.id,
        institucionId: institucion.id,
        contactoEmergencia: s.nombreApoderado,
        telefonoEmergencia: s.telefonoApoderado,
        parentescoContactoEmergencia: s.parentescoApoderado,
      },
    });
  }

  console.log("✅ Proceso de siembra finalizado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en la siembra:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
