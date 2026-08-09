"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
              asistenciaHoy: null as any,
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
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      const [cronograma, notas, fichas, anuncios, asistenciaStats, asistenciaHoy] = await Promise.all([
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
        // Asistencia de hoy
        prisma.asistencia.findFirst({
          where: {
            estudianteId: currentStudentId,
            fecha: { gte: startOfDay, lte: endOfDay },
          },
          select: {
            presente: true,
            tardanza: true,
            horaLlegada: true,
            justificada: true,
            justificacion: true,
            createdAt: true,
          },
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
            asistenciaHoy: serialize(asistenciaHoy),
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
