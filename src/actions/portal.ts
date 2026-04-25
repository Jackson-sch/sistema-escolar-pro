"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Obtiene el perfil completo del padre/tutor para la página de perfil del portal
 */
export const getParentProfileAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: padreId },
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          email: true,
          dni: true,
          telefono: true,
          telefonoEmergencia: true,
          direccion: true,
          distrito: true,
          provincia: true,
          departamento: true,
          fechaNacimiento: true,
          sexo: true,
          estadoCivil: true,
          nacionalidad: true,
          ocupacion: true,
          lugarTrabajo: true,
          gradoInstruccion: true,
          image: true,
          createdAt: true,
          hijosDeTutor: {
            include: {
              hijo: {
                select: {
                  id: true,
                  name: true,
                  apellidoPaterno: true,
                  apellidoMaterno: true,
                  image: true,
                  codigoEstudiante: true,
                  fechaNacimiento: true,
                  nivelAcademico: {
                    include: {
                      nivel: { select: { nombre: true } },
                      grado: { select: { nombre: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) return { error: "Usuario no encontrado" };

      return { success: serialize(user) };
    } catch (error) {
      console.error("Error fetching parent profile:", error);
      return { error: "No se pudo obtener el perfil" };
    }
  }
);

/**
 * Obtiene el perfil completo del docente para la página de perfil del portal
 */
export const getTeacherProfileAction = createSafeAction(
  z.object({ docenteId: z.string().optional() }),
  async (_, session) => {
    try {
      const docenteId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: docenteId },
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          email: true,
          dni: true,
          telefono: true,
          telefonoEmergencia: true,
          direccion: true,
          distrito: true,
          provincia: true,
          departamento: true,
          fechaNacimiento: true,
          sexo: true,
          nacionalidad: true,
          image: true,
          especialidad: true,
          titulo: true,
          colegioProfesor: true,
          fechaContratacion: true,
          tipoContrato: true,
          escalaMagisterial: true,
          gradoInstruccion: true,
          createdAt: true,
          role: true,
          cursosImpartidos: {
            where: { activo: true },
            include: {
              areaCurricular: { select: { nombre: true, color: true, icono: true } },
              nivelAcademico: {
                include: {
                  nivel: { select: { nombre: true } },
                  grado: { select: { nombre: true } },
                },
              },
            },
          },
        },
      });

      if (!user) return { error: "Docente no encontrado" };

      return { success: serialize(user) };
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      return { error: "No se pudo obtener el perfil del docente" };
    }
  }
);

/**
 * Actualiza el perfil del docente (solo campos permitidos)
 */
export const updateTeacherProfileAction = createSafeAction(
  z.object({
    telefono: z.string().nullable().optional(),
    telefonoEmergencia: z.string().nullable().optional(),
    direccion: z.string().nullable().optional(),
    distrito: z.string().nullable().optional(),
    provincia: z.string().nullable().optional(),
    departamento: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    especialidad: z.string().nullable().optional(),
    titulo: z.string().nullable().optional(),
    fechaNacimiento: z.date().nullable().optional(),
    sexo: z.string().nullable().optional(),
    estadoCivil: z.string().nullable().optional(),
    nacionalidad: z.string().nullable().optional(),
    contactoEmergencia: z.string().nullable().optional(),
    colegioProfesor: z.string().nullable().optional(),
    escalaMagisterial: z.string().nullable().optional(),
    tipoContrato: z.string().nullable().optional(),
    fechaContratacion: z.date().nullable().optional(),
    fechaIngreso: z.date().nullable().optional(),
    turno: z.string().nullable().optional(),
  }),
  async (values, session) => {
    try {
      const docenteId = session.user.id;

      const user = await prisma.user.update({
        where: { id: docenteId },
        data: values,
      });

      revalidatePath("/portal/perfil");
      return { success: serialize(user) };
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      return { error: "No se pudo actualizar el perfil" };
    }
  }
);

/**
 * Obtiene el resumen de asistencia de un estudiante para un mes y año específicos
 */
export const getStudentMonthAttendanceAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    mes: z.number(),
    anio: z.number(),
  }),
  async ({ estudianteId, mes, anio }, session) => {
    try {
      const padreId = session.user.id;
      
      // Validación de Seguridad: Verificar que el estudiante es hijo del usuario logueado
      const esHijo = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: padreId, hijoId: estudianteId }
      });

      if (!esHijo && session.user.role !== "administrativo") {
        return { error: "No tiene permiso para ver la asistencia de este estudiante" };
      }

      const startDate = new Date(anio, mes, 1);
      const endDate = new Date(anio, mes + 1, 0, 23, 59, 59, 999);

      const asistencias = await prisma.asistencia.findMany({
        where: {
          estudianteId,
          fecha: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          curso: true,
        },
        orderBy: { fecha: "asc" },
      });

      return { success: serialize(asistencias) };
    } catch (error) {
      console.error("Error fetching student month attendance:", error);
      return { error: "No se pudo obtener la asistencia mensual" };
    }
  }
);

/**
 * Obtiene los anuncios y eventos dirigidos a un estudiante específico (según su nivel y grado)
 */
export const getPortalCommunicationsAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }, session) => {
    try {
      const padreId = session.user.id;

      if (estudianteId !== "todos") {
        // Validación: El estudiante debe ser hijo del padre
        const esHijo = await prisma.relacionFamiliar.findFirst({
          where: { padreTutorId: padreId, hijoId: estudianteId }
        });

        if (!esHijo && session.user.role !== "administrativo") {
          return { error: "Acceso denegado a comunicaciones de este estudiante" };
        }
      }

      if (estudianteId === "todos") {
        const [anuncios, eventos] = await Promise.all([
          prisma.anuncio.findMany({
            where: {
              activo: true,
              OR: [{ dirigidoA: "TODOS" }, { dirigidoA: "PADRES" }],
            },
            include: {
              autor: {
                select: { name: true, apellidoPaterno: true, image: true },
              },
            },
            orderBy: [{ fijado: "desc" }, { fechaPublicacion: "desc" }],
          }),
          prisma.evento.findMany({
            where: {
              estado: "programado",
              OR: [{ publico: true }, { dirigidoA: "PADRES" }],
            },
            include: {
              organizador: {
                select: { name: true, image: true },
              },
            },
            orderBy: { fechaInicio: "asc" },
          }),
        ]);

        return {
          success: {
            anuncios: serialize(anuncios),
            eventos: serialize(eventos),
          },
        };
      }

      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId },
        include: {
          nivelAcademico: true,
        },
      });

      if (!estudiante) return { error: "Estudiante no encontrado" };

      const nivelId = estudiante.nivelAcademico?.nivelId;
      const gradoId = estudiante.nivelAcademico?.gradoId;

      const [anuncios, eventos] = await Promise.all([
        prisma.anuncio.findMany({
          where: {
            activo: true,
            OR: [
              { dirigidoA: "TODOS" },
              {
                AND: [
                  { dirigidoA: "PADRES" },
                  { niveles: { none: {} } },
                  { grados: { none: {} } },
                ],
              },
              {
                AND: [
                  { dirigidoA: { in: ["PADRES", "ESTUDIANTES"] } },
                  {
                    OR: [
                      { niveles: { some: { id: nivelId } } },
                      { grados: { some: { id: gradoId } } },
                    ],
                  },
                ],
              },
            ],
          },
          include: {
            autor: {
              select: { name: true, apellidoPaterno: true, image: true },
            },
          },
          orderBy: [{ fijado: "desc" }, { fechaPublicacion: "desc" }],
        }),
        prisma.evento.findMany({
          where: {
            estado: "programado",
            OR: [
              { publico: true },
              {
                AND: [
                  { dirigidoA: "PADRES" },
                  { niveles: { none: {} } },
                  { grados: { none: {} } },
                ],
              },
              {
                AND: [
                  { dirigidoA: { in: ["PADRES", "ESTUDIANTES"] } },
                  {
                    OR: [
                      { niveles: { some: { id: nivelId } } },
                      { grados: { some: { id: gradoId } } },
                    ],
                  },
                ],
              },
            ],
          },
          include: {
            organizador: {
              select: { name: true, image: true },
            },
          },
          orderBy: { fechaInicio: "asc" },
        }),
      ]);

      return {
        success: {
          anuncios: serialize(anuncios),
          eventos: serialize(eventos),
        },
      };
    } catch (error) {
      console.error("Error fetching portal communications:", error);
      return { error: "No se pudieron obtener las comunicaciones" };
    }
  }
);

