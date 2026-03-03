"use server";

import prisma from "@/lib/prisma";

/**
 * Obtiene el resumen de asistencia de un estudiante para un mes y año específicos
 */
export async function getStudentMonthAttendanceAction(
  estudianteId: string,
  mes: number,
  anio: number,
) {
  try {
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

    return { data: JSON.parse(JSON.stringify(asistencias)) };
  } catch (error) {
    console.error("Error fetching student month attendance:", error);
    return { error: "No se pudo obtener la asistencia mensual" };
  }
}

/**
 * Obtiene los anuncios y eventos dirigidos a un estudiante específico (según su nivel y grado)
 */
export async function getPortalCommunicationsAction(estudianteId: string) {
  try {
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
        data: {
          anuncios: JSON.parse(JSON.stringify(anuncios)),
          eventos: JSON.parse(JSON.stringify(eventos)),
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
      data: {
        anuncios: JSON.parse(JSON.stringify(anuncios)),
        eventos: JSON.parse(JSON.stringify(eventos)),
      },
    };
  } catch (error) {
    console.error("Error fetching portal communications:", error);
    return { error: "No se pudieron obtener las comunicaciones" };
  }
}

/**
 * Obtiene el horario semanal de un estudiante
 */
export async function getStudentScheduleAction(estudianteId: string) {
  try {
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

    return { data: JSON.parse(JSON.stringify(horarios)) };
  } catch (error) {
    console.error("Error fetching student schedule:", error);
    return { error: "No se pudo obtener el horario" };
  }
}

/**
 * Obtiene toda la información necesaria para el Dashboard del Portal de Padres
 */
export async function getParentDashboardDataAction({
  padreId,
  estudianteId,
}: {
  padreId: string;
  estudianteId?: string;
}): Promise<{
  success?: {
    hijos: any[];
    currentStudent: any;
    stats: {
      attendancePercentage: number;
      chartData: any[];
      payments: { overdue: any[]; upcoming: any[]; totalDeuda: number };
      fichas: any[];
      anuncios: any[];
    };
  };
  error?: string;
}> {
  try {
    // 1. Obtener todos los hijos
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
          hijos: [],
          currentStudent: null,
          stats: {
            attendancePercentage: 0,
            chartData: [],
            payments: { overdue: [], upcoming: [], totalDeuda: 0 },
            fichas: [],
            anuncios: [],
          },
        },
      };
    }

    // 2. Determinar el estudiante actual
    const currentStudentId = estudianteId || hijos[0].id;
    const currentStudent =
      hijos.find((h) => h.id === currentStudentId) || hijos[0];

    // 3. Fetch data concurrente para el estudiante actual
    const today = new Date();
    const currentYear = today.getFullYear();

    const [cronograma, notas, fichas, anuncios] = await Promise.all([
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
    ]);

    // Procesar porcentaje de asistencia
    // Better way for boolean sum in Postgres/Prisma:
    const asistenciaStats = await prisma.asistencia.groupBy({
      by: ["presente"],
      where: {
        estudianteId: currentStudentId,
        fecha: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: { _all: true },
    });

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
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OCT",
      "NOV",
      "DIC",
    ];
    const gradesByMonth: { [key: string]: { total: number; count: number } } =
      {};

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
        hijos: JSON.parse(JSON.stringify(hijos)),
        currentStudent: JSON.parse(JSON.stringify(currentStudent)),
        stats: {
          attendancePercentage,
          chartData,
          payments,
          fichas: JSON.parse(JSON.stringify(fichas)),
          anuncios: JSON.parse(JSON.stringify(anuncios)),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching parent dashboard data:", error);
    return { error: "Error al cargar la información del portal" };
  }
}

/**
 * Obtiene la lista de estudiantes vinculados a un padre/tutor
 */
export async function getParentStudentsAction(padreId: string) {
  try {
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
    return { data: JSON.parse(JSON.stringify(hijos)) };
  } catch (error) {
    console.error("Error fetching parent students:", error);
    return { error: "No se pudo obtener la lista de estudiantes" };
  }
}

/**
 * Obtiene la información del usuario (padre) para el layout
 */
export async function getParentUserAction(userId: string) {
  try {
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
    return { data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Error fetching parent user:", error);
    return { error: "No se pudo obtener la información del usuario" };
  }
}

/**
 * Obtiene las deudas y los hijos para el módulo de deudas
 */
export async function getDeudasPortalAction(padreId: string, hijoId?: string) {
  try {
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

    let deudas: any[] = [];
    if (selectedHijoId) {
      deudas = await prisma.cronogramaPago.findMany({
        where: {
          estudianteId: selectedHijoId,
          pagado: false,
        },
        include: {
          concepto: true,
          estudiante: true,
        },
        orderBy: { fechaVencimiento: "asc" },
      });
    }

    return {
      data: {
        hijos: JSON.parse(JSON.stringify(hijos)),
        deudas: JSON.parse(JSON.stringify(deudas)),
        selectedHijoId,
      },
    };
  } catch (error) {
    console.error("Error fetching deudas portal info:", error);
    return { error: "No se pudieron obtener las deudas" };
  }
}

/**
 * Obtiene las boletas y comprobantes para el módulo de boletas
 */
export async function getBoletasPortalAction(padreId: string) {
  try {
    const [institucion, relaciones, comprobantesAprobados] = await Promise.all([
      prisma.institucionEducativa.findFirst(),
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
      data: {
        institucion: JSON.parse(JSON.stringify(institucion)),
        relaciones: JSON.parse(JSON.stringify(relaciones)),
        comprobantesAprobados: JSON.parse(
          JSON.stringify(comprobantesAprobados),
        ),
      },
    };
  } catch (error) {
    console.error("Error fetching boletas portal info:", error);
    return { error: "No se pudieron obtener las boletas" };
  }
}

/**
 * Obtiene el detalle de un cronograma para el formulario de nuevo comprobante
 */
export async function getCronogramaDetailAction(
  cronogramaId: string,
  padreId: string,
) {
  try {
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

    if (!esPadre) return { error: "No tienes permiso para ver esta deuda" };

    return { data: JSON.parse(JSON.stringify(cronograma)) };
  } catch (error) {
    console.error("Error fetching cronograma detail:", error);
    return { error: "No se pudo obtener el detalle de la deuda" };
  }
}

/**
 * Obtiene todas las deudas pendientes de todos los hijos para el selector
 */
export async function getAllPendingDeudasAction(padreId: string) {
  try {
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

    return { data: JSON.parse(JSON.stringify(relaciones)) };
  } catch (error) {
    console.error("Error fetching all pending deudas:", error);
    return { error: "No se pudieron obtener las deudas pendientes" };
  }
}
