"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/evaluaciones"

// ==================== TIPOS DE EVALUACIÓN ====================

/**
 * Obtiene los tipos de evaluación
 */
export async function getTiposEvaluacionAction() {
  try {
    const tipos = await prisma.tipoEvaluacion.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(tipos)) }
  } catch (error) {
    console.error("Error fetching tipos:", error)
    return { error: "No se pudieron obtener los tipos de evaluación" }
  }
}

// ==================== PERIODOS ACADÉMICOS ====================

/**
 * Obtiene los periodos académicos
 */
export async function getPeriodosAction(anioEscolar?: number) {
  try {
    const periodos = await prisma.periodoAcademico.findMany({
      where: anioEscolar
        ? { anioEscolar, activo: true }
        : { activo: true },
      orderBy: { fechaInicio: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(periodos)) }
  } catch (error) {
    console.error("Error fetching periodos:", error)
    return { error: "No se pudieron obtener los periodos" }
  }
}

/**
 * Crea o actualiza un periodo académico
 */
export async function upsertPeriodoAction(values: any, id?: string) {
  try {
    const data = {
      ...values,
      fechaInicio: new Date(values.fechaInicio),
      fechaFin: new Date(values.fechaFin),
      numero: parseInt(values.numero),
      anioEscolar: parseInt(values.anioEscolar)
    }

    if (id) {
      const periodo = await prisma.periodoAcademico.update({
        where: { id },
        data
      })
      revalidatePath("/evaluaciones")
      return { success: "Periodo actualizado", data: JSON.parse(JSON.stringify(periodo)) }
    } else {
      const periodo = await prisma.periodoAcademico.create({ data })
      revalidatePath("/evaluaciones")
      return { success: "Periodo creado", data: JSON.parse(JSON.stringify(periodo)) }
    }
  } catch (error) {
    console.error("Error upserting periodo:", error)
    return { error: "No se pudo procesar el periodo" }
  }
}

// ==================== EVALUACIONES ====================

/**
 * Obtiene las evaluaciones de un curso
 */
export async function getEvaluacionesAction(filters?: {
  cursoId?: string
  periodoId?: string
  tipoEvaluacionId?: string
}) {
  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      where: {
        cursoId: filters?.cursoId || undefined,
        periodoId: filters?.periodoId || undefined,
        tipoEvaluacionId: filters?.tipoEvaluacionId || undefined,
        activa: true
      },
      include: {
        tipoEvaluacion: true,
        curso: {
          include: {
            areaCurricular: true,
            nivelAcademico: {
              include: { grado: true }
            }
          }
        },
        periodo: true,
        capacidad: {
          include: {
            competencia: true
          }
        },
        _count: { select: { notas: true } }
      },
      orderBy: { fecha: "desc" }
    })
    return { data: JSON.parse(JSON.stringify(evaluaciones)) }
  } catch (error) {
    console.error("Error fetching evaluaciones:", error)
    return { error: "No se pudieron obtener las evaluaciones" }
  }
}

/**
 * Crea o actualiza una evaluación
 */
export async function upsertEvaluacionAction(values: any, id?: string) {
  try {
    const data = {
      ...values,
      peso: parseFloat(values.peso),
      notaMinima: values.notaMinima ? parseFloat(values.notaMinima) : null,
      fecha: new Date(values.fecha),
      fechaLimite: values.fechaLimite ? new Date(values.fechaLimite) : null,
      capacidadId: values.capacidadId || null
    }

    if (id) {
      const evaluacion = await prisma.evaluacion.update({
        where: { id },
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Evaluación actualizada", data: JSON.parse(JSON.stringify(evaluacion)) }
    } else {
      const evaluacion = await prisma.evaluacion.create({ data })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Evaluación creada", data: JSON.parse(JSON.stringify(evaluacion)) }
    }
  } catch (error) {
    console.error("Error upserting evaluacion:", error)
    return { error: "No se pudo procesar la evaluación" }
  }
}

/**
 * Obtiene las capacidades vinculadas a un curso (vía su área curricular)
 */
export async function getCapacidadesByCursoAction(cursoId: string) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        areaCurricular: {
          include: {
            competencias: {
              include: { capacidades: true }
            }
          }
        }
      }
    })

    if (!curso?.areaCurricular) return { data: [] }

    const capacidades = curso.areaCurricular.competencias.flatMap(comp =>
      comp.capacidades.map(cap => ({
        ...cap,
        competenciaNombre: comp.nombre
      }))
    )

    return { data: JSON.parse(JSON.stringify(capacidades)) }
  } catch (error) {
    console.error("Error fetching capacities by course:", error)
    return { error: "No se pudieron obtener las capacidades" }
  }
}

/**
 * Elimina una evaluación (soft delete)
 */
export async function deleteEvaluacionAction(id: string) {
  try {
    // Verificar si tiene notas registradas
    const notas = await prisma.nota.count({ where: { evaluacionId: id } })
    if (notas > 0) {
      return { error: `No se puede eliminar: tiene ${notas} notas registradas` }
    }

    await prisma.evaluacion.update({
      where: { id },
      data: { activa: false }
    })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Evaluación eliminada" }
  } catch (error) {
    console.error("Error deleting evaluacion:", error)
    return { error: "No se pudo eliminar la evaluación" }
  }
}

// ==================== NOTAS ====================

/**
 * Obtiene las notas de una evaluación
 */