/**
 * Obtiene el horario semanal de un estudiante
 */
export const getStudentScheduleAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }, session) => {
    try {
      const padreId = session.user.id;

      // Validación de Seguridad
      const esHijo = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: padreId, hijoId: estudianteId }
      });

      if (!esHijo && session.user.role !== "administrativo") {
        return { error: "No autorizado para ver el horario de este estudiante" };
      }

      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId },
        include: {
          nivelAcademico: true,
        },
      });

      if (!estudiante?.nivelAcademicoId)
        return { error: "Estudiante no tiene sección asignada" };

      const horarios = await prisma.horario.findMany({
        where: {
          curso: {
            nivelAcademicoId: estudiante.nivelAcademicoId,
          },
        },
        include: {
          curso: {
            include: {
              areaCurricular: true,
              profesor: {
                select: { name: true, apellidoPaterno: true },
              },
            },
          },
        },
        orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
      });

      return { success: serialize(horarios) };
    } catch (error) {
      console.error("Error fetching student schedule:", error);
      return { error: "No se pudo obtener el horario" };
    }
  }
);

/**
 * Obtiene toda la información necesaria para el Dashboard del Portal de Padres
 */
export const getParentDashboardDataAction = createSafeAction(
  z.object({ estudianteId: z.string().optional() }),
  async ({ estudianteId }, session) => {
    try {
      const padreId = session.user.id;

      // 1. Obtener todos los hijos (Esto valida el acceso al tenant implícitamente por el padreId de la sesión)
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              image: true,
              nivelAcademico: {
                include: {
                  nivel: true,
                  grado: true,
                },
              },
            },
          },
        },
        orderBy: { orden: "asc" },
      });

      const hijos = relaciones.map((r) => r.hijo);
      if (hijos.length === 0) {
        return {
          success: {
            hijos: [] as any[],
            currentStudent: null as any,
            stats: {
              attendancePercentage: 0,
              chartData: [] as any[],
              payments: { overdue: [] as any[], upcoming: [] as any[], totalDeuda: 0 },
              fichas: [] as any[],
              anuncios: [] as any[],
            },
          },
        };
      }

      // 2. Determinar el estudiante actual y VALIDAR que pertenece al padre
      const currentStudentId = estudianteId || hijos[0].id;
      const currentStudent = hijos.find((h) => h.id === currentStudentId);

      if (!currentStudent) {
        return { error: "Estudiante no vinculado a su cuenta" };
      }

      // 3. Fetch data concurrente para el estudiante actual
      const today = new Date();

      const [cronograma, notas, fichas, anuncios, asistenciaStats] = await Promise.all([
        // Pagos
        prisma.cronogramaPago.findMany({
          where: { estudianteId: currentStudentId, pagado: false },
          include: { concepto: true },
          orderBy: { fechaVencimiento: "asc" },
        }),
        // Notas para el gráfico (últimos 6 meses)
        prisma.nota.findMany({
          where: {
            estudianteId: currentStudentId,
            evaluacion: {
              fecha: {
                gte: new Date(today.getFullYear(), today.getMonth() - 6, 1),
              },
            },
          },
          include: {
            evaluacion: true,
          },
        }),
        // Fichas Psicopedagógicas
        prisma.fichaPsicopedagogica.findMany({
          where: { estudianteId: currentStudentId, visibleParaPadres: true },
          include: {
            categoria: true,
            especialista: { select: { name: true, image: true } },
          },
          orderBy: { fecha: "desc" },
          take: 3,
        }),
        // Anuncios Generales
        prisma.anuncio.findMany({
          where: {
            activo: true,
            OR: [
              { dirigidoA: "TODOS" },
              { dirigidoA: "PADRES" },
              {
                niveles: {
                  some: { id: currentStudent.nivelAcademico?.nivelId },
                },
              },
              {
                grados: {
                  some: { id: currentStudent.nivelAcademico?.gradoId },
                },
              },
            ],
          },
          include: { autor: { select: { name: true, image: true } } },
          orderBy: { fechaPublicacion: "desc" },
          take: 3,
        }),
        // Procesar porcentaje de asistencia
        prisma.asistencia.groupBy({
          by: ["presente"],
          where: {
            estudianteId: currentStudentId,
            fecha: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
          },
          _count: { _all: true },
        }),
      ]);

      const presentCount =
        asistenciaStats.find((s) => s.presente)?._count._all || 0;
      const absentCount =
        asistenciaStats.find((s) => !s.presente)?._count._all || 0;
      const attendancePercentage =
        presentCount + absentCount > 0
          ? (presentCount / (presentCount + absentCount)) * 100
          : 100;

      // Procesar notas para el gráfico (promedio por mes)
      const months = [
        "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
        "JUL", "AGO", "SET", "OCT", "NOV", "DIC",
      ];
      const gradesByMonth: { [key: string]: { total: number; count: number } } = {};

      notas.forEach((nota) => {
        const monthIndex = new Date(nota.evaluacion.fecha).getMonth();
        const monthName = months[monthIndex];
        if (!gradesByMonth[monthName])
          gradesByMonth[monthName] = { total: 0, count: 0 };
        gradesByMonth[monthName].total += nota.valor;
        gradesByMonth[monthName].count += 1;
      });

      const chartData = Object.keys(gradesByMonth)
        .map((month) => ({
          name: month,
          gpa: Number(
            (gradesByMonth[month].total / gradesByMonth[month].count).toFixed(2),
          ),
        }))
        .sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));

      // Formatear pagos pendientes
      const payments = {
        overdue: cronograma.filter((c) => new Date(c.fechaVencimiento) < today),
        upcoming: cronograma.filter((c) => new Date(c.fechaVencimiento) >= today),
        totalDeuda: cronograma.reduce(
          (acc, c) => acc + (c.monto - c.montoPagado),
          0,
        ),
      };

      return {
        success: {
          hijos: serialize(hijos),
          currentStudent: serialize(currentStudent),
          stats: {
            attendancePercentage,
            chartData,
            payments,
            fichas: serialize(fichas),
            anuncios: serialize(anuncios),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching parent dashboard data:", error);
      return { error: "Error al cargar la información del portal" };
    }
  }
);

