"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/gestion/admisiones"

/**
 * Obtiene la lista de prospectos con filtros básicos
 */
export async function getProspectosAction(filters?: { estado?: string; anioPostulacion?: number }) {
  try {
    const prospectos = await prisma.prospecto.findMany({
      where: {
        estado: filters?.estado as any,
        anioPostulacion: filters?.anioPostulacion
      },
      include: {
        admision: true,
        institucion: {
          select: { nombreInstitucion: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return { data: JSON.parse(JSON.stringify(prospectos)) }
  } catch (error) {
    console.error("Error fetching prospectos:", error)
    return { error: "No se pudieron obtener los prospectos" }
  }
}

/**
 * Crea o actualiza un prospecto
 */
export async function upsertProspectoAction(values: any, id?: string) {
  try {
    // Sanitizar datos vacíos
    const data = { ...values }
    if (data.dni === "") data.dni = null
    if (data.email === "") data.email = null

    if (id) {
      const prospecto = await prisma.prospecto.update({
        where: { id },
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Prospecto actualizado", data: JSON.parse(JSON.stringify(prospecto)) }
    } else {
      const prospecto = await prisma.prospecto.create({
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Prospecto registrado correctamente", data: JSON.parse(JSON.stringify(prospecto)) }
    }
  } catch (error: any) {
    console.error("Error upserting prospecto:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un prospecto con este DNI" }
    }
    return { error: "No se pudo procesar el prospecto" }
  }
}

/**
 * Convierte un prospecto a proceso de admisión formal
 */
export async function convertProspectoToAdmisionAction(prospectoId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear registro de admisión
      const admision = await tx.admision.create({
        data: {
          prospectoId,
        }
      })

      // 2. Actualizar estado del prospecto
      await tx.prospecto.update({
        where: { id: prospectoId },
        data: { estado: "EVALUANDO" }
      })

      return admision
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: "Proceso de admisión iniciado", data: JSON.parse(JSON.stringify(result)) }
  } catch (error) {
    console.error("Error converting to admision:", error)
    return { error: "No se pudo iniciar el proceso de admisión" }
  }
}

/**
 * Registra resultados de entrevista o examen
 */
export async function updateAdmisionResultAction(admisionId: string, values: any, finalStatus?: "ADMITIDO" | "RECHAZADO") {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const admision = await tx.admision.update({
        where: { id: admisionId },
        data: values,
        include: { prospecto: true }
      })

      if (finalStatus) {
        await tx.prospecto.update({
          where: { id: admision.prospectoId },
          data: { estado: finalStatus }
        })
      }

      return admision
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: "Gestión de admisión actualizada", data: JSON.parse(JSON.stringify(result)) }
  } catch (error) {
    console.error("Error updating admision:", error)
    return { error: "No se pudo actualizar el resultado de la admisión" }
  }
}
