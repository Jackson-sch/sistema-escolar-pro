"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/gestion/academico/competencias"

/**
 * Obtener competencias por área curricular
 */
export async function getCompetenciesByAreaAction(areaId: string) {
  try {
    const competencies = await prisma.competencia.findMany({
      where: { areaCurricularId: areaId },
      include: {
        capacidades: true
      },
      orderBy: { createdAt: "asc" }
    })
    return { data: competencies }
  } catch (error) {
    console.error("Error fetching competencies:", error)
    return { error: "No se pudieron cargar las competencias" }
  }
}

/**
 * Crear o editar una competencia
 */
export async function upsertCompetencyAction(values: any, id?: string) {
  try {
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
    await prisma.competencia.delete({
      where: { id }
    })
    revalidatePath(REVALIDATE_PATH)
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
    await prisma.capacidad.delete({
      where: { id }
    })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Capacidad eliminada" }
  } catch (error) {
    console.error("Error deleting capacity:", error)
    return { error: "No se pudo eliminar la capacidad" }
  }
}

/**
 * Obtener todas las áreas curriculares (para el select de configuración)
 */
export async function getCurricularAreasAction() {
  try {
    const areas = await prisma.areaCurricular.findMany({
      orderBy: { nombre: "asc" }
    })
    return { data: areas }
  } catch (error) {
    console.error("Error fetching curricular areas:", error)
    return { error: "No se pudieron cargar las áreas" }
  }
}
