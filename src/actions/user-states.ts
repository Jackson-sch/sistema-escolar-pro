"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/configuracion/usuarios/estados"

/**
 * Obtiene todos los estados de usuario
 */
export async function getUserStatesAction(institucionId?: string) {
  try {
    const states = await prisma.estadoUsuario.findMany({
      where: institucionId ? { institucionId } : undefined,
      include: {
        _count: { select: { usuarios: true } }
      },
      orderBy: { orden: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(states)) }
  } catch (error) {
    console.error("Error fetching user states:", error)
    return { error: "No se pudieron obtener los estados de usuario" }
  }
}

/**
 * Crea o actualiza un estado de usuario
 */
export async function upsertUserStateAction(values: any, id?: string) {
  try {
    if (!values.codigo || values.codigo.trim() === "") {
      return { error: "El código es requerido" }
    }
    if (!values.nombre || values.nombre.trim() === "") {
        return { error: "El nombre es requerido" }
    }

    if (id) {
      const state = await prisma.estadoUsuario.update({
        where: { id },
        data: {
          ...values,
          activo: values.esActivo ?? true
        }
      })
      revalidatePath(REVALIDATE_PATH)
      revalidatePath("/gestion/personal")
      revalidatePath("/gestion/estudiantes")
      return { success: "Estado actualizado", data: JSON.parse(JSON.stringify(state)) }
    } else {
      const state = await prisma.estadoUsuario.create({
        data: {
          ...values,
          activo: values.esActivo ?? true
        }
      })
      revalidatePath(REVALIDATE_PATH)
      revalidatePath("/gestion/personal")
      revalidatePath("/gestion/estudiantes")
      return { success: "Estado creado", data: JSON.parse(JSON.stringify(state)) }
    }
  } catch (error: any) {
    console.error("Error upserting user state:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un estado con ese código" }
    }
    return { error: "No se pudo procesar el estado de usuario" }
  }
}

/**
 * Elimina un estado de usuario
 */
export async function deleteUserStateAction(id: string) {
  try {
    // Verificar si es sistémico
    const state = await prisma.estadoUsuario.findUnique({
      where: { id },
      select: { sistemico: true, _count: { select: { usuarios: true } } }
    })

    if (state?.sistemico) {
      return { error: "No se puede eliminar un estado del sistema" }
    }

    if (state && state._count.usuarios > 0) {
      return { error: "No se puede eliminar un estado que está en uso por usuarios" }
    }

    await prisma.estadoUsuario.delete({ where: { id } })
    revalidatePath(REVALIDATE_PATH)
    revalidatePath("/gestion/personal")
    revalidatePath("/gestion/estudiantes")
    return { success: "Estado eliminado" }
  } catch (error: any) {
    console.error("Error deleting user state:", error)
    return { error: "No se pudo eliminar el estado" }
  }
}
