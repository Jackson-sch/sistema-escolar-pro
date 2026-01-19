"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

const REVALIDATE_PATH = "/comunicaciones"

/**
 * Obtiene los anuncios vigentes
 */
export async function getAnunciosAction(filters?: { nivelId?: string; gradoId?: string; activo?: boolean }) {
  try {
    const anuncios = await prisma.anuncio.findMany({
      where: {
        activo: filters?.activo ?? true,
        AND: [
          filters?.nivelId ? { OR: [{ dirigidoA: "TODOS" }, { niveles: { some: { id: filters.nivelId } } }] } : {},
          filters?.gradoId ? { OR: [{ dirigidoA: "TODOS" }, { grados: { some: { id: filters.gradoId } } }] } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      },
      include: {
        autor: {
          select: { name: true, image: true, apellidoPaterno: true }
        }
      },
      orderBy: [
        { fijado: "desc" },
        { fechaPublicacion: "desc" }
      ]
    })
    return { data: JSON.parse(JSON.stringify(anuncios)) }
  } catch (error) {
    console.error("Error fetching anuncios:", error)
    return { error: "No se pudieron obtener los anuncios" }
  }
}

/**
 * Obtiene los eventos del calendario
 */
export async function getEventosAction(filters?: { range?: { start: Date; end: Date } }) {
  try {
    const eventos = await prisma.evento.findMany({
      where: filters?.range ? {
        fechaInicio: {
          gte: filters.range.start,
          lte: filters.range.end
        }
      } : undefined,
      include: {
        organizador: {
          select: { name: true, image: true }
        }
      },
      orderBy: { fechaInicio: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(eventos)) }
  } catch (error) {
    console.error("Error fetching eventos:", error)
    return { error: "No se pudieron obtener los eventos" }
  }
}

/**
 * Crea o actualiza un anuncio
 */
export async function upsertAnuncioAction(values: any, id?: string) {
  try {
    console.log(`[upsertAnuncioAction] Start - id: ${id}`, values)

    const session = await auth()
    if (!session?.user?.email) return { error: "No autorizado" }

    // Buscar el usuario en la DB para asegurar que tenemos un ID válido
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) return { error: "Usuario no encontrado en la base de datos" }

    const { grados, niveles, ...data } = values

    if (id) {
      console.log(`[upsertAnuncioAction] Updating announcement with id: ${id}`)
      const anuncio = await prisma.anuncio.update({
        where: { id },
        data: {
          ...data,
          grados: grados ? { set: grados.map((id: string) => ({ id })) } : undefined,
          niveles: niveles ? { set: niveles.map((id: string) => ({ id })) } : undefined
        }
      })
      console.log(`[upsertAnuncioAction] Updated successfully: ${anuncio.id}`)
      revalidatePath(REVALIDATE_PATH)
      return { success: "Anuncio actualizado", data: JSON.parse(JSON.stringify(anuncio)) }
    } else {
      console.log(`[upsertAnuncioAction] Creating new announcement`)
      const anuncio = await prisma.anuncio.create({
        data: {
          ...data,
          autorId: user.id,
          grados: grados ? { connect: grados.map((id: string) => ({ id })) } : undefined,
          niveles: niveles ? { connect: niveles.map((id: string) => ({ id })) } : undefined
        }
      })
      console.log(`[upsertAnuncioAction] Created successfully: ${anuncio.id}`)
      revalidatePath(REVALIDATE_PATH)
      return { success: "Anuncio publicado", data: JSON.parse(JSON.stringify(anuncio)) }
    }
  } catch (error) {
    console.error("❌ Error upserting anuncio:", error)
    return { error: `No se pudo procesar el anuncio: ${error instanceof Error ? error.message : "Error desconocido"}` }
  }
}

/**
 * Crea o actualiza un evento
 */
export async function upsertEventoAction(values: any, id?: string) {
  try {
    console.log(`[upsertEventoAction] Start - id: ${id}`, values)

    const session = await auth()
    if (!session?.user?.email) return { error: "No autorizado" }

    // Buscar el usuario en la DB para asegurar que tenemos un ID válido
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) return { error: "Usuario no encontrado en la base de datos" }

    const { grados, niveles, ...data } = values

    if (id) {
      console.log(`[upsertEventoAction] Updating event with id: ${id}`)
      const evento = await prisma.evento.update({
        where: { id },
        data: {
          ...data,
          grados: grados ? { set: grados.map((id: string) => ({ id })) } : undefined,
          niveles: niveles ? { set: niveles.map((id: string) => ({ id })) } : undefined
        }
      })
      console.log(`[upsertEventoAction] Updated successfully: ${evento.id}`)
      revalidatePath(REVALIDATE_PATH)
      return { success: "Evento actualizado", data: JSON.parse(JSON.stringify(evento)) }
    } else {
      console.log(`[upsertEventoAction] Creating new event`)
      const evento = await prisma.evento.create({
        data: {
          ...data,
          organizadorId: user.id,
          grados: grados ? { connect: grados.map((id: string) => ({ id })) } : undefined,
          niveles: niveles ? { connect: niveles.map((id: string) => ({ id })) } : undefined
        }
      })
      console.log(`[upsertEventoAction] Created successfully: ${evento.id}`)
      revalidatePath(REVALIDATE_PATH)
      return { success: "Evento programado", data: JSON.parse(JSON.stringify(evento)) }
    }
  } catch (error) {
    console.error("❌ Error upserting evento:", error)
    return { error: `No se pudo procesar el evento: ${error instanceof Error ? error.message : "Error desconocido"}` }
  }
}
