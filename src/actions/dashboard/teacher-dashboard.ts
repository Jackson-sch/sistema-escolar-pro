"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { getTeacherStudentMetrics } from "./teacher-dashboard-helpers";

/**
 * Obtiene estadísticas y alertas para el dashboard del docente
 */
export const getTeacherDashboardAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const teacherId = session.user.id;
    const institucionId = session.user.institucionId;

    // 1. Obtener cursos del profesor con conteo de estudiantes (incluye tutorías)
    const cursos = await prisma.curso.findMany({
      where: {
        OR: [
          { profesorId: teacherId },
          { nivelAcademico: { tutorId: teacherId } },
        ],
        institucionId: institucionId || undefined,
        activo: true,
      },
      include: {
        areaCurricular: true,
        nivelAcademico: {
          include: { grado: true, nivel: true },
        },
        horarios: {
          select: {
            diaSemana: true,
            horaInicio: true,
            horaFin: true,
            aula: true,
          },
          orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
        },
        _count: {
          select: { estudiantes: true },
        },
      },
    });

    const cursoIds = cursos.map((c) => c.id);
    const nivelAcademicoIds = Array.from(
      new Set(cursos.map((c) => c.nivelAcademicoId)),
    );

    const { studentCountMap, totalUniqueStudents } =
      await getTeacherStudentMetrics(nivelAcademicoIds);

    // 2. Fechas para verificar asistencia de hoy
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const today = now.getDay();
    const dbDay = today === 0 ? 7 : today;

    // 3. Próximas evaluaciones (próximos 7 días)
    const upcomingEvaluationsPromise = prisma.evaluacion.findMany({
      where: {
        activa: true,
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

    // 4. Alertas de asistencia (estudiantes con falta injustificada reciente)
    const criticalAttendancePromise = prisma.asistencia.findMany({
      where: {
        presente: false,
        estudiante: {
          matriculas: {
            some: {
              nivelAcademicoId: {
                in: cursos.map((c) => c.nivelAcademicoId),
              },
            },
          },
        },
        fecha: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        estudiante: true,
      },
      orderBy: { fecha: "desc" },
      take: 5,
    });

    // 5. Progreso de calificación (evaluaciones sin notas registradas)
    const evaluationsToGradePromise = prisma.evaluacion.findMany({
      where: {
        activa: true,
        cursoId: { in: cursoIds },
        fecha: { lte: new Date() },
        notas: { none: {} },
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

    // 6. Horario de hoy
    const todaySchedulePromise = prisma.horario.findMany({
      where: {
        cursoId: { in: cursoIds },
        diaSemana: dbDay,
      },
      include: {
        curso: {
          include: {
            areaCurricular: true,
            nivelAcademico: { include: { grado: true } },
          },
        },
      },
      orderBy: { horaInicio: "asc" },
    });

    // 7. Horario semanal completo
    const weeklySchedulePromise = prisma.horario.findMany({
      where: { cursoId: { in: cursoIds } },
      include: {
        curso: {
          include: {
            areaCurricular: true,
            nivelAcademico: { include: { grado: true, nivel: true } },
          },
        },
      },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    });

    // 8. Asistencia registrada hoy en los cursos del docente
    const todayAttendancePromise = prisma.asistencia.groupBy({
      by: ["cursoId"],
      where: {
        cursoId: { in: cursoIds },
        fecha: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const [
      upcomingEvaluations,
      criticalAttendance,
      evaluationsToGrade,
      todaySchedule,
      weeklySchedule,
      todayAttendance,
    ] = await Promise.all([
      upcomingEvaluationsPromise,
      criticalAttendancePromise,
      evaluationsToGradePromise,
      todaySchedulePromise,
      weeklySchedulePromise,
      todayAttendancePromise,
    ]);

    // Mapear evaluaciones pendientes y asistencias registradas
    const pendingGradesMap = new Map<string, number>();
    evaluationsToGrade.forEach((e) => {
      if (e.cursoId) {
        pendingGradesMap.set(e.cursoId, (pendingGradesMap.get(e.cursoId) || 0) + 1);
      }
    });

    const attendedCourseIds = new Set(todayAttendance.map((a) => a.cursoId));

    const cursosConConteo = cursos.map((c) => {
      const hasClassToday = c.horarios.some((h) => h.diaSemana === dbDay);
      const isAttendanceCompleted = attendedCourseIds.has(c.id);

      let attendanceStatusToday: "completed" | "pending" | "not_scheduled" = "not_scheduled";
      if (hasClassToday) {
        attendanceStatusToday = isAttendanceCompleted ? "completed" : "pending";
      }

      return {
        ...c,
        isTutor: c.nivelAcademico?.tutorId === teacherId,
        attendanceStatusToday,
        pendingGradesCount: pendingGradesMap.get(c.id) || 0,
        _count: {
          estudiantes: studentCountMap.get(c.nivelAcademicoId) || 0,
        },
      };
    });

    return {
      success: {
        cursos: serialize(cursosConConteo),
        totalUniqueStudents,
        upcomingEvaluations: serialize(upcomingEvaluations),
        criticalAttendance: serialize(criticalAttendance),
        evaluationsToGrade: serialize(evaluationsToGrade),
        todaySchedule: serialize(todaySchedule),
        weeklySchedule: serialize(weeklySchedule),
      },
    };
  },
  { roles: ["profesor"] },
);
