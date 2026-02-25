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
            { niveles: { some: { id: nivelId } } },
            { grados: { some: { id: gradoId } } },
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
            { niveles: { some: { id: nivelId } } },
            { grados: { some: { id: gradoId } } },
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
