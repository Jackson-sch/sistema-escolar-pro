"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { getResendClient } from "@/lib/resend";
import { NotificationEmail } from "@/components/emails/notification-email";

const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;

function publicResetUrl(token: string, host: string, protocol: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
  const baseUrl = configuredUrl || `${protocol}://${host}`;
  return `${baseUrl.replace(/\/$/, "")}/resetear-password?token=${encodeURIComponent(token)}`;
}

/**
 * Starts a password reset without revealing whether the email belongs to an account.
 */
export async function forgotPasswordAction(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const genericSuccess = {
    success:
      "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña.",
  };

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, institucion: { select: { nombreInstitucion: true } } },
    });

    if (!user?.email) return genericSuccess;

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_TOKEN_DURATION_MS);
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      create: { userId: user.id, token, expires },
      update: { token, expires },
    });

    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
    const protocol = requestHeaders.get("x-forwarded-proto") || "http";
    const resetUrl = publicResetUrl(token, host, protocol);
    const resend = await getResendClient();

    if (!resend) {
      return { error: "No se pudo enviar el correo. Contacta a la institución para recuperar tu acceso." };
    }

    const institutionName = user.institucion?.nombreInstitucion || "Sistema Escolar Pro";
    const { error } = await resend.emails.send({
      from: `${institutionName} <onboarding@resend.dev>`,
      to: [user.email],
      subject: "Restablece tu contraseña",
      react: NotificationEmail({
        nombre: user.name || "usuario",
        mensaje: "Recibimos una solicitud para restablecer tu contraseña. El enlace es válido durante una hora.",
        accionLabel: "Restablecer contraseña",
        accionUrl: resetUrl,
        institucionNombre: institutionName,
      }),
    });

    if (error) {
      console.error("Password reset email error:", error);
      return { error: "No se pudo enviar el correo. Inténtalo nuevamente o contacta a la institución." };
    }

    return genericSuccess;
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "No se pudo procesar la solicitud. Inténtalo nuevamente." };
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  if (!token) return { error: "El enlace de restablecimiento no es válido." };
  if (newPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const resetToken = await prisma.passwordResetToken.findFirst({ where: { token } });
    if (!resetToken || resetToken.expires <= new Date()) {
      if (resetToken) await prisma.passwordResetToken.delete({ where: { userId: resetToken.userId } });
      return { error: "El enlace no es válido o ya venció. Solicita uno nuevo." };
    }

    const password = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password, mustChangePassword: false },
      }),
      prisma.passwordResetToken.delete({ where: { userId: resetToken.userId } }),
    ]);

    return { success: "Contraseña actualizada. Ya puedes iniciar sesión." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "No se pudo actualizar la contraseña. Solicita un enlace nuevo." };
  }
}
