"use server";

import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

/**
 * Obtiene estadísticas generales del dashboard para directivos/administradores
 */
export const getDashboardStatsAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;
    const currentYear = new Date().getFullYear();

    // 1. Estadísticas de Morosidad (Pagos vencidos)
    const now = new Date();
    const [totalRevenueAgg, totalOverdueAgg, totalPendingAgg] =
      await Promise.all([
        prisma.pago.aggregate({
          where: {
            estado: "completado",
            estudiante: { institucionId: institucionId || undefined },
          },
          _sum: { monto: true },
        }),
        prisma.pago.aggregate({
          where: {
            estado: "pendiente",
            fechaVencimiento: { lt: now }, // Vencido
            estudiante: { institucionId: institucionId || undefined },
          },
          _sum: { monto: true },
        }),
        prisma.pago.aggregate({
          where: {
            estado: "pendiente",
            fechaVencimiento: { gte: now }, // Por vencer
            estudiante: { institucionId: institucionId || undefined },
          },
          _sum: { monto: true },
        }),
      ]);

    // 2. Asistencia Hoy (Real-time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [presentToday, totalToday, lateToday] = await Promise.all([
      prisma.asistencia.count({
        where: {
          fecha: { gte: today, lt: tomorrow },
          presente: true,
          estudiante: { institucionId: institucionId || undefined },
        },
      }),
      prisma.asistencia.count({
        where: {
          fecha: { gte: today, lt: tomorrow },
          estudiante: { institucionId: institucionId || undefined },
        },
      }),
      prisma.asistencia.count({
        where: {
          fecha: { gte: today, lt: tomorrow },
          tardanza: true,
          estudiante: { institucionId: institucionId || undefined },
        },
      }),
    ]);

    const todayAttendanceRate =
      totalToday > 0 ? (presentToday / totalToday) * 100 : 0;

    // 3. Otros datos existentes ...
    const [totalStudents, totalStaff, activeEnrollments, academicStats, prospectsCount] = await Promise.all([
      prisma.user.count({
        where: { role: "estudiante", institucionId: institucionId || undefined },
      }),
      prisma.user.count({
        where: { role: { in: ["profesor", "administrativo"] }, institucionId: institucionId || undefined },
      }),
      prisma.matricula.count({
        where: { anioAcademico: currentYear, estado: "activo", estudiante: { institucionId: institucionId || undefined } },
      }),
      prisma.nota.aggregate({
        where: { estudiante: { institucionId: institucionId || undefined } },
        _avg: { valor: true },
      }),
      prisma.prospecto.count({
        where: { institucionId: institucionId || undefined, anioPostulacion: currentYear },
      }),
    ]);

    // Cálculo histórico de asistencia (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const attendanceHistoryByDay = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const total = await prisma.asistencia.count({
          where: { fecha: { gte: date, lt: nextDate }, estudiante: { institucionId: institucionId || undefined } },
        });
        const present = await prisma.asistencia.count({
          where: { fecha: { gte: date, lt: nextDate }, presente: true, estudiante: { institucionId: institucionId || undefined } },
        });
        return {
          date: date.toISOString().split("T")[0],
          rate: total > 0 ? (present / total) * 100 : 0,
        };
      }),
    );

    // Gráfico de Ingresos (últimos 6 meses, granularidad diaria para filtros precisos)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const pagos = await prisma.pago.findMany({
      where: {
        fechaPago: { gte: sixMonthsAgo },
        estudiante: { institucionId: institucionId || undefined },
        estado: "completado",
      },
      select: { monto: true, fechaPago: true },
    });

    const dailyStats: Record<string, number> = {};
    // Rellenamos todos los días para evitar huecos en el gráfico de área
    // Normalizamos iterDate al inicio del día y nowRef para asegurar que "hoy" esté incluido
    const iterDate = new Date(sixMonthsAgo);
    iterDate.setHours(0, 0, 0, 0);
    
    const nowRef = new Date();
    const todayStr = nowRef.toISOString().split("T")[0];

    // Iteramos hasta llegar al string de "hoy"
    let currentKey = "";
    while (currentKey !== todayStr) {
      currentKey = iterDate.toISOString().split("T")[0];
      dailyStats[currentKey] = 0;
      iterDate.setDate(iterDate.getDate() + 1);
      
      // Seguridad para evitar bucles infinitos en casos raros
      if (iterDate.getTime() > nowRef.getTime() + 86400000) break;
    }

    pagos.forEach((p) => {
      if (p.fechaPago) {
        const key = p.fechaPago.toISOString().split("T")[0];
        if (dailyStats[key] !== undefined) dailyStats[key] += p.monto;
      }
    });

    const chartData = Object.entries(dailyStats)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Capacidad
    const niveles = await prisma.nivelAcademico.findMany({
      where: { institucionId: institucionId || undefined, anioAcademico: currentYear },
      select: { capacidad: true, _count: { select: { matriculas: { where: { estado: "activo" } } } } },
    });
    const totalCap = niveles.reduce((acc, n) => acc + n.capacidad, 0);
    const totalOcc = niveles.reduce((acc, n) => acc + n._count.matriculas, 0);

    // Actividad Reciente
    const [recentMatriculas, recentPagos, recentAnuncios] = await Promise.all([
      prisma.matricula.findMany({
        where: { estudiante: { institucionId: institucionId || undefined } },
        orderBy: { fechaMatricula: "desc" },
        take: 5,
        include: { estudiante: true, nivelAcademico: { include: { grado: true } } },
      }),
      prisma.pago.findMany({
        where: { estudiante: { institucionId: institucionId || undefined }, estado: "completado" },
        orderBy: { fechaPago: "desc" },
        take: 5,
        include: { estudiante: true },
      }),
      prisma.anuncio.findMany({
        where: { autor: { institucionId: institucionId || undefined } },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { autor: true },
      }),
    ]);

    const recentActivity = [
      ...recentMatriculas.map((m) => ({ id: m.id, type: "matricula", title: `Nueva matrícula: ${m.estudiante.name}`, description: `${m.nivelAcademico.grado.nombre}`, date: m.fechaMatricula, user: m.estudiante.name })),
      ...recentPagos.map((p) => ({ id: p.id, type: "pago", title: `Pago: ${p.concepto}`, description: `S/ ${p.monto.toFixed(2)}`, date: p.fechaPago!, user: p.estudiante.name })),
      ...recentAnuncios.map((a) => ({ id: a.id, type: "anuncio", title: `Anuncio: ${a.titulo}`, description: a.resumen || "Aviso", date: a.createdAt, user: a.autor.name })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return {
      success: {
        totalStudents,
        totalStaff,
        activeEnrollments,
        totalRevenue: totalRevenueAgg._sum.monto || 0,
        totalOverdue: totalOverdueAgg._sum.monto || 0,
        totalPending: totalPendingAgg._sum.monto || 0,
        attendanceRate: todayAttendanceRate,
        academicAverage: academicStats._avg.valor || 0,
        prospectsCount,
        chartData,
        capacityStats: {
          total: totalCap,
          occupied: totalOcc,
          percentage: totalCap > 0 ? (totalOcc / totalCap) * 100 : 0,
        },
        attendanceToday: {
          present: presentToday,
          total: totalToday,
          late: lateToday,
          absent: totalToday - presentToday,
        },
        attendanceHistory: attendanceHistoryByDay.reverse(),
        recentActivity: JSON.parse(JSON.stringify(recentActivity)),
      },
    };
  },
  { roles: ["administrativo"] },
);

