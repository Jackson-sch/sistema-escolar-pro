"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

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
