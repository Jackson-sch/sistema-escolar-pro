"use server"
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma"
import { auth } from "@/auth";
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/configuracion"

/**
 * Obtiene todas las variables del sistema
 */
export async function getVariablesAction() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const isAdmin = ["super_admin", "admin", "administrador", "director"].includes(rawRole);
    if (!isAdmin) {
      return { error: "Acceso denegado" };
    }

    const variables = await prisma.variableSistema.findMany({
      orderBy: [
        { seccion: "asc" },
        { clave: "asc" }
      ]
    })
    return { data: serialize(variables) }
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
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

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
    return { data: serialize(variable) }
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
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

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
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    // Lista de claves públicas que el cliente puede requerir (ej. formato comprobante)
    const PUBLIC_KEYS = ["FORMATO_COMPROBANTE", "FORMATO_COMPROBANTE_DEFAULT"];
    const rawRole = (session.user.role || "").toString().toLowerCase();
    const isAdmin = ["super_admin", "admin", "administrador", "director"].includes(rawRole);

    if (!isAdmin && !PUBLIC_KEYS.includes(clave.toUpperCase())) {
      return { error: "Acceso denegado a variable restringida" };
    }

    const variable = await prisma.variableSistema.findUnique({
      where: { clave }
    })
    return { data: variable ? serialize(variable) : null }
  } catch (error) {
    console.error("Error al obtener variable por clave:", error)
    return { error: "Error al buscar la variable" }
  }
}
