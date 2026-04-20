"use server";

import { getResendClient } from "@/lib/resend";
import { NotificationEmail } from "@/components/emails/notification-email";
import { getInstitucionAction } from "@/actions/institucion";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  nombre: string;
  mensaje: string;
  accionLabel?: string;
  accionUrl?: string;
}

/**
 * Server Action para enviar correos electrónicos usando Resend y React Email.
 */
export async function sendEmailAction({
  to,
  subject,
  nombre,
  mensaje,
  accionLabel,
  accionUrl,
}: SendEmailParams) {
  const session = await auth();
  const institucionId = session?.user?.institucionId;
  const userId = session?.user?.id;
  const recipientStr = Array.isArray(to) ? to.join(", ") : to;

  try {
    const resend = await getResendClient();
    
    if (!resend) {
      return { error: "No se pudo inicializar el servicio de correos. Verifique la API Key." };
    }

    // Obtener datos de la institución para el branding
    const { data: institucion } = await getInstitucionAction();
    const institucionNombre = institucion?.nombreInstitucion || "Sistema Escolar Pro";

    const { data, error } = await resend.emails.send({
      from: `${institucionNombre} <onboarding@resend.dev>`, // Shift to verified domain in production
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      react: NotificationEmail({
        nombre,
        mensaje,
        accionLabel,
        accionUrl,
        institucionNombre,
      }),
    });

    if (error) {
      console.error("Resend Error:", error);
      // Log failure
      await prisma.notificationLog.create({
        data: {
          tipo: "EMAIL",
          destinatario: recipientStr,
          asunto: subject,
          mensaje: mensaje,
          estado: "FAILED",
          error: error.message,
          institucionId,
          userId,
        }
      });
      return { error: error.message };
    }

    // Log success
    await prisma.notificationLog.create({
      data: {
        tipo: "EMAIL",
        destinatario: recipientStr,
        asunto: subject,
        mensaje: mensaje,
        estado: "SENT",
        institucionId,
        userId,
        metadata: data as any,
      }
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Internal Email Action Error:", error);
    // Log exception
    await prisma.notificationLog.create({
      data: {
        tipo: "EMAIL",
        destinatario: recipientStr,
        asunto: subject,
        mensaje: mensaje,
        estado: "FAILED",
        error: error.message || "Unknown error",
        institucionId,
        userId,
      }
    });
    return { error: "Ocurrió un error inesperado al enviar el correo." };
  }
}
