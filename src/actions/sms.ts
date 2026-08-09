"use server";

import { getTwilioClient } from "@/lib/twilio";
import { getInstitucionAction } from "@/actions/institucion";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";

interface SendSmsParams {
  to: string | string[];
  mensaje: string;
}

/**
 * Server Action para enviar SMS usando Twilio.
 */
export async function sendSmsAction({ to, mensaje }: SendSmsParams) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado. Inicie sesión." };
  }

  const rateLimit = checkRateLimit(`sms:${session.user.id}`, { maxRequests: 20, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    return { error: "Límite de envíos alcanzado. Por favor espere un momento." };
  }

  const rawRole = (session.user.role || "").toString().toLowerCase();
  const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "profesor", "docente", "administrativo"];
  if (!allowedRoles.includes(rawRole)) {
    return { error: "No tienes permisos para enviar mensajes SMS." };
  }

  const institucionId = session.user.institucionId;
  const userId = session.user.id;
  const recipientStr = Array.isArray(to) ? to.join(", ") : to;

  try {
    const twilioData = await getTwilioClient();

    if (!twilioData) {
      const errorMsg = "No se pudo inicializar Twilio. Verifique las credenciales.";
      await prisma.notificationLog.create({
        data: {
          tipo: "SMS",
          destinatario: recipientStr,
          mensaje: mensaje,
          estado: "FAILED",
          error: errorMsg,
          institucionId,
          userId,
        }
      });
      return { error: errorMsg };
    }

    const { client, twilioPhoneNumber } = twilioData;

    // Obtener datos de la institución para el branding
    const { data: institucion } = await getInstitucionAction();
    const institucionNombre = institucion?.nombreInstitucion || "Sistema Escolar Pro";

    const formattedMessage = `[${institucionNombre}] ${mensaje}`;
    const recipients = Array.isArray(to) ? to : [to];

    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        client.messages.create({
          body: formattedMessage,
          from: twilioPhoneNumber,
          to: recipient.startsWith("+") ? recipient : `+51${recipient}`,
        }),
      ),
    );

    const errores = results.filter((r) => r.status === "rejected");

    // Persistir Log
    await prisma.notificationLog.create({
      data: {
        tipo: "SMS",
        destinatario: recipientStr,
        mensaje: mensaje,
        estado: errores.length === recipients.length ? "FAILED" : (errores.length > 0 ? "PARTIAL" : "SENT"),
        error: errores.length > 0 ? JSON.stringify(errores) : null,
        institucionId,
        userId,
        metadata: results as any,
      }
    });

    if (errores.length > 0) {
      console.error("Errores al enviar SMS:", errores);
    }

    return {
      success: true,
      data: results.flatMap((r: any) =>
        r.status === "fulfilled" ? [r.value.sid] : [],
      ),
      errorsCount: errores.length,
    };
  } catch (error: any) {
    console.error("Internal SMS Action Error:", error);
    await prisma.notificationLog.create({
      data: {
        tipo: "SMS",
        destinatario: recipientStr,
        mensaje: mensaje,
        estado: "FAILED",
        error: error.message || "Unknown error",
        institucionId,
        userId,
      }
    });
    return { error: "Ocurrió un error inesperado al enviar el SMS." };
  }
}
