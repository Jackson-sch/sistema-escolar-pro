"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";


/**
 * Obtiene datos básicos del usuario para el layout protegido.
 */
export async function getLayoutUserAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        mustChangePassword: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        email: true,
        institucionId: true,
      },
    });
    return { success: user ? serialize(user) : null };
  } catch (error) {
    console.error("Error fetching layout user:", error);
    return { error: "No se pudo obtener el usuario" };
  }
}

/**
 * Obtiene el conteo de comprobantes pendientes filtrado por institución.
 */
export async function getPendingComprobantesCountAction(institucionId?: string) {
  try {
    const count = await prisma.comprobantePago.count({
      where: {
        estado: "PENDIENTE",
        cronograma: {
          estudiante: {
            institucionId: institucionId || undefined,
          },
        },
      },
    });
    return { success: count };
  } catch (error) {
    console.error("Error counting pending comprobantes:", error);
    return { error: "No se pudo obtener el conteo de comprobantes" };
  }
}

/**
 * Cambia la contraseña del usuario actual y quita el flag mustChangePassword
 */
export async function changePasswordAction(newPassword: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "No autenticado" };
    }

    if (newPassword.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: "Error al cambiar la contraseña" };
  }
}
