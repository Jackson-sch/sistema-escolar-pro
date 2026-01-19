"use server"

import prisma from "@/lib/prisma"

/**
 * Obtiene toda la información necesaria para generar una libreta de notas
 * de un estudiante en un periodo específico.
 */
export async function getGradeReportDataAction(studentId: string, anioAcademico: number) {
  try {
    // 1. Obtener datos del estudiante y su nivel académico
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: {
            grado: {
              include: {
                nivel: true
              }
            },
            institucion: true
          }
        }
      }
    })

    if (!student || !student.nivelAcademicoId) {
      return { error: "Estudiante no encontrado o sin sección asignada" }
    }

    // 2. Obtener todos los periodos del año académico (aseguramos que al menos se mencionen los 4 bimestres)
    const allPeriodos = await prisma.periodoAcademico.findMany({
      where: {
        anioEscolar: anioAcademico,
        institucionId: student.institucionId || undefined
      },
      orderBy: { numero: "asc" }
    })

    // 3. Obtener todos los cursos asignados a la sección del estudiante
    const cursos = await prisma.curso.findMany({
      where: {
        nivelAcademicoId: student.nivelAcademicoId,
        anioAcademico: anioAcademico,
        activo: true
      },
      include: {
        areaCurricular: true,
        profesor: {
          select: { name: true, apellidoPaterno: true, apellidoMaterno: true }
        }
      },
      orderBy: { areaCurricular: { orden: "asc" } }
    })

    // 4. Obtener todas las notas del estudiante para ese año
    const notas = await prisma.nota.findMany({
      where: {
        estudianteId: studentId,
        curso: {
          nivelAcademicoId: student.nivelAcademicoId,
          anioAcademico: anioAcademico
        }
      },
      include: {
        evaluacion: {
          include: {
            tipoEvaluacion: true
          }
        }
      }
    })

    const getLiteral = (valor: number) => {
      if (valor >= 17) return "AD"
      if (valor >= 14) return "A"
      if (valor >= 11) return "B"
      return "C"
    }

    // 5. Estructurar la información para el reporte
    const reporteMap = cursos.map(curso => {
      const notasDelCurso = notas.filter(n => n.cursoId === curso.id)

      const promediosPorPeriodo = allPeriodos.map(periodo => {
        const notasDelPeriodo = notasDelCurso.filter(n => n.evaluacion.periodoId === periodo.id)

        let promedioNum = 0
        if (notasDelPeriodo.length > 0) {
          const sumaPesos = notasDelPeriodo.reduce((acc, n) => acc + (n.evaluacion.peso || 1), 0)
          const sumaNotas = notasDelPeriodo.reduce((acc, n) => acc + (n.valor * (n.evaluacion.peso || 1)), 0)
          promedioNum = Math.round(sumaNotas / sumaPesos)
        }

        return {
          periodoId: periodo.id,
          periodoNombre: periodo.nombre,
          promedio: promedioNum,
          literal: promedioNum > 0 ? getLiteral(promedioNum) : ""
        }
      })

      const validPromedios = promediosPorPeriodo.filter(p => p.promedio > 0)
      const sumPromedios = validPromedios.reduce((acc, p) => acc + p.promedio, 0)
      const promedioFinal = validPromedios.length > 0 ? Math.round(sumPromedios / validPromedios.length) : 0

      return {
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        areaNombre: curso.areaCurricular.nombre,
        profesor: `${curso.profesor.name} ${curso.profesor.apellidoPaterno}`,
        periodos: promediosPorPeriodo,
        promedioFinal: promedioFinal,
        literalFinal: promedioFinal > 0 ? getLiteral(promedioFinal) : ""
      }
    })

    return {
      data: {
        estudiante: {
          id: student.id,
          nombreCompleto: `${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`,
          dni: student.dni,
          codigo: student.codigoEstudiante,
          grado: student.nivelAcademico?.grado.nombre || "N/A",
          seccion: student.nivelAcademico?.seccion || "N/A",
          nivel: student.nivelAcademico?.grado.nivel.nombre || "N/A",
          institucion: student.nivelAcademico?.institucion.nombreInstitucion || "N/A"
        },
        periodos: allPeriodos,
        cursos: reporteMap,
        anioAcademico: anioAcademico,
        // Datos mock/calculados para las filas de resumen
        resumen: {
          puntajes: allPeriodos.map(p => {
             const sum = reporteMap.reduce((acc, c) => acc + (c.periodos.find(per => per.periodoId === p.id)?.promedio || 0), 0)
             return sum
          }),
          promedios: allPeriodos.map(p => {
             const sum = reporteMap.reduce((acc, c) => acc + (c.periodos.find(per => per.periodoId === p.id)?.promedio || 0), 0)
             return sum > 0 ? Math.round(sum / (cursos.length || 1)) : 0
          })
        }
      }
    }
  } catch (error) {
    console.error("Error generating report data:", error)
    return { error: "Error al obtener los datos para el reporte" }
  }
}
/**
 * Obtiene datos para reporte cualitativo (Boleta de Notas por Competencias)
 */
