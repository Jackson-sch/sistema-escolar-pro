"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/gestion/academico/estructura"

// ==================== NIVELES ====================

/**
 * Obtiene los niveles de la institución
 */
export async function getNivelesAction(institucionId?: string) {
  try {
    const niveles = await prisma.nivel.findMany({
      where: institucionId ? { institucionId } : undefined,
      include: {
        _count: { select: { grados: true } }
      },
      orderBy: { nombre: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(niveles)) }
  } catch (error) {
    console.error("Error fetching niveles:", error)
    return { error: "No se pudieron obtener los niveles" }
  }
}

/**
 * Crea o actualiza un nivel
 */
export async function upsertNivelAction(values: any, id?: string) {
  try {
    if (!values.nombre || values.nombre.trim() === "") {
        return { error: "El nombre del nivel es requerido" }
    }
    if (id) {
      const nivel = await prisma.nivel.update({
        where: { id },
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Nivel actualizado", data: JSON.parse(JSON.stringify(nivel)) }
    } else {
      const nivel = await prisma.nivel.create({
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Nivel creado", data: JSON.parse(JSON.stringify(nivel)) }
    }
  } catch (error: any) {
    console.error("Error upserting nivel:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un nivel con ese nombre" }
    }
    return { error: "No se pudo procesar el nivel" }
  }
}

/**
 * Elimina un nivel
 */
export async function deleteNivelAction(id: string) {
  try {
    await prisma.nivel.delete({ where: { id } })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Nivel eliminado" }
  } catch (error: any) {
    console.error("Error deleting nivel:", error)
    if (error.code === "P2003") {
      return { error: "No se puede eliminar porque tiene grados asociados" }
    }
    return { error: "No se pudo eliminar el nivel" }
  }
}

// ==================== GRADOS ====================

/**
 * Obtiene los grados, opcionalmente filtrados por nivel
 */
export async function getGradosAction(nivelId?: string) {
  try {
    const grados = await prisma.grado.findMany({
      where: nivelId ? { nivelId } : undefined,
      include: {
        nivel: { select: { nombre: true } },
        _count: { select: { nivelesAcademicos: true } }
      },
      orderBy: [{ nivel: { nombre: "asc" } }, { orden: "asc" }]
    })
    return { data: JSON.parse(JSON.stringify(grados)) }
  } catch (error) {
    console.error("Error fetching grados:", error)
    return { error: "No se pudieron obtener los grados" }
  }
}

/**
 * Crea o actualiza un grado
 */
export async function upsertGradoAction(values: any, id?: string) {
  try {
    if (!values.nivelId) return { error: "Debe seleccionar un nivel" }
    if (!values.nombre || values.nombre.trim() === "") return { error: "El nombre es requerido" }
    if (!values.codigo || values.codigo.trim() === "") return { error: "El código es requerido" }

    if (id) {
      const grado = await prisma.grado.update({
        where: { id },
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Grado actualizado", data: JSON.parse(JSON.stringify(grado)) }
    } else {
      const grado = await prisma.grado.create({
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Grado creado", data: JSON.parse(JSON.stringify(grado)) }
    }
  } catch (error: any) {
    console.error("Error upserting grado:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un grado con ese código en el nivel" }
    }
    return { error: "No se pudo procesar el grado" }
  }
}

/**
 * Elimina un grado
 */
export async function deleteGradoAction(id: string) {
  try {
    await prisma.grado.delete({ where: { id } })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Grado eliminado" }
  } catch (error: any) {
    console.error("Error deleting grado:", error)
    if (error.code === "P2003") {
      return { error: "No se puede eliminar porque tiene secciones asociadas" }
    }
    return { error: "No se pudo eliminar el grado" }
  }
}

// ==================== SECCIONES (NivelAcademico) ====================

/**
 * Obtiene las secciones (NivelAcademico), opcionalmente filtradas
 */
export async function getSeccionesAction(filters?: { gradoId?: string; anioAcademico?: number }) {
  try {
    const secciones = await prisma.nivelAcademico.findMany({
      where: {
        gradoId: filters?.gradoId,
        anioAcademico: filters?.anioAcademico
      },
      include: {
        nivel: { select: { nombre: true } },
        grado: { select: { nombre: true, codigo: true } },
        tutor: { select: { name: true, apellidoPaterno: true, image: true } },
        sede: { select: { nombre: true } },
      },
      orderBy: [
        { nivel: { nombre: "asc" } },
        { grado: { orden: "asc" } },
        { seccion: "asc" }
      ]
    })

    // Obtener conteos de matrículas filtrados por año y estado para cada sección
    const counts = await prisma.matricula.groupBy({
      by: ['nivelAcademicoId'],
      where: {
        anioAcademico: filters?.anioAcademico,
        estado: "activo"
      },
      _count: {
        _all: true
      }
    })

    const countMap = new Map(counts.map(c => [c.nivelAcademicoId, c._count._all]))

    const data = secciones.map(s => ({
      ...s,
      _count: {
        matriculas: countMap.get(s.id) || 0
      }
    }))

    return { data: JSON.parse(JSON.stringify(data)) }
  } catch (error) {
    console.error("Error fetching secciones:", error)
    return { error: "No se pudieron obtener las secciones" }
  }
}

/**
 * Crea o actualiza una sección (NivelAcademico)
 */
export async function upsertSeccionAction(values: any, id?: string) {
  try {
    // Obtener el nivelId del grado seleccionado
    if (values.gradoId && !values.nivelId) {
      const grado = await prisma.grado.findUnique({
        where: { id: values.gradoId },
        select: { nivelId: true }
      })
      if (grado) {
        values.nivelId = grado.nivelId
      }
    }

    if (id) {
      const seccion = await prisma.nivelAcademico.update({
        where: { id },
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Sección actualizada", data: JSON.parse(JSON.stringify(seccion)) }
    } else {
      const seccion = await prisma.nivelAcademico.create({
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Sección creada", data: JSON.parse(JSON.stringify(seccion)) }
    }
  } catch (error: any) {
    console.error("Error upserting seccion:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe esta sección para el grado y año académico" }
    }
    return { error: "No se pudo procesar la sección" }
  }
}

/**
 * Elimina una sección
 */
export async function deleteSeccionAction(id: string) {
  try {
    // Verificar si tiene estudiantes matriculados
    const seccion = await prisma.nivelAcademico.findUnique({
      where: { id },
      include: { _count: { select: { matriculas: true, students: true } } }
    })

    if (seccion && (seccion._count.matriculas > 0 || seccion._count.students > 0)) {
      return { error: "No se puede eliminar porque tiene estudiantes matriculados" }
    }

    await prisma.nivelAcademico.delete({ where: { id } })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Sección eliminada" }
  } catch (error) {
    console.error("Error deleting seccion:", error)
    return { error: "No se pudo eliminar la sección" }
  }
}

/**
 * Obtiene los años académicos únicos registrados en las secciones
 */
export async function getAniosAcademicosAction() {
  try {
    const anios = await prisma.nivelAcademico.findMany({
      select: { anioAcademico: true },
      distinct: ['anioAcademico'],
      orderBy: { anioAcademico: 'desc' }
    })
    return { data: anios.map(a => a.anioAcademico) }
  } catch (error) {
    return { error: "Error al cargar años académicos" }
  }
}

/**
 * Obtiene los tutores disponibles (profesores)
 */
export async function getTutoresAction() {
  try {
    const tutores = await prisma.user.findMany({
      where: { role: "profesor" },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true
      },
      orderBy: { apellidoPaterno: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(tutores)) }
  } catch (error) {
    return { error: "Error al cargar tutores" }
  }
}
/**
 * Obtiene los estudiantes matriculados en una sección
 */
export async function getStudentsInSeccionAction(nivelAcademicoId: string) {
  try {
    const students = await prisma.user.findMany({
      where: {
        nivelAcademicoId,
        role: "estudiante",
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
        apellidoMaterno: true
      },
      orderBy: {
        apellidoPaterno: "asc"
      }
    })
    return { data: JSON.parse(JSON.stringify(students)) }
  } catch (error) {
    console.error("Error fetching students in seccion:", error)
    return { error: "No se pudieron obtener los estudiantes" }
  }
}
/**
 * Obtiene los periodos académicos de un año específico
 */
export async function getPeriodosByAnioAction(anio: number) {
  try {
    const periodos = await prisma.periodoAcademico.findMany({
      where: { anioEscolar: anio },
      orderBy: { numero: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(periodos)) }
  } catch (error) {
    console.error("Error fetching periodos:", error)
    return { error: "No se pudieron obtener los periodos" }
  }
}
