"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { getActiveSedeId } from "@/actions/active-sede";

/**
 * Obtiene estadísticas generales del dashboard para directivos/administradores
 */
export const getDashboardStatsAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;
    const activeSedeId = await getActiveSedeId();
    const currentYear = new Date().getFullYear();

    const studentWhereCondition: any = {
      institucionId: institucionId || undefined,
    };

    if (activeSedeId) {
      studentWhereCondition.matriculas = {
        some: {
          anioAcademico: currentYear,
          nivelAcademico: { sedeId: activeSedeId },
        },
      };
    }

    // 1. Estadísticas de Morosidad (Pagos vencidos)
    const now = new Date();
    const [totalRevenueAgg, totalOverdueAgg, totalPendingAgg] =
      await Promise.all([
        prisma.pago.aggregate({
          where: {
            estado: "completado",
            estudiante: studentWhereCondition,
          },
          _sum: { monto: true },
        }),
        prisma.pago.aggregate({
          where: {
            estado: "pendiente",
            fechaVencimiento: { lt: now }, // Vencido
            estudiante: studentWhereCondition,
          },
          _sum: { monto: true },
        }),
        prisma.pago.aggregate({
          where: {
            estado: "pendiente",
            fechaVencimiento: { gte: now }, // Por vencer
            estudiante: studentWhereCondition,
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
          estudiante: studentWhereCondition,
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
    const [
      totalStudents,
      totalStaff,
      activeEnrollments,
      academicStats,
      prospectsCount,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "estudiante",
          institucionId: institucionId || undefined,
        },
      }),
      prisma.user.count({
        where: {
          role: { in: ["profesor", "administrativo"] },
          institucionId: institucionId || undefined,
        },
      }),
      prisma.matricula.count({
        where: {
          anioAcademico: currentYear,
          estado: "activo",
          estudiante: { institucionId: institucionId || undefined },
        },
      }),
      prisma.nota.aggregate({
        where: {
          estudiante: { institucionId: institucionId || undefined },
        },
        _avg: { valor: true },
      }),
      prisma.prospecto.count({
        where: {
          institucionId: institucionId || undefined,
          anioPostulacion: currentYear,
        },
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

        const [total, present] = await Promise.all([
          prisma.asistencia.count({
            where: {
              fecha: { gte: date, lt: nextDate },
              estudiante: { institucionId: institucionId || undefined },
            },
          }),
          prisma.asistencia.count({
            where: {
              fecha: { gte: date, lt: nextDate },
              presente: true,
              estudiante: { institucionId: institucionId || undefined },
            },
          }),
        ]);
        return {
          date: date.toISOString().split("T")[0],
          rate: total > 0 ? (present / total) * 100 : 0,
        };
      }),
    );

    // Gráfico de Ingresos (últimos 6 meses)
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
    const iterDate = new Date(sixMonthsAgo);
    iterDate.setHours(0, 0, 0, 0);

    const nowRef = new Date();
    const todayStr = nowRef.toISOString().split("T")[0];

    let currentKey = "";
    while (currentKey !== todayStr) {
      currentKey = iterDate.toISOString().split("T")[0];
      dailyStats[currentKey] = 0;
      iterDate.setDate(iterDate.getDate() + 1);

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
      where: {
        institucionId: institucionId || undefined,
        anioAcademico: currentYear,
      },
      select: {
        capacidad: true,
        _count: { select: { matriculas: { where: { estado: "activo" } } } },
      },
    });
    const totalCap = niveles.reduce((acc, n) => acc + n.capacidad, 0);
    const totalOcc = niveles.reduce((acc, n) => acc + n._count.matriculas, 0);

    // Actividad Reciente
    const [recentMatriculas, recentPagos, recentAnuncios] =
      await Promise.all([
        prisma.matricula.findMany({
          where: {
            estudiante: { institucionId: institucionId || undefined },
          },
          orderBy: { fechaMatricula: "desc" },
          take: 5,
          include: {
            estudiante: true,
            nivelAcademico: { include: { grado: true } },
          },
        }),
        prisma.pago.findMany({
          where: {
            estudiante: { institucionId: institucionId || undefined },
            estado: "completado",
          },
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
      ...recentMatriculas.map((m) => ({
        id: m.id,
        type: "matricula",
        title: `Nueva matrícula: ${m.estudiante.name}`,
        description: `${m.nivelAcademico.grado.nombre}`,
        date: m.fechaMatricula,
        user: `${m.estudiante.name} ${m.estudiante.apellidoPaterno} ${m.estudiante.apellidoMaterno}`,
      })),
      ...recentPagos.map((p) => ({
        id: p.id,
        type: "pago",
        title: `Pago: ${p.concepto}`,
        description: `S/ ${p.monto.toFixed(2)}`,
        date: p.fechaPago!,
        user: `${p.estudiante.name} ${p.estudiante.apellidoPaterno} ${p.estudiante.apellidoMaterno}`,
      })),
      ...recentAnuncios.map((a) => ({
        id: a.id,
        type: "anuncio",
        title: `Anuncio: ${a.titulo}`,
        description: a.resumen || "Aviso",
        date: a.createdAt,
        user: a.autor.name,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // 4. Métricas Académicas y Semáforo CNEB
    const allNotas = await prisma.nota.findMany({
      where: {
        estudiante: { institucionId: institucionId || undefined },
      },
      select: { valor: true },
    });

    let countAD = 0;
    let countA = 0;
    let countB = 0;
    let countC = 0;
    allNotas.forEach((n) => {
      if (n.valor >= 17) countAD++;
      else if (n.valor >= 14) countA++;
      else if (n.valor >= 11) countB++;
      else countC++;
    });

    const atRiskNotas = await prisma.nota.findMany({
      where: {
        valor: { lt: 11 },
        estudiante: { institucionId: institucionId || undefined },
      },
      take: 6,
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            nivelAcademico: {
              select: {
                grado: { select: { nombre: true } },
                seccion: true,
              },
            },
            padresTutores: {
              where: { contactoPrimario: true },
              select: {
                padreTutor: {
                  select: { name: true, telefono: true },
                },
              },
              take: 1,
            },
          },
        },
        curso: { select: { nombre: true } },
      },
      orderBy: { valor: "asc" },
    });

    // 5. Métricas de Tesorería en Tiempo Real
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [todayRevenueAgg, monthRevenueAgg, pendingVouchersCount, upcomingEvents] =
      await Promise.all([
        prisma.pago.aggregate({
          where: {
            estado: "completado",
            fechaPago: { gte: today, lt: tomorrow },
            estudiante: studentWhereCondition,
          },
          _sum: { monto: true },
          _count: { id: true },
        }),
        prisma.pago.aggregate({
          where: {
            estado: "completado",
            fechaPago: { gte: startOfMonth },
            estudiante: studentWhereCondition,
          },
          _sum: { monto: true },
        }),
        prisma.comprobantePago.count({
          where: {
            estado: "PENDIENTE",
            cronograma: { estudiante: studentWhereCondition },
          },
        }),
        prisma.evento.findMany({
          where: {
            organizador: { institucionId: institucionId || undefined },
            fechaInicio: { gte: today },
          },
          orderBy: { fechaInicio: "asc" },
          take: 4,
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            fechaInicio: true,
            tipo: true,
            aula: true,
          },
        }),
      ]);

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
        recentActivity: serialize(recentActivity),
        // Nuevas métricas estratégicas
        cnebStats: {
          total: allNotas.length,
          ad: countAD,
          a: countA,
          b: countB,
          c: countC,
        },
        atRiskStudents: serialize(atRiskNotas),
        financialRealtime: {
          todayRevenue: todayRevenueAgg._sum.monto || 0,
          todayTransactions: todayRevenueAgg._count.id || 0,
          monthRevenue: monthRevenueAgg._sum.monto || 0,
          pendingVouchersCount,
        },
        upcomingEvents: serialize(upcomingEvents),
        recentPayments: serialize(recentPagos),
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

    return { success: serialize(admissions) };
  },
  { roles: ["administrativo"] },
);