export async function getQualitativeReportDataAction(studentId: string, periodoId: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: {
            grado: {
              include: {
                nivel: true
              }
            },
            institucion: true
          }
        }
      }
    })

    if (!student || !student.nivelAcademico) return { error: "Estudiante no encontrado o sin sección asignada" }

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id: periodoId }
    })

    if (!periodo) return { error: "Periodo no encontrado" }

    // Obtener todas las notas del periodo con info de competencia
    const notas = await prisma.nota.findMany({
      where: {
        estudianteId: studentId,
        evaluacion: { periodoId }
      },
      include: {
        evaluacion: {
          include: {
            curso: {
              include: {
                areaCurricular: true
              }
            },
            capacidad: {
              include: {
                competencia: {
                  include: {
                    areaCurricular: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Agrupar y procesar para la boleta
    const processedGrades = notas.map(n => ({
      area: n.evaluacion.capacidad?.competencia.areaCurricular.nombre ||
        n.evaluacion.curso?.areaCurricular.nombre ||
        "Sin Área",
      competencia: n.evaluacion.capacidad?.competencia.nombre || "Logro General",
      valor: n.valor,
      notaLiteral: n.valorLiteral || (n.valor >= 17 ? 'AD' : n.valor >= 14 ? 'A' : n.valor >= 11 ? 'B' : 'C')
    }))

    return {
      data: {
        student: {
          name: student.name,
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          dni: student.dni,
          codigoEstudiante: student.codigoEstudiante,
          nivelAcademico: {
            seccion: student.nivelAcademico.seccion,
            grado: {
              nombre: student.nivelAcademico.grado.nombre,
              nivel: {
                nombre: student.nivelAcademico.grado.nivel.nombre
              }
            }
          }
        },
        institucion: student.nivelAcademico.institucion,
        notas: processedGrades,
        periodoNombre: periodo.nombre,
        anioAcademico: periodo.anioEscolar
      }
    }
  } catch (error) {
    console.error("Error fetching qualitative report data:", error)
    return { error: "Error al generar datos del reporte" }
  }
}

/**
 * Obtiene datos para Constancia de Estudios
 */
export async function getConstanciaDataAction(studentId: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: {
            grado: { include: { nivel: true } },
            institucion: true
          }
        }
      }
    })

    if (!student || !student.nivelAcademico) return { error: "Estudiante no encontrado" }

    return {
      data: JSON.parse(JSON.stringify({
        student: {
          id: student.id,
          name: student.name,
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          dni: student.dni,
          nivelAcademico: {
            seccion: student.nivelAcademico.seccion,
            grado: { nombre: student.nivelAcademico.grado.nombre },
            nivel: { nombre: student.nivelAcademico.grado.nivel.nombre }
          }
        },
        institucion: student.nivelAcademico.institucion,
        anioAcademico: student.nivelAcademico.anioAcademico
      }))
    }
  } catch (error) {
    console.error("Error fetching constancia data:", error)
    return { error: "Error al generar datos de la constancia" }
  }
}

/**
 * Obtiene datos para Constancia de Matrícula
 */
export async function getEnrollmentDataAction(studentId: string) {
  try {
    const enrollment = await prisma.matricula.findFirst({
      where: {
        estudianteId: studentId,
        estado: "activo"
      },
      orderBy: { fechaMatricula: "desc" },
      include: {
        estudiante: true,
        nivelAcademico: {
          include: {
            grado: { include: { nivel: true } },
            institucion: true
          }
        }
      }
    })

    if (!enrollment) return { error: "Matrícula no encontrada" }

    const matriculaDoc = enrollment as any;

    return {
      data: JSON.parse(JSON.stringify({
        enrollment: {
          id: matriculaDoc.id,
          anioAcademico: matriculaDoc.anioAcademico,
          estudiante: matriculaDoc.estudiante,
          nivelAcademico: matriculaDoc.nivelAcademico ? {
            seccion: matriculaDoc.nivelAcademico.seccion,
            grado: { nombre: matriculaDoc.nivelAcademico.grado.nombre },
            nivel: { nombre: matriculaDoc.nivelAcademico.grado.nivel.nombre }
          } : null
        },
        institucion: matriculaDoc.nivelAcademico?.institucion
      }))
    }
  } catch (error) {
    console.error("Error fetching enrollment data:", error)
    return { error: "Error al generar datos de la matrícula" }
  }
}
