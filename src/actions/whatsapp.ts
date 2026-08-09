"use server";

import { getTwilioClient } from "@/lib/twilio";
import { getInstitucionAction } from "@/actions/institucion";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

interface SendWhatsappParams {
  to: string | string[];
  mensaje: string;
}

/**
 * Server Action para enviar mensajes de WhatsApp usando la API de Twilio.
 */
export async function sendWhatsappAction({ to, mensaje }: SendWhatsappParams) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado. Inicie sesión." };
  }

  const rawRole = (session.user.role || "").toString().toLowerCase();
  const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "profesor", "docente", "administrativo"];
  if (!allowedRoles.includes(rawRole)) {
    return { error: "No tienes permisos para enviar WhatsApp." };
  }

  const institucionId = session.user.institucionId;
  const userId = session.user.id;
  const recipientStr = Array.isArray(to) ? to.join(", ") : to;

  try {
    const twilioData = await getTwilioClient();

    if (!twilioData) {
      const errorMsg = "No se pudo inicializar Twilio para WhatsApp. Verifique las credenciales.";
      await prisma.notificationLog.create({
        data: {
          tipo: "WHATSAPP",
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

    const formattedMessage = `*[${institucionNombre}]* \n\n${mensaje}`;
    const recipients = Array.isArray(to) ? to : [to];

    const results = await Promise.allSettled(
      recipients.map((recipient) => {
        // Asegurar formato correcto para número de teléfono (debe iniciar con +)
        const rawPhone = recipient.trim();
        const formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+51${rawPhone}`;
        
        // Twilio requiere el prefijo 'whatsapp:' tanto para from como para to
        return client.messages.create({
          body: formattedMessage,
          from: `whatsapp:${twilioPhoneNumber}`,
          to: `whatsapp:${formattedPhone}`,
        });
      }),
    );

    const errores = results.filter((r) => r.status === "rejected");

    // Persistir Log en base de datos
    await prisma.notificationLog.create({
      data: {
        tipo: "WHATSAPP",
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
      console.error("❌ Errores al enviar WhatsApp:", errores);
    }

    return {
      success: true,
      data: results.flatMap((r: any) =>
        r.status === "fulfilled" ? [r.value.sid] : [],
      ),
      errorsCount: errores.length,
    };
  } catch (error: any) {
    console.error("❌ Internal WhatsApp Action Error:", error);
    await prisma.notificationLog.create({
      data: {
        tipo: "WHATSAPP",
        destinatario: recipientStr,
        mensaje: mensaje,
        estado: "FAILED",
        error: error.message || "Unknown error",
        institucionId,
        userId,
      }
    });
    return { error: "Ocurrió un error inesperado al enviar el WhatsApp." };
  }
}