export async function getNotasEvaluacionAction(evaluacionId: string) {
  try {
    const notas = await prisma.nota.findMany({
      where: { evaluacionId },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true
          }
        }
      },
      orderBy: { estudiante: { apellidoPaterno: "asc" } }
    })
    return { data: JSON.parse(JSON.stringify(notas)) }
  } catch (error) {
    console.error("Error fetching notas:", error)
    return { error: "No se pudieron obtener las notas" }
  }
}

/**
 * Obtiene los estudiantes de un curso para registro de notas
 */
export async function getEstudiantesCursoAction(cursoId: string) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        nivelAcademico: true
      }
    })

    if (!curso?.nivelAcademicoId) {
      return { error: "El curso no tiene sección asignada" }
    }

    const estudiantes = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: curso.nivelAcademicoId
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        codigoEstudiante: true
      },
      orderBy: { apellidoPaterno: "asc" }
    })

    return { data: JSON.parse(JSON.stringify(estudiantes)) }
  } catch (error) {
    console.error("Error fetching estudiantes:", error)
    return { error: "No se pudieron obtener los estudiantes" }
  }
}

/**
 * Registra o actualiza una nota
 */
export async function upsertNotaAction(values: {
  estudianteId: string
  evaluacionId: string
  cursoId: string
  valor: number
  valorLiteral?: string
  comentario?: string
}) {
  try {
    // Si se envía valorLiteral, mapeamos a valor numérico para promedios si es necesario
    let valorFinal = values.valor
    if (values.valorLiteral) {
      const mapping: Record<string, number> = {
        'AD': 20,
        'A': 17,
        'B': 13,
        'C': 10
      }
      if (mapping[values.valorLiteral]) {
        valorFinal = mapping[values.valorLiteral]
      }
    }

    const nota = await prisma.nota.upsert({
      where: {
        estudianteId_evaluacionId: {
          estudianteId: values.estudianteId,
          evaluacionId: values.evaluacionId
        }
      },
      update: {
        valor: valorFinal,
        valorLiteral: values.valorLiteral,
        comentario: values.comentario
      },
      create: {
        estudianteId: values.estudianteId,
        evaluacionId: values.evaluacionId,
        cursoId: values.cursoId,
        valor: valorFinal,
        valorLiteral: values.valorLiteral,
        comentario: values.comentario
      }
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: "Nota registrada", data: JSON.parse(JSON.stringify(nota)) }
  } catch (error) {
    console.error("Error upserting nota:", error)
    return { error: "No se pudo registrar la nota" }
  }
}

/**
 * Registra notas masivamente para una evaluación
 */
export async function registrarNotasMasivasAction(
  evaluacionId: string,
  cursoId: string,
  notas: { estudianteId: string; valor: number; valorLiteral?: string; comentario?: string }[]
) {
  try {
    const results = await Promise.all(
      notas.map(nota => {
        // Mapear valor literal si existe para cálculos de promedio consistentes
        let valorFinal = nota.valor
        if (nota.valorLiteral) {
          const mapping: Record<string, number> = {
            'AD': 20,
            'A': 17,
            'B': 13,
            'C': 10
          }
          if (mapping[nota.valorLiteral]) {
            valorFinal = mapping[nota.valorLiteral]
          }
        }

        return prisma.nota.upsert({
          where: {
            estudianteId_evaluacionId: {
              estudianteId: nota.estudianteId,
              evaluacionId
            }
          },
          update: { 
            valor: valorFinal,
            valorLiteral: nota.valorLiteral,
            comentario: nota.comentario
          },
          create: {
            estudianteId: nota.estudianteId,
            evaluacionId,
            cursoId,
            valor: valorFinal,
            valorLiteral: nota.valorLiteral,
            comentario: nota.comentario
          }
        })
      })
    )

    revalidatePath(REVALIDATE_PATH)
    return { success: `${results.length} notas registradas correctamente` }
  } catch (error) {
    console.error("Error registrando notas masivas:", error)
    return { error: "Error al registrar las notas" }
  }
}

/**
 * Obtiene el resumen de notas de un estudiante
 */
export async function getResumenNotasEstudianteAction(estudianteId: string, periodoId?: string) {
  try {
    const notas = await prisma.nota.findMany({
      where: {
        estudianteId,
        evaluacion: periodoId ? { periodoId } : undefined
      },
      include: {
        evaluacion: {
          include: {
            tipoEvaluacion: true,
            periodo: true
          }
        },
        curso: {
          include: { areaCurricular: true }
        }
      },
      orderBy: { fechaRegistro: "desc" }
    })

    // Agrupar por curso
    const notasPorCurso = notas.reduce((acc: any, nota) => {
      const cursoId = nota.cursoId
      if (!acc[cursoId]) {
        acc[cursoId] = {
          curso: nota.curso,
          notas: [],
          promedio: 0
        }
      }
      acc[cursoId].notas.push(nota)
      return acc
    }, {})

    // Calcular promedios
    Object.values(notasPorCurso).forEach((grupo: any) => {
      const sum = grupo.notas.reduce((acc: number, n: any) => acc + n.valor, 0)
      grupo.promedio = grupo.notas.length > 0 ? sum / grupo.notas.length : 0
    })

    return { data: JSON.parse(JSON.stringify(notasPorCurso)) }
  } catch (error) {
    console.error("Error fetching resumen:", error)
    return { error: "No se pudo obtener el resumen de notas" }
  }
}
