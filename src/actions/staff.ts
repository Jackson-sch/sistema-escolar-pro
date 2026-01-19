"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "../../prisma/client"
import bcrypt from "bcryptjs"

/**
 * Obtiene la lista de personal (Docentes y Administrativos)
 */
export async function getStaffAction() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ["profesor", "administrativo"] as Role[]
        }
      },
      include: {
        estado: true,
        cargo: true,
        institucion: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return { data: JSON.parse(JSON.stringify(staff)) }
  } catch (error) {
    console.error("Error fetching staff:", error)
    return { error: "No se pudo obtener la lista de personal" }
  }
}


/**
 * Obtiene los estados disponibles para usuarios
 */
export async function getUserStatusessAction() {
  try {
    const statuses = await prisma.estadoUsuario.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(statuses)) }
  } catch (error) {
    return { error: "Error al cargar estados" }
  }
}

/**
 * Obtiene las instituciones disponibles
 */
export async function getInstitucionesAction() {
  try {
    const instituciones = await prisma.institucionEducativa.findMany({
      select: { id: true, nombreInstitucion: true }
    })
    return { data: JSON.parse(JSON.stringify(instituciones)) }
  } catch (error) {
    return { error: "Error al cargar instituciones" }
  }
}

/**
 * Obtiene los cargos disponibles
 */
export async function getCargosAction() {
  try {
    const cargos = await prisma.cargo.findMany({
      where: { activo: true },
      orderBy: { jerarquia: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(cargos)) }
  } catch (error) {
    return { error: "Error al cargar cargos" }
  }
}

/**
 * Crea un nuevo miembro del personal
 */
export async function createStaffAction(values: any) {
  try {
    const hashedPassword = await bcrypt.hash(values.dni, 10)

    const staff = await prisma.user.create({
      data: {
        ...values,
        password: hashedPassword, // Por defecto su DNI
      }
    })

    revalidatePath("/gestion/personal")
    return { success: "Personal registrado con éxito", data: JSON.parse(JSON.stringify(staff)) }
  } catch (error: any) {
    console.error("Error creating staff:", error)
    if (error.code === 'P2002') {
      return { error: "El DNI o correo ya se encuentra registrado" }
    }
    return { error: "Error al registrar el personal" }
  }
}

/**
 * Actualiza un miembro del personal
 */
export async function updateStaffAction(id: string, values: any) {
  try {
    const staff = await prisma.user.update({
      where: { id },
      data: values
    })

    revalidatePath("/gestion/personal")
    return { success: "Personal actualizado correctamente", data: JSON.parse(JSON.stringify(staff)) }
  } catch (error) {
    console.error("Error updating staff:", error)
    return { error: "No se pudo actualizar el personal" }
  }
}

/**
 * Elimina un miembro del personal
 */
export async function deleteStaffAction(id: string) {
  try {
    // Proteger al usuario admin global
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, cargo: { select: { codigo: true } } }
    })

    if (user?.email === "admin@colegio.edu.pe" || user?.cargo?.codigo === "ADMIN_GLOBAL") {
      return { error: "No se puede eliminar al Administrador del Sistema" }
    }

    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/gestion/personal")
    return { success: "Personal eliminado correctamente" }
  } catch (error) {
    console.error("Error deleting staff:", error)
    return { error: "No se pudo eliminar el personal" }
  }
}