/**
 * Obtiene las admisiones recientes
 */
export const getRecentAdmissionsAction = createSafeAction(
  z.object({ limit: z.number().optional() }).optional(),
  async (values, session) => {
    const institucionId = session.user.institucionId;
    const limit = values?.limit || 5;

    const admissions = await prisma.user.findMany({
      where: {
        role: "estudiante",
        institucionId: institucionId || undefined,
      },
      include: {
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true,
          },
        },
        estado: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return { success: JSON.parse(JSON.stringify(admissions)) };
  },
  { roles: ["administrativo"] },
);

/**
 * Obtiene estadísticas y alertas para el dashboard del docente
 */
export const getTeacherDashboardAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const teacherId = session.user.id;
    const institucionId = session.user.institucionId;

    // 1. Obtener cursos del profesor
    const cursos = await prisma.curso.findMany({
      where: {
        profesorId: teacherId,
        institucionId: institucionId || undefined,
      },
      include: {
        areaCurricular: true,
        nivelAcademico: {
          include: { grado: true, nivel: true },
        },
      },
    });

    const cursoIds = cursos.map((c) => c.id);

    // 2. Próximas evaluaciones (próximos 7 días)
    const upcomingEvaluations = await prisma.evaluacion.findMany({
      where: {
        cursoId: { in: cursoIds },
        fecha: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        curso: {
          include: {
            areaCurricular: true,
            nivelAcademico: { include: { grado: true } },
          },
        },
        tipoEvaluacion: true,
      },
      orderBy: { fecha: "asc" },
    });

    // 3. Alertas de asistencia (estudiantes con falta injustificada reciente)
    const criticalAttendance = await prisma.asistencia.findMany({
      where: {
        presente: false,
        estudiante: {
          matriculas: {
            some: {
              nivelAcademicoId: { in: cursos.map((c) => c.nivelAcademicoId) },
            },
          },
        },
        fecha: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // últimos 3 días
        },
      },
      include: {
        estudiante: true,
      },
      orderBy: { fecha: "desc" },
      take: 5,
    });

    // 4. Progreso de calificación (evaluaciones sin notas registradas)
    const evaluationsToGrade = await prisma.evaluacion.findMany({
      where: {
        cursoId: { in: cursoIds },
        fecha: { lte: new Date() },
        notas: { none: {} }, // No tiene notas registradas
      },
      include: {
        curso: {
          include: {
            areaCurricular: true,
            nivelAcademico: { include: { grado: true } },
          },
        },
        tipoEvaluacion: true,
      },
      orderBy: { fecha: "desc" },
      take: 5,
    });

    return {
      success: {
        cursos,
        upcomingEvaluations: JSON.parse(JSON.stringify(upcomingEvaluations)),
        criticalAttendance: JSON.parse(JSON.stringify(criticalAttendance)),
        evaluationsToGrade: JSON.parse(JSON.stringify(evaluationsToGrade)),
      },
    };
  },
  { roles: ["profesor"] },
);
