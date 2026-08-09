"use server"
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma"
import { auth } from "@/auth";
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
    return { data: serialize(horarios) }
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
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    if (id) {
      const horario = await prisma.horario.update({
        where: { id },
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Horario actualizado", data: serialize(horario) }
    } else {
      const horario = await prisma.horario.create({
        data: values
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Horario asignado", data: serialize(horario) }
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
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

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
