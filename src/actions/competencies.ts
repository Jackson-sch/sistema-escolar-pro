"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth";
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/gestion/academico/competencias"

/**
 * Crear o editar una competencia
 */
export async function upsertCompetencyAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const { nombre, descripcion, areaCurricularId } = values

    if (id) {
      await prisma.competencia.update({
        where: { id },
        data: { nombre, descripcion, areaCurricularId }
      })
    } else {
      await prisma.competencia.create({
        data: { nombre, descripcion, areaCurricularId }
      })
    }

    revalidatePath(REVALIDATE_PATH)
    revalidatePath("/gestion/academico/areas")
    return { success: "Competencia guardada" }
  } catch (error) {
    console.error("Error upserting competency:", error)
    return { error: "No se pudo guardar la competencia" }
  }
}

/**
 * Eliminar una competencia
 */
export async function deleteCompetencyAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    await prisma.competencia.delete({
      where: { id }
    })
    revalidatePath(REVALIDATE_PATH)
    revalidatePath("/gestion/academico/areas")
    return { success: "Competencia eliminada" }
  } catch (error) {
    console.error("Error deleting competency:", error)
    return { error: "No se pudo eliminar la competencia" }
  }
}

/**
 * Crear o editar una capacidad
 */
export async function upsertCapacityAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const { nombre, descripcion, competenciaId } = values

    if (id) {
      await prisma.capacidad.update({
        where: { id },
        data: { nombre, descripcion, competenciaId }
      })
    } else {
      await prisma.capacidad.create({
        data: { nombre, descripcion, competenciaId }
      })
    }

    revalidatePath(REVALIDATE_PATH)
    revalidatePath("/gestion/academico/areas")
    return { success: "Capacidad guardada" }
  } catch (error) {
    console.error("Error upserting capacity:", error)
    return { error: "No se pudo guardar la capacidad" }
  }
}

/**
 * Eliminar una capacidad
 */
export async function deleteCapacityAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    await prisma.capacidad.delete({
      where: { id }
    })
    revalidatePath(REVALIDATE_PATH)
    revalidatePath("/gestion/academico/areas")
    return { success: "Capacidad eliminada" }
  } catch (error) {
    console.error("Error deleting capacity:", error)
    return { error: "No se pudo eliminar la capacidad" }
  }
}

/**
 * Obtener todas las áreas curriculares, opcionalmente filtradas por nivel
 */
export async function getCurricularAreasAction(nivelId?: string) {
  try {
    const areas = await prisma.areaCurricular.findMany({
      where: nivelId ? { nivelId } : undefined,
      orderBy: { nombre: "asc" },
      include: {
        nivel: true,
      }
    })
    return { data: areas }
  } catch (error) {
    console.error("Error fetching curricular areas:", error)
    return { error: "No se pudieron cargar las áreas" }
  }
}

/**
 * Obtener todas las competencias con sus capacidades de un nivel específico o globales
 */
export async function getCompetenciesByNivelAction(nivelId?: string) {
  try {
    const competencies = await prisma.competencia.findMany({
      where: nivelId
        ? {
            areaCurricular: {
              OR: [
                { nivelId },
                { nivelId: null },
              ],
            },
          }
        : undefined,
      include: {
        capacidades: true,
        areaCurricular: {
          select: {
            nombre: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { data: competencies };
  } catch (error) {
    console.error("Error fetching competencies by nivel:", error);
    return { error: "No se pudieron cargar las competencias para este nivel" };
  }
}
