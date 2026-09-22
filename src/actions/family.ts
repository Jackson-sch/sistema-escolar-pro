"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth";
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto";

const REVALIDATE_PATH = "/gestion/estudiantes"

const sanitizeDataFamiliar = (data: any) => {
  const result = { ...data };
  const uniqueFields = ['email', 'dni'];

  uniqueFields.forEach(field => {
    if (result[field] === "") {
      result[field] = null;
    }
  });

  return result;
};

export async function upsertFamilyMemberAction(studentId: string, values: any, relationId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "administrativo"];
    if (!allowedRoles.includes(rawRole)) {
      return { error: "No tienes permiso para gestionar relaciones familiares." };
    }

    const institucionId = session.user.institucionId;

    const sanitizedValues = sanitizeDataFamiliar(values);
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
    } = sanitizedValues

    const cleanEmail = email ? email.trim().toLowerCase() : "";
    if (!cleanEmail) {
      return { error: "El correo electrónico es obligatorio para el acceso a la plataforma." };
    }

    const cleanDni = (dni || "").trim();
    if (!cleanDni || cleanDni.length < 8) {
      return { error: "El número de documento debe tener al menos 8 caracteres." };
    }

    // 1. Obtener la relación existente si se está editando
    let existingRelation = null;
    if (relationId) {
      existingRelation = await prisma.relacionFamiliar.findUnique({
        where: { id: relationId },
        include: { padreTutor: true },
      });
      if (!existingRelation) {
        return { error: "La relación familiar no fue encontrada." };
      }
    }

    // 2. Buscar si ya existe un usuario con este DNI
    const userWithDni = await prisma.user.findUnique({
      where: { dni: cleanDni },
    });

    // VALIDACIÓN DE SEGURIDAD: Si existe pero no es padre, bloquear.
    if (userWithDni && userWithDni.role !== "padre") {
      const roleText = userWithDni.role === "estudiante" ? "Estudiante" : "Personal";
      return { 
        error: `El documento ${cleanDni} ya está registrado como ${roleText} y no puede ser usado como familiar.` 
      };
    }

    // Verificar unicidad de correo
    const targetUserId = userWithDni?.id || existingRelation?.padreTutorId;
    const userWithEmail = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        ...(targetUserId ? { id: { not: targetUserId } } : {}),
      },
      select: { id: true },
    });

    if (userWithEmail) {
      return { error: `El correo "${cleanEmail}" ya está registrado por otro usuario.` };
    }

    let parent;

    if (existingRelation) {
      // MODO EDICIÓN:
      if (userWithDni && userWithDni.id !== existingRelation.padreTutorId) {
        // Se cambió el DNI a uno de otro padre ya existente en el sistema
        parent = await prisma.user.update({
          where: { id: userWithDni.id },
          data: {
            name,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            email: cleanEmail,
            ...userData,
          },
        });
      } else {
        // Mismo padre o corrección de DNI mal digitado
        parent = await prisma.user.update({
          where: { id: existingRelation.padreTutorId },
          data: {
            dni: cleanDni,
            name,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            email: cleanEmail,
            ...userData,
          },
        });
      }
    } else {
      // MODO CREACIÓN:
      if (userWithDni) {
        parent = await prisma.user.update({
          where: { id: userWithDni.id },
          data: {
            name,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            email: cleanEmail,
            ...userData,
          },
        });
      } else {
        const estadoActivo = await prisma.estadoUsuario.findFirst({
          where: { 
            OR: [
              { codigo: "activo" },
              { codigo: "ACTIVO" },
              { esActivo: true },
            ],
          },
        });
        
        if (!estadoActivo) {
          return { error: "No se encontró un estado activo en el sistema" };
        }

        const passwordToHash = cleanDni || randomBytes(6).toString("base64url");
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        
        parent = await prisma.user.create({
          data: {
            dni: cleanDni,
            name,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            email: cleanEmail,
            role: "padre" as Role,
            password: hashedPassword,
            estadoId: estadoActivo.id,
            mustChangePassword: true,
            institucionId: institucionId || undefined,
            ...userData,
          },
        });
      }
    }

    // 3. Gestionar la Relación Familiar
    if (contactoPrimario) {
      await prisma.relacionFamiliar.updateMany({
        where: { hijoId: studentId },
        data: { contactoPrimario: false },
      });
    }

    if (relationId) {
      await prisma.relacionFamiliar.update({
        where: { id: relationId },
        data: {
          padreTutorId: parent.id,
          parentesco,
          contactoPrimario,
          autorizadoRecoger,
          viveCon,
        },
      });
    } else {
      await prisma.relacionFamiliar.upsert({
        where: {
          padreTutorId_hijoId: {
            padreTutorId: parent.id,
            hijoId: studentId,
          },
        },
        update: {
          parentesco,
          contactoPrimario,
          autorizadoRecoger,
          viveCon,
        },
        create: {
          padreTutorId: parent.id,
          hijoId: studentId,
          parentesco,
          contactoPrimario,
          autorizadoRecoger,
          viveCon,
        },
      });
    }

    revalidatePath(REVALIDATE_PATH)
    return { success: "Familiar guardado correctamente" }
  } catch (error: any) {
    console.error("Error upserting family member:", error)
    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.join(',').includes("dni")) return { error: "El DNI ya está registrado por otro usuario" };
      if (target.join(',').includes("email")) return { error: "El correo electrónico ya está en uso" };
      return { error: "Ya existe un registro con estos datos únicos" };
    }
    return { error: "No se pudo procesar la información familiar" }
  }
}

export async function removeFamilyRelationAction(relationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "administrativo"];
    if (!allowedRoles.includes(rawRole)) {
      return { error: "No tienes permiso para eliminar relaciones familiares." };
    }

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
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "administrativo"];
    if (!allowedRoles.includes(rawRole)) {
      return { error: "No tienes permiso para actualizar el contacto primario." };
    }

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
