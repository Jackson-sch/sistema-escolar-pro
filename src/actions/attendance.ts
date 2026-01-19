"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Obtiene la asistencia de una sección para una fecha específica
 */
export async function getAsistenciaAction(nivelAcademicoId: string, fecha: Date) {
  try {
    // Normalizar fecha a inicio del día
    const startOfDay = new Date(fecha)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(fecha)
    endOfDay.setHours(23, 59, 59, 999)

    // Buscar si la sección tiene cursos asignados para obtener el cursoId
    // Nota: El esquema requiere un cursoId, así que usaremos el primero que encontremos
    const curso = await prisma.curso.findFirst({
      where: { nivelAcademicoId }
    })

    // Obtener alumnos matriculados en esta sección
    const alumnos = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId,
        matriculas: {
          some: {
            estado: "activo"
          }
        }
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        image: true,
        asistencias: {
          where: {
            fecha: {
              gte: startOfDay,
              lte: endOfDay
            },
            ...(curso?.id ? { cursoId: curso.id } : {})
          }
        }
      },
      orderBy: {
        apellidoPaterno: "asc"
      }
    })

    return { data: JSON.parse(JSON.stringify(alumnos)), cursoId: curso?.id }
  } catch (error) {
    console.error("Error fetching asistencia:", error)
    return { error: "No se pudo obtener el registro de asistencia" }
  }
}

/**
 * Registra o actualiza la asistencia masiva
 */
export async function upsertAsistenciaAction(asistencias: {
  estudianteId: string,
  cursoId: string,
  fecha: Date,
  presente: boolean,
  tardanza: boolean,
  justificada: boolean,
  justificacion?: string
}[]) {
  try {
    const results = await Promise.all(
      asistencias.map(async (asist) => {
        const startOfDay = new Date(asist.fecha)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(asist.fecha)
        endOfDay.setHours(23, 59, 59, 999)

        // Buscar si ya existe para ese día y curso
        const existing = await prisma.asistencia.findFirst({
          where: {
            estudianteId: asist.estudianteId,
            cursoId: asist.cursoId,
            fecha: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        })

        if (existing) {
          return prisma.asistencia.update({
            where: { id: existing.id },
            data: {
              presente: asist.presente,
              tardanza: asist.tardanza,
              justificada: asist.justificada,
              justificacion: asist.justificacion
            }
          })
        } else {
          return prisma.asistencia.create({
            data: {
              estudianteId: asist.estudianteId,
              cursoId: asist.cursoId,
              fecha: asist.fecha,
              presente: asist.presente,
              tardanza: asist.tardanza,
              justificada: asist.justificada,
              justificacion: asist.justificacion
            }
          })
        }
      })
    )

    revalidatePath("/asistencia")
    return { success: "Asistencia guardada correctamente", data: JSON.parse(JSON.stringify(results)) }
  } catch (error) {
    console.error("Error upserting asistencia:", error)
    return { error: "No se pudo guardar la asistencia (verifique si la sección tiene cursos asignados)" }
  }
}

/**
 * Obtiene estadísticas de asistencia para un dashboard
 */
export async function getAsistenciaStatsAction(nivelAcademicoId?: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const total = await prisma.asistencia.count({
      where: {
        fecha: { gte: today },
        ...(nivelAcademicoId ? { curso: { nivelAcademicoId } } : {})
      }
    })

    const presentes = await prisma.asistencia.count({
      where: {
        presente: true,
        fecha: { gte: today },
        ...(nivelAcademicoId ? { curso: { nivelAcademicoId } } : {})
      }
    })

    return { data: { total, presentes, ausentes: total - presentes } }
  } catch (error) {
    return { error: "Fallo al obtener estadísticas" }
  }
}

/**
 * Obtiene el reporte mensual de asistencia para una sección
 */
export async function getMonthlyAsistenciaReportAction(seccionId: string, mes: number, anio: number) {
  try {
    const startDate = new Date(anio, mes, 1)
    const endDate = new Date(anio, mes + 1, 0, 23, 59, 59, 999)

    // Obtener alumnos matriculados en esta sección
    const alumnos = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: seccionId,
        matriculas: {
          some: {
            estado: "activo"
          }
        }
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        asistencias: {
          where: {
            fecha: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            fecha: true,
            presente: true,
            tardanza: true,
            justificada: true
          }
        }
      },
      orderBy: {
        apellidoPaterno: "asc"
      }
    })

    return {
      data: JSON.parse(JSON.stringify(alumnos)),
      meta: {
        totalDias: endDate.getDate(),
        mes,
        anio
      }
    }
  } catch (error) {
    console.error("Error fetching monthly report:", error)
    return { error: "No se pudo obtener el reporte mensual" }
  }
}

/**
 * Obtiene alumnos con alertas de inasistencia (falla mayor al 15%)
 */
