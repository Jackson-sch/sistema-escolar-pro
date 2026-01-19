"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/configuracion"

/**
 * Obtiene todas las variables del sistema
 */
export async function getVariablesAction() {
  try {
    const variables = await prisma.variableSistema.findMany({
      orderBy: [
        { seccion: "asc" },
        { clave: "asc" }
      ]
    })
    return { data: JSON.parse(JSON.stringify(variables)) }
  } catch (error) {
    console.error("Error al obtener variables:", error)
    return { error: "No se pudieron cargar las variables" }
  }
}

/**
 * Crea o actualiza una variable del sistema
 */
export async function upsertVariableAction(data: {
  clave: string;
  valor: string;
  tipo?: string;
  descripcion?: string;
  seccion?: string;
  activo?: boolean;
}) {
  try {
    const variable = await prisma.variableSistema.upsert({
      where: { clave: data.clave },
      update: {
        valor: data.valor,
        tipo: data.tipo ?? "string",
        descripcion: data.descripcion,
        seccion: data.seccion ?? "general",
        activo: data.activo ?? true,
      },
      create: {
        clave: data.clave,
        valor: data.valor,
        tipo: data.tipo ?? "string",
        descripcion: data.descripcion,
        seccion: data.seccion ?? "general",
        activo: data.activo ?? true,
      }
    })

    revalidatePath(REVALIDATE_PATH)
    return { data: JSON.parse(JSON.stringify(variable)) }
  } catch (error) {
    console.error("Error al guardar variable:", error)
    return { error: "No se pudo guardar la variable" }
  }
}

/**
 * Elimina una variable del sistema
 */
export async function deleteVariableAction(id: string) {
  try {
    await prisma.variableSistema.delete({
      where: { id }
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar variable:", error)
    return { error: "No se pudo eliminar la variable" }
  }
}

/**
 * Obtiene una variable específica por su clave
 */
export async function getVariableByKeyAction(clave: string) {
  try {
    const variable = await prisma.variableSistema.findUnique({
      where: { clave }
    })
    return { data: variable ? JSON.parse(JSON.stringify(variable)) : null }
  } catch (error) {
    console.error("Error al obtener variable por clave:", error)
    return { error: "Error al buscar la variable" }
  }
}
