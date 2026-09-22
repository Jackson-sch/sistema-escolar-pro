import prisma from "@/lib/prisma";

export interface PermisoDef {
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

export const SYSTEM_PERMISSIONS: PermisoDef[] = [
  // Académico
  {
    codigo: "academico.ver",
    nombre: "Ver Malla & Horarios",
    descripcion: "Consultar planes de estudio, asignaturas y parrilla horaria.",
    modulo: "Académico",
  },
  {
    codigo: "academico.gestionar",
    nombre: "Administrar Malla & Cursos",
    descripcion: "Crear, editar y estructurar grados, secciones y cursos.",
    modulo: "Académico",
  },
  // Evaluaciones
  {
    codigo: "evaluaciones.ver",
    nombre: "Consultar Registro de Notas",
    descripcion: "Ver evaluaciones programadas y calificaciones de los alumnos.",
    modulo: "Evaluaciones",
  },
  {
    codigo: "evaluaciones.calificar",
    nombre: "Calificar & Editar Evaluaciones",
    descripcion: "Registrar y modificar calificaciones y exámenes.",
    modulo: "Evaluaciones",
  },
  {
    codigo: "evaluaciones.siagie",
    nombre: "Exportación SIAGIE & Actas",
    descripcion: "Generar nóminas y actas oficiales validadas para el MINEDU.",
    modulo: "Evaluaciones",
  },
  // Asistencia & Disciplina
  {
    codigo: "asistencia.ver",
    nombre: "Monitoreo de Asistencia",
    descripcion: "Consultar bitácora diaria, reportes y justificaciones.",
    modulo: "Asistencia",
  },
  {
    codigo: "asistencia.tomar",
    nombre: "Pasar Lista & Escáner QR",
    descripcion: "Registrar asistencia diaria en aula o mediante lector QR.",
    modulo: "Asistencia",
  },
  {
    codigo: "disciplina.gestionar",
    nombre: "Registro Disciplinario",
    descripcion: "Anotar incidencias conductuales, sanciones y méritos.",
    modulo: "Asistencia",
  },
  // Estudiantes & Familias
  {
    codigo: "estudiantes.ver",
    nombre: "Consultar Padrón de Alumnos",
    descripcion: "Ver datos de estudiantes y contactos de apoderados.",
    modulo: "Estudiantes",
  },
  {
    codigo: "estudiantes.gestionar",
    nombre: "Matrículas & Fichas",
    descripcion: "Matricular alumnos, editar expedientes y emitir constancias.",
    modulo: "Estudiantes",
  },
  {
    codigo: "estudiantes.psicologia",
    nombre: "Expediente Psicopedagógico",
    descripcion: "Acceso confidencial a fichas psicológicas y salud del alumno.",
    modulo: "Estudiantes",
  },
  // Tesorería & Finanzas
  {
    codigo: "finanzas.caja",
    nombre: "Cobro en Ventanilla & Caja",
    descripcion: "Cobro de cuotas, emisión de comprobantes y arqueo diario.",
    modulo: "Finanzas",
  },
  {
    codigo: "finanzas.verificacion",
    nombre: "Conciliación Bancaria",
    descripcion: "Validar transferencias bancarias y recibos enviados por padres.",
    modulo: "Finanzas",
  },
  {
    codigo: "finanzas.reportes",
    nombre: "Reportes de Recaudación",
    descripcion: "Balances de morosidad, ingresos y estados de cuenta.",
    modulo: "Finanzas",
  },
  {
    codigo: "finanzas.configurar",
    nombre: "Tarifas & Conceptos",
    descripcion: "Configurar costos de matrícula, pensiones y cronogramas.",
    modulo: "Finanzas",
  },
  // Comunicaciones
  {
    codigo: "comunicaciones.publicar",
    nombre: "Emisión de Comunicados",
    descripcion: "Publicar anuncios oficiales y gestionar el calendario escolar.",
    modulo: "Comunicaciones",
  },
  // Personal
  {
    codigo: "personal.gestionar",
    nombre: "Padrón de Colaboradores",
    descripcion: "Gestión de altas, cargos y contratos del personal.",
    modulo: "Personal",
  },
  // Seguridad
  {
    codigo: "seguridad.permisos",
    nombre: "Roles & Permisos del Sistema",
    descripcion: "Configurar accesos por cargo y roles institucionales.",
    modulo: "Seguridad",
  },
];

export const DEFAULT_CARGO_PERMISSIONS: Record<string, string[]> = {
  ADMIN_GLOBAL: SYSTEM_PERMISSIONS.map((p) => p.codigo),
  DIRECTOR: SYSTEM_PERMISSIONS.map((p) => p.codigo),
  SUBDIRECTOR: SYSTEM_PERMISSIONS.filter((p) => p.codigo !== "seguridad.permisos").map((p) => p.codigo),
  COORD_ACAD: [
    "academico.ver", "academico.gestionar", "evaluaciones.ver", "evaluaciones.calificar",
    "evaluaciones.siagie", "asistencia.ver", "estudiantes.ver", "comunicaciones.publicar",
  ],
  COORD_NIVEL: [
    "academico.ver", "evaluaciones.ver", "evaluaciones.calificar", "asistencia.ver",
    "asistencia.tomar", "disciplina.gestionar", "estudiantes.ver", "comunicaciones.publicar",
  ],
  DOCENTE: [
    "academico.ver", "evaluaciones.ver", "evaluaciones.calificar",
    "asistencia.ver", "asistencia.tomar", "estudiantes.ver",
  ],
  AUXILIAR: [
    "asistencia.ver", "asistencia.tomar", "disciplina.gestionar", "estudiantes.ver",
  ],
  TESORERO: [
    "finanzas.caja", "finanzas.verificacion", "finanzas.reportes", "finanzas.configurar",
    "estudiantes.ver",
  ],
  SECRETARIA: [
    "estudiantes.ver", "estudiantes.gestionar", "academico.ver", "asistencia.ver",
    "comunicaciones.publicar",
  ],
  PSICOLOGO: [
    "estudiantes.ver", "estudiantes.psicologia", "disciplina.gestionar", "comunicaciones.publicar",
  ],
  ENFERMERIA: [
    "estudiantes.ver", "estudiantes.psicologia", "asistencia.ver",
  ],
  SISTEMAS: [
    "seguridad.permisos", "academico.ver", "personal.gestionar", "comunicaciones.publicar",
  ],
  BIBLIOTECARIO: ["estudiantes.ver"],
  MANTENIMIENTO: [],
  VIGILANCIA: ["asistencia.tomar", "estudiantes.ver"],
};

/**
 * Asegura que el catálogo de permisos exista en la base de datos de manera idempotente.
 */
export async function ensurePermissionsSeeded() {
  const count = await prisma.permiso.count();
  if (count < SYSTEM_PERMISSIONS.length) {
    for (const p of SYSTEM_PERMISSIONS) {
      await prisma.permiso.upsert({
        where: { codigo: p.codigo },
        update: { nombre: p.nombre, descripcion: p.descripcion, modulo: p.modulo },
        create: p,
      });
    }
  }
}
