"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/configuracion/institucion"

/**
 * Obtiene los datos de la institución educativa.
 * Asume que solo existe una por ahora.
 */
export async function getInstitucionAction() {
  try {
    const institucion = await prisma.institucionEducativa.findFirst()
    return { data: institucion ? JSON.parse(JSON.stringify(institucion)) : null }
  } catch (error) {
    console.error("Error fetching institucion:", error)
    return { error: "No se pudieron obtener los datos de la institución" }
  }
}

/**
 * Actualiza los datos de la institución educativa.
 */
export async function updateInstitucionAction(id: string, values: any) {
  try {
    const {
      cicloEscolarActual,
      fechaInicioClases,
      fechaFinClases,
      ...rest
    } = values

    let logoProcessed = undefined
    if (values.logo instanceof File) {
      // Si es un archivo, lo convertimos a Base64 en el servidor o lo manejamos
      // Por ahora, asumimos que el cliente enviará Base64 o que el servidor lo manejará.
      // Pero como estamos en Next.js Server Actions, el objeto File es serializable si se envía por FormData,
      // pero aquí estamos recibiendo un objeto JSON plano.
      // Ajustamos: El componente de cliente enviará el string Base64 si queremos persistencia inmediata,
      // o manejaremos el buffer aquí si fuera un FormData.
    }

    const data = {
      ...rest,
      logo: typeof values.logo === 'string' ? values.logo : undefined,
      cicloEscolarActual: parseInt(cicloEscolarActual.toString()) || 2025,
      fechaInicioClases: fechaInicioClases ? new Date(fechaInicioClases) : undefined,
      fechaFinClases: fechaFinClases ? new Date(fechaFinClases) : undefined,
    }

    const institucion = await prisma.institucionEducativa.update({
      where: { id },
      data
    })

    // Sincronizar con la Sede Principal
    // Buscamos si ya existe una sede principal para esta institución
    const sedePrincipal = await prisma.sede.findFirst({
      where: {
        institucionId: id,
        esPrincipal: true
      }
    })

    if (sedePrincipal) {
      // Actualizar sede principal existente
      await prisma.sede.update({
        where: { id: sedePrincipal.id },
        data: {
          nombre: values.nombreInstitucion,
          direccion: values.direccion,
          telefono: values.telefono,
          email: values.email,
          logo: typeof values.logo === 'string' ? values.logo : undefined,
          activo: true
        }
      })
    } else {
      // Crear sede principal si no existe
      await prisma.sede.create({
        data: {
          nombre: values.nombreInstitucion,
          direccion: values.direccion,
          telefono: values.telefono,
          email: values.email,
          logo: typeof values.logo === 'string' ? values.logo : undefined,
          esPrincipal: true,
          institucionId: id,
          activo: true
        }
      })
    }

    revalidatePath(REVALIDATE_PATH)
    revalidatePath("/finanzas")

    return { success: "Datos de la institución y sede principal actualizados correctamente" }
  } catch (error: any) {
    console.error("Error updating institucion:", error)
    return { error: `No se pudieron actualizar los datos: ${error.message}` }
  }
}