/**
 * Obtiene la lista de estudiantes vinculados a un padre/tutor
 */
export const getParentStudentsAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              image: true,
              nivelAcademico: {
                select: {
                  nivel: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                  grado: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const hijos = relaciones.map((r) => r.hijo);
      return { success: serialize(hijos) };
    } catch (error) {
      console.error("Error fetching parent students:", error);
      return { error: "No se pudo obtener la lista de estudiantes" };
    }
  }
);

/**
 * Obtiene la información del usuario (padre) para el layout
 */
export const getParentUserAction = createSafeAction(
  z.object({ userId: z.string().optional() }),
  async (_, session) => {
    try {
      const userId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          mustChangePassword: true,
          role: true,
          name: true,
          email: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      });
      return { success: serialize(user) };
    } catch (error) {
      console.error("Error fetching parent user:", error);
      return { error: "No se pudo obtener la información del usuario" };
    }
  }
);

/**
 * Obtiene las deudas y los hijos para el módulo de deudas
 */
export const getDeudasPortalAction = createSafeAction(
  z.object({ hijoId: z.string().optional() }),
  async ({ hijoId }, session) => {
    try {
      const padreId = session.user.id;
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            include: {
              nivelAcademico: {
                include: { grado: true, nivel: true },
              },
            },
          },
        },
      });

      const hijos = relaciones.map((r) => r.hijo);
      const selectedHijoId = hijoId || hijos[0]?.id;

      if (hijoId && !hijos.some(h => h.id === hijoId)) {
        return { error: "No autorizado para ver las deudas de este estudiante" };
      }

      let deudas: any[] = [];
      let historial: any[] = [];

      if (selectedHijoId) {
        const [deudasRes, historialRes] = await Promise.all([
          prisma.cronogramaPago.findMany({
            where: {
              estudianteId: selectedHijoId,
              pagado: false,
            },
            include: {
              concepto: true,
              estudiante: true,
            },
            orderBy: { fechaVencimiento: "asc" },
          }),
          prisma.cronogramaPago.findMany({
            where: {
              estudianteId: selectedHijoId,
              pagado: true,
            },
            include: {
              concepto: true,
              estudiante: {
                include: {
                  nivelAcademico: {
                    include: { grado: true, nivel: true },
                  },
                },
              },
              pagos: {
                where: { numeroBoleta: { not: null } },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
            orderBy: { updatedAt: "desc" },
          }),
        ]);

        deudas = deudasRes;
        historial = historialRes;
      }

      return {
        success: {
          hijos: serialize(hijos),
          deudas: serialize(deudas),
          historial: serialize(historial),
          selectedHijoId,
        },
      };
    } catch (error) {
      console.error("Error fetching deudas portal info:", error);
      return { error: "No se pudieron obtener las deudas" };
    }
  }
);

