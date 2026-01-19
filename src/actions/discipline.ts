"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

const REVALIDATE_PATH = "/gestion/estudiantes"

/**
 * Obtener categorías de incidentes/seguimiento
 */
export async function getIncidentCategoriesAction() {
  try {
    const categories = await prisma.categoriaIncidente.findMany({
      orderBy: { nombre: "asc" }
    })
    return { data: categories }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { error: "No se pudieron cargar las categorías" }
  }
}

/**
 * Crear o Actualizar una Ficha Psicopedagógica / Registro Disciplinario
 */
export async function upsertPsychopedagogicalAction(values: any, id?: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "No autorizado" }
    }

    const {
      estudianteId,
      categoriaId,
      motivo,
      descripcion,
      recomendaciones,
      fecha,
      visibleParaPadres
    } = values

    const commonData = {
      motivo,
      descripcion,
      recomendaciones,
      visibleParaPadres: !!visibleParaPadres,
    }

    if (id) {
      await prisma.fichaPsicopedagogica.update({
        where: { id },
        data: {
          ...commonData,
          fecha: fecha ? new Date(fecha) : undefined,
          categoria: { connect: { id: categoriaId } },
        }
      })
    } else {
      await prisma.fichaPsicopedagogica.create({
        data: {
          ...commonData,
          fecha: fecha ? new Date(fecha) : new Date(),
          estudiante: { connect: { id: estudianteId } },
          especialista: { connect: { id: session.user.id } },
          categoria: { connect: { id: categoriaId } },
        }
      })
    }

    revalidatePath(REVALIDATE_PATH)
    return { success: "Registro guardado correctamente" }
  } catch (error: any) {
    console.error("DEBUG: Error upserting psych record:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { error: `Error: ${errorMessage}` }
  }
}

/**
 * Eliminar un registro
 */
export async function deletePsychopedagogicalAction(id: string) {
  try {
    await prisma.fichaPsicopedagogica.delete({
      where: { id }
    })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Registro eliminado" }
  } catch (error) {
    console.error("Error deleting psych record:", error)
    return { error: "No se pudo eliminar el registro" }
  }
}

/**
 * Obtener el historial de un estudiante
 */
export async function getStudentPsychHistoryAction(studentId: string) {
  try {
    const history = await prisma.fichaPsicopedagogica.findMany({
      where: { estudianteId: studentId },
      include: {
        categoria: true,
        especialista: {
          select: {
            name: true,
            apellidoPaterno: true,
            image: true
          }
        }
      },
      orderBy: { fecha: "desc" }
    })
    return { data: history }
  } catch (error) {
    console.error("Error fetching student psych history:", error)
    return { error: "No se pudo cargar el historial" }
  }
}

/**
 * Obtener los registros disciplinarios visibles para los padres
 */
export async function getStudentDisciplineRecordsForParentAction(studentId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "No autorizado" }
    }

    // Verificar que el estudiante pertenece al padre
    const esHijo = await prisma.relacionFamiliar.findFirst({
      where: {
        padreTutorId: session.user.id,
        hijoId: studentId
      }
    })

    if (!esHijo) {
      return { error: "No autorizado para ver este estudiante" }
    }

    const records = await prisma.fichaPsicopedagogica.findMany({
      where: {
        estudianteId: studentId,
        visibleParaPadres: true
      },
      include: {
        categoria: true,
        especialista: {
          select: {
            name: true,
            apellidoPaterno: true
          }
        }
      },
      orderBy: { fecha: "desc" }
    })
    
    return { data: records }
  } catch (error) {
    console.error("Error fetching discipline records for parent:", error)
    return { error: "No se pudieron cargar los registros" }
  }
}
