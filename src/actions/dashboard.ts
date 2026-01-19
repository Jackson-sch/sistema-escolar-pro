"use server"

import prisma from "@/lib/prisma"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

/**
 * Obtiene estadísticas generales del dashboard para directivos/administradores
 */
export const getDashboardStatsAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId
    const currentYear = new Date().getFullYear()

    const [
      totalStudents,
      totalStaff,
      activeEnrollments,
      totalRevenue,
      academicStats,
      prospectsCount,
    ] = await Promise.all([
      prisma.user.count({ 
        where: { 
          role: "estudiante",
          institucionId: institucionId || undefined
        } 
      }),
      prisma.user.count({ 
        where: { 
          role: { in: ["profesor", "administrativo"] },
          institucionId: institucionId || undefined
        } 
      }),
      prisma.matricula.count({ 
        where: { 
          anioAcademico: currentYear, 
          estado: "activo",
          estudiante: { institucionId: institucionId || undefined }
        } 
      }),
      prisma.pago.aggregate({
        where: {
          estudiante: { institucionId: institucionId || undefined }
        },
        _sum: { monto: true }
      }),
      // Promedio académico institucional
      prisma.nota.aggregate({
        where: {
          estudiante: { institucionId: institucionId || undefined }
        },
        _avg: { valor: true }
      }),
      // Conversion de prospectos
      prisma.prospecto.count({
        where: { 
          institucionId: institucionId || undefined,
          anioPostulacion: currentYear
        }
      })
    ])

    // Cálculo manual de asistencia ya que _avg no funciona con booleanos en todas las DBs
    const attendanceRecords = await prisma.asistencia.count({
      where: {
        fecha: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        presente: true,
        estudiante: { institucionId: institucionId || undefined }
      }
    })
    const totalAttendanceDays = await prisma.asistencia.count({
      where: {
        fecha: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        estudiante: { institucionId: institucionId || undefined }
      }
    })
    const attendanceRate = totalAttendanceDays > 0 ? (attendanceRecords / totalAttendanceDays) * 100 : 0

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const pagos = await prisma.pago.findMany({
      where: {
        fechaPago: { gte: sixMonthsAgo },
        estudiante: { institucionId: institucionId || undefined }
      },
      select: {
        monto: true,
        fechaPago: true
      }
    })

    const monthlyStats: Record<string, number> = {}
    for (let i = 0; i < 6; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthKey = d.toISOString().substring(0, 7)
      monthlyStats[monthKey] = 0
    }

    pagos.forEach(pago => {
      if (!pago.fechaPago) return
      const monthKey = pago.fechaPago.toISOString().substring(0, 7)
      if (monthlyStats[monthKey] !== undefined) {
        monthlyStats[monthKey] += pago.monto
      }
    })

    const chartData = Object.entries(monthlyStats)
      .map(([date, amount]) => ({
        date: `${date}-01`,
        revenue: amount
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      success: {
        totalStudents,
        totalStaff,
        activeEnrollments,
        totalRevenue: totalRevenue._sum.monto || 0,
        attendanceRate,
        academicAverage: academicStats._avg.valor || 0,
        prospectsCount,
        chartData
      }
    }
  },
  { roles: ["administrativo"] }
)

/**
 * Obtiene las admisiones recientes
 */
export const getRecentAdmissionsAction = createSafeAction(
  z.object({ limit: z.number().optional() }).optional(),
  async (values, session) => {
    const institucionId = session.user.institucionId
    const limit = values?.limit || 5

    const admissions = await prisma.user.findMany({
      where: {
        role: "estudiante",
        institucionId: institucionId || undefined
      },
      include: {
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true
          }
        },
        estado: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    })

    return { success: JSON.parse(JSON.stringify(admissions)) }
  },
  { roles: ["administrativo"] }
)

/**
 * Obtiene estadísticas y alertas para el dashboard del docente
 */
export const getTeacherDashboardAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const teacherId = session.user.id
    const institucionId = session.user.institucionId

    // 1. Obtener cursos del profesor
    const cursos = await prisma.curso.findMany({
      where: { 
        profesorId: teacherId,
        institucionId: institucionId || undefined
      },
      include: {
        areaCurricular: true,
        nivelAcademico: {
          include: { grado: true, nivel: true }
        }
      }
    })

    const cursoIds = cursos.map(c => c.id)

    // 2. Próximas evaluaciones (próximos 7 días)
    const upcomingEvaluations = await prisma.evaluacion.findMany({
      where: {
        cursoId: { in: cursoIds },
        fecha: { 
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        curso: {
          include: { areaCurricular: true, nivelAcademico: { include: { grado: true } } }
        },
        tipoEvaluacion: true
      },
      orderBy: { fecha: "asc" }
    })

    // 3. Alertas de asistencia (estudiantes con falta injustificada reciente)
    const criticalAttendance = await prisma.asistencia.findMany({
      where: {
        presente: false,
        estudiante: {
          matriculas: {
            some: {
              nivelAcademicoId: { in: cursos.map(c => c.nivelAcademicoId) }
            }
          }
        },
        fecha: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // últimos 3 días
        }
      },
      include: {
        estudiante: true
      },
      orderBy: { fecha: "desc" },
      take: 5
    })

    // 4. Progreso de calificación (evaluaciones sin notas registradas)
    const evaluationsToGrade = await prisma.evaluacion.findMany({
      where: {
        cursoId: { in: cursoIds },
        fecha: { lte: new Date() },
        notas: { none: {} } // No tiene notas registradas
      },
      include: {
        curso: {
          include: { areaCurricular: true, nivelAcademico: { include: { grado: true } } }
        },
        tipoEvaluacion: true
      },
      orderBy: { fecha: "desc" },
      take: 5
    })

    return {
      success: {
        cursos,
        upcomingEvaluations: JSON.parse(JSON.stringify(upcomingEvaluations)),
        criticalAttendance: JSON.parse(JSON.stringify(criticalAttendance)),
        evaluationsToGrade: JSON.parse(JSON.stringify(evaluationsToGrade))
      }
    }
  },
  { roles: ["profesor"] }
)