/**
 * Obtiene las boletas y comprobantes para el módulo de boletas
 */
export const getBoletasPortalAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const [institucion, relaciones, comprobantesAprobados] = await Promise.all([
        prisma.institucionEducativa.findFirst({
           where: { id: session.user.institucionId || undefined }
        }),
        prisma.relacionFamiliar.findMany({
          where: { padreTutorId: padreId },
          include: {
            hijo: {
              include: {
                nivelAcademico: {
                  include: { grado: true, nivel: true },
                },
                cronogramaPagos: {
                  where: {
                    pagado: true,
                    pagos: { some: { numeroBoleta: { not: null } } },
                  },
                  include: {
                    concepto: true,
                    pagos: {
                      where: { numeroBoleta: { not: null } },
                      orderBy: { createdAt: "desc" },
                      take: 1,
                    },
                  },
                  orderBy: { updatedAt: "desc" },
                },
              },
            },
          },
        }),
        prisma.comprobantePago.findMany({
          where: { padreId: padreId, estado: "APROBADO" },
          include: {
            cronograma: {
              include: {
                concepto: true,
                estudiante: {
                  include: {
                    nivelAcademico: {
                      include: { grado: true, nivel: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { verificadoEn: "desc" },
        }),
      ]);

      return {
        success: {
          institucion: serialize(institucion),
          relaciones: serialize(relaciones),
          comprobantesAprobados: serialize(
            comprobantesAprobados,
          ),
        },
      };
    } catch (error) {
      console.error("Error fetching boletas portal info:", error);
      return { error: "No se pudieron obtener las boletas" };
    }
  }
);

/**
 * Obtiene el detalle de un cronograma para el formulario de nuevo comprobante
 */
export const getCronogramaDetailAction = createSafeAction(
  z.object({
    cronogramaId: z.string(),
    padreId: z.string().optional(),
  }),
  async ({ cronogramaId }, session) => {
    try {
      const padreId = session.user.id;
      const cronograma = await prisma.cronogramaPago.findUnique({
        where: { id: cronogramaId },
        include: {
          concepto: true,
          estudiante: {
            include: {
              padresTutores: true,
            },
          },
        },
      });

      if (!cronograma) return { error: "Deuda no encontrada" };

      const esPadre = cronograma.estudiante.padresTutores.some(
        (r) => r.padreTutorId === padreId,
      );

      if (!esPadre && session.user.role !== "administrativo") {
        return { error: "No tienes permiso para ver esta deuda" };
      }

      return { success: serialize(cronograma) };
    } catch (error) {
      console.error("Error fetching cronograma detail:", error);
      return { error: "No se pudo obtener el detalle de la deuda" };
    }
  }
);

/**
 * Obtiene todas las deudas pendientes de todos los hijos para el selector
 */
export const getAllPendingDeudasAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            include: {
              cronogramaPagos: {
                where: { pagado: false },
                include: { concepto: true },
              },
            },
          },
        },
      });

      return { success: serialize(relaciones) };
    } catch (error) {
      console.error("Error fetching all pending deudas:", error);
      return { error: "No se pudieron obtener las deudas pendientes" };
    }
  }
);
