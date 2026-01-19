"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/gestion/academico/horarios"

/**
 * Obtiene el horario de una sección específica
 */
export async function getHorariosBySeccionAction(seccionId: string) {
  try {
    const horarios = await prisma.horario.findMany({
      where: {
        curso: {
          nivelAcademicoId: seccionId
        }
      },
      include: {
        curso: {
          include: {
            areaCurricular: true,
            profesor: {
              select: {
                name: true,
                apellidoPaterno: true
              }
            }
          }
        }
      },
      orderBy: [
        { diaSemana: "asc" },
        { horaInicio: "asc" }
      ]
    })
    return { data: JSON.parse(JSON.stringify(horarios)) }
  } catch (error) {
    console.error("Error fetching horarios:", error)
    return { error: "No se pudieron obtener los horarios" }
  }
}

/**
 * Crea o actualiza un bloque de horario
 */
export async function upsertHorarioAction(values: any, id?: string) {
  try {
    if (id) {
      const horario = await prisma.horario.update({
        where: { id },
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Horario actualizado", data: JSON.parse(JSON.stringify(horario)) }
    } else {
      const horario = await prisma.horario.create({
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Horario asignado", data: JSON.parse(JSON.stringify(horario)) }
    }
  } catch (error: any) {
    console.error("Error upserting horario:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un curso asignado a esta hora y día" }
    }
    return { error: "No se pudo procesar el horario" }
  }
}

/**
 * Elimina un bloque de horario
 */
export async function deleteHorarioAction(id: string) {
  try {
    await prisma.horario.delete({
      where: { id }
    })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Horario eliminado correctamente" }
  } catch (error) {
    console.error("Error deleting horario:", error)
    return { error: "No se pudo eliminar el horario" }
  }
}