export async function getAttendanceAlertsAction(anioAcademico: number, seccionId?: string) {
  try {
    const threshold = 0.15 // 15% de inasistencia

    // Obtener total de días lectivos registrados hasta hoy en el año
    const totalDiasRes = await prisma.asistencia.groupBy({
      by: ['fecha'],
      where: {
        fecha: {
          gte: new Date(anioAcademico, 0, 1),
          lte: new Date(anioAcademico + 1, 0, 0)
        }
      }
    })
    const totalDiasYear = totalDiasRes.length

    if (totalDiasYear === 0) return { data: [], meta: { totalDias: 0 } }

    const alumnos = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: seccionId || undefined,
        matriculas: {
          some: {
            anioAcademico,
            estado: "activo"
          }
        }
      },
      include: {
        nivelAcademico: {
          include: {
            grado: true
          }
        },
        asistencias: {
          where: {
            fecha: {
              gte: new Date(anioAcademico, 0, 1),
              lte: new Date()
            }
          }
        }
      }
    })

    const alertas = alumnos.map(alumno => {
      const faltas = alumno.asistencias.filter((a: any) => !a.presente && !a.justificada).length
      const porcentajeFaltas = totalDiasYear > 0 ? (faltas / totalDiasYear) * 100 : 0

      return {
        id: alumno.id,
        nombre: `${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`,
        seccion: `${alumno.nivelAcademico?.grado.nombre} "${alumno.nivelAcademico?.seccion}"`,
        faltas,
        totalDias: totalDiasYear,
        porcentaje: Number(porcentajeFaltas.toFixed(2))
      }
    }).filter(a => a.porcentaje >= (threshold * 100))
      .sort((a, b) => b.porcentaje - a.porcentaje)

    return { data: JSON.parse(JSON.stringify(alertas)) }
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return { error: "Fallo al obtener alertas" }
  }
}

/**
 * Obtiene el resumen institucional de asistencia para una fecha específica
 */
export async function getInstitutionalSummaryAction(fecha: Date) {
  try {
    const start = new Date(fecha)
    start.setHours(0, 0, 0, 0)
    const end = new Date(fecha)
    end.setHours(23, 59, 59, 999)

    const niveles = await prisma.nivelAcademico.findMany({
      include: {
        grado: true,
        institucion: true
      }
    })

    const summary = await Promise.all(niveles.map(async (nivel) => {
      const asistencias = await prisma.asistencia.findMany({
        where: {
          estudiante: {
            nivelAcademicoId: nivel.id
          },
          fecha: {
            gte: start,
            lte: end
          }
        }
      })

      const matriculados = await prisma.matricula.count({
        where: {
          nivelAcademicoId: nivel.id,
          estado: "activo"
        }
      })

      return {
        id: nivel.id,
        nombre: `${nivel.grado.nombre} "${nivel.seccion}"`,
        presentes: asistencias.filter(a => a.presente).length,
        ausentes: matriculados - asistencias.filter(a => a.presente).length,
        total: matriculados
      }
    }))

    return { data: JSON.parse(JSON.stringify(summary)) }
  } catch (error) {
    console.error("Error institutional summary:", error)
    return { error: "Fallo al obtener resumen institucional" }
  }
}

/**
 * Obtiene el historial anual de un estudiante
 */
export async function getStudentAnnualAttendanceAction(estudianteId: string, anio: number) {
  try {
    const asistencias = await prisma.asistencia.findMany({
      where: {
        estudianteId,
        fecha: {
          gte: new Date(anio, 0, 1),
          lte: new Date(anio, 11, 31)
        }
      },
      orderBy: { fecha: 'asc' }
    })

    // Agrupar por mes
    const summary = Array.from({ length: 12 }, (_, i) => {
      const mesAsis = asistencias.filter(a => new Date(a.fecha).getMonth() === i)
      return {
        mes: i,
        presentes: mesAsis.filter(a => a.presente && !a.tardanza && !a.justificada).length,
        ausentes: mesAsis.filter(a => !a.presente && !a.justificada).length,
        tardanzas: mesAsis.filter(a => a.tardanza).length,
        justificadas: mesAsis.filter(a => a.justificada).length
      }
    })

    return { data: JSON.parse(JSON.stringify(summary)) }
  } catch (error) {
    console.error("Error student annual attendance:", error)
    return { error: "No se pudo obtener el historial anual" }
  }
}

/**
 * Obtiene la lista de justificaciones registradas
 */
export async function getJustificacionesAction(anio: number, seccionId?: string) {
  try {
    const justificaciones = await prisma.asistencia.findMany({
      where: {
        justificada: true,
        fecha: {
          gte: new Date(anio, 0, 1),
          lte: new Date(anio, 11, 31)
        },
        estudiante: {
          nivelAcademicoId: seccionId === "all" ? undefined : seccionId || undefined
        }
      },
      include: {
        estudiante: {
          select: {
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            nivelAcademico: {
              include: {
                grado: true
              }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    })

    const data = justificaciones.map(j => ({
      id: j.id,
      fecha: j.fecha,
      estudiante: `${j.estudiante.apellidoPaterno} ${j.estudiante.apellidoMaterno}, ${j.estudiante.name}`,
      seccion: `${j.estudiante.nivelAcademico?.grado.nombre} "${j.estudiante.nivelAcademico?.seccion}"`,
      justificacion: j.justificacion || "Sin detalle"
    }))

    return { data: JSON.parse(JSON.stringify(data)) }
  } catch (error) {
    console.error("Error fetching justifications:", error)
    return { error: "No se pudo obtener el reporte de justificaciones" }
  }
}
