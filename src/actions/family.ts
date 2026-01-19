"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "../../prisma/client"
import bcrypt from "bcryptjs"

const REVALIDATE_PATH = "/gestion/estudiantes"

export async function upsertFamilyMemberAction(studentId: string, values: any, relationId?: string) {
  try {
    const {
      dni,
      name,
      apellidoPaterno,
      apellidoMaterno,
      telefono,
      email,
      parentesco,
      contactoPrimario,
      autorizadoRecoger,
      viveCon,
      ...userData
    } = values

    // 1. Buscar o Crear/Actualizar el Usuario del Familiar
    let parent = await prisma.user.findUnique({
      where: { dni }
    })

    if (!parent) {
      // Buscar el estado "activo" por su código
      const estadoActivo = await prisma.estadoUsuario.findFirst({
        where: { 
          OR: [
            { codigo: "activo" },
            { codigo: "ACTIVO" },
            { esActivo: true }
          ]
        }
      })
      
      if (!estadoActivo) {
        return { error: "No se encontró un estado activo en el sistema" }
      }

      // Si no existe, lo creamos con una contraseña por defecto (su DNI)
      const hashedPassword = await bcrypt.hash(dni, 10)
      parent = await prisma.user.create({
        data: {
          dni,
          name,
          apellidoPaterno,
          apellidoMaterno,
          telefono,
          email,
          role: "padre" as Role,
          password: hashedPassword,
          estadoId: estadoActivo.id,
          mustChangePassword: true, // Forzar cambio en primer login
          ...userData
        }
      })
    } else {
      // Si existe, actualizamos sus datos básicos
      parent = await prisma.user.update({
        where: { id: parent.id },
        data: {
          name,
          apellidoPaterno,
          apellidoMaterno,
          telefono,
          email,
          ...userData
        }
      })
    }

    // 2. Gestionar la Relación Familiar
    if (contactoPrimario) {
      // Si este será el contacto primario, quitamos la marca a los demás
      await prisma.relacionFamiliar.updateMany({
        where: { hijoId: studentId },
        data: { contactoPrimario: false }
      })
    }

    if (relationId) {
      // Actualizar relación existente
      await prisma.relacionFamiliar.update({
        where: { id: relationId },
        data: {
          parentesco,
          contactoPrimario,
          autorizadoRecoger,
          viveCon
        }
      })
    } else {
      // Crear nueva relación
      await prisma.relacionFamiliar.upsert({
        where: {
          padreTutorId_hijoId: {
            padreTutorId: parent.id,
            hijoId: studentId
          }
        },
        update: {
          parentesco,
          contactoPrimario,
          autorizadoRecoger,
          viveCon
        },
        create: {
          padreTutorId: parent.id,
          hijoId: studentId,
          parentesco,
          contactoPrimario,
          autorizadoRecoger,
          viveCon
        }
      })
    }

    revalidatePath(REVALIDATE_PATH)
    return { success: "Familiar guardado correctamente" }
  } catch (error: any) {
    console.error("Error upserting family member:", error)
    return { error: "No se pudo procesar la información familiar" }
  }
}

export async function removeFamilyRelationAction(relationId: string) {
  try {
    await prisma.relacionFamiliar.delete({
      where: { id: relationId }
    })
    revalidatePath(REVALIDATE_PATH)
    return { success: "Relación familiar eliminada" }
  } catch (error) {
    console.error("Error removing family relation:", error)
    return { error: "No se pudo eliminar el registro" }
  }
}

export async function togglePrimaryContactAction(studentId: string, relationId: string) {
  try {
    // Quitar todos los demás
    await prisma.relacionFamiliar.updateMany({
      where: { hijoId: studentId },
      data: { contactoPrimario: false }
    })

    // Marcar este como único
    await prisma.relacionFamiliar.update({
      where: { id: relationId },
      data: { contactoPrimario: true }
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: "Contacto primario actualizado" }
  } catch (error) {
    console.error("Error toggling primary contact:", error)
    return { error: "No se pudo actualizar el contacto" }
  }
}
