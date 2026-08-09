"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { serialize } from "@/lib/dto";
import { sendEmailAction } from "@/actions/email";
import { sendSmsAction } from "@/actions/sms";
import { sendWhatsappAction } from "@/actions/whatsapp";
import { getSystemVariable } from "@/lib/settings";

/**
 * Motor Principal: Envía notificaciones multicanal a todos los padres de un alumno en paralelo.
 */
export async function sendMultichannelNotificationAction({
  studentId,
  subject,
  message,
  channels,
}: {
  studentId: string;
  subject: string;
  message: string;
  channels: ("EMAIL" | "SMS" | "WHATSAPP")[];
}) {
  const session = await auth();
  const institucionId = session?.user?.institucionId;
  const userId = session?.user?.id;

  try {
    // 1. Obtener los padres vinculados al alumno
    const relaciones = await prisma.relacionFamiliar.findMany({
      where: { hijoId: studentId },
      include: {
        padreTutor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true,
            telefono: true,
          },
        },
      },
    });

    if (relaciones.length === 0) {
      return { error: "No se encontraron padres o tutores registrados para este estudiante." };
    }

    const promises: Promise<any>[] = [];

    const channelSet = new Set(channels);

    // 2. Despachar para cada padre/tutor en paralelo según canales activos
    relaciones.forEach(({ padreTutor }) => {
      const parentName = `${padreTutor.name} ${padreTutor.apellidoPaterno || ""}`.trim();

      if (channelSet.has("EMAIL") && padreTutor.email) {
        promises.push(
          sendEmailAction({
            to: padreTutor.email,
            subject,
            nombre: parentName,
            mensaje: message,
          })
        );
      }

      if (channelSet.has("SMS") && padreTutor.telefono) {
        promises.push(
          sendSmsAction({
            to: padreTutor.telefono,
            mensaje: message,
          })
        );
      }

      if (channelSet.has("WHATSAPP") && padreTutor.telefono) {
        promises.push(
          sendWhatsappAction({
            to: padreTutor.telefono,
            mensaje: message,
          })
        );
      }
    });

    if (promises.length === 0) {
      return { error: "No hay destinatarios con correo o teléfono válidos para los canales elegidos." };
    }

    const results = await Promise.allSettled(promises);
    const succeeded = results.filter((r) => r.status === "fulfilled" && !(r.value as any)?.error).length;
    const failed = results.length - succeeded;

    return {
      success: true,
      totalDispatched: results.length,
      succeeded,
      failed,
    };
  } catch (error: any) {
    console.error("❌ Error in multichannel dispatcher:", error);
    return { error: "Ocurrió un error al procesar el despacho multicanal." };
  }
}

/**
 * Server Action Segura para enviar notificaciones personalizadas desde el Dashboard.
 */
export const sendManualStudentNotificationAction = createSafeAction(
  z.object({
    studentId: z.string().min(1, "El estudiante es requerido"),
    subject: z.string().min(3, "El asunto debe tener al menos 3 caracteres"),
    message: z.string().min(5, "El mensaje debe tener al menos 5 caracteres"),
    channels: z.array(z.enum(["EMAIL", "SMS", "WHATSAPP"])).min(1, "Seleccione al menos un canal"),
  }),
  async ({ studentId, subject, message, channels }) => {
    const res = await sendMultichannelNotificationAction({
      studentId,
      subject,
      message,
      channels,
    });

    if (res.error) {
      return { error: res.error };
    }

    return {
      success: {
        totalDispatched: res.totalDispatched ?? 0,
        succeeded: res.succeeded ?? 0,
        failed: res.failed ?? 0,
      },
    };
  },
  { roles: ["admin", "coordinador", "profesor", "administrativo", "director", "super_admin"] }
);

/**
 * Obtiene estadísticas generales de comunicaciones para renderizar el panel Bento.
 */
export const getCommunicationsStatsAction = createSafeAction(
  z.object({}),
  async (_, session) => {
    try {
      const institucionId = session.user.institucionId;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // 1. Obtener envíos del mes actual
      const logsEsteMes = await prisma.notificationLog.findMany({
        where: {
          institucionId,
          createdAt: { gte: firstDayOfMonth },
        },
        select: {
          tipo: true,
          estado: true,
        },
      });

      // 2. Obtener total del mes pasado (para calcular tendencia)
      const totalMesPasado = await prisma.notificationLog.count({
        where: {
          institucionId,
          createdAt: {
            gte: firstDayOfLastMonth,
            lt: firstDayOfMonth,
          },
        },
      });

      const totalEsteMes = logsEsteMes.length;

      // 3. Calcular tasa de éxito del mes actual
      const exitosos = logsEsteMes.filter((log) => log.estado === "SENT").length;
      const tasaExito = totalEsteMes > 0 ? Math.round((exitosos / totalEsteMes) * 100) : 100;

      // 4. Calcular distribución por canal
      const emailCount = logsEsteMes.filter((log) => log.tipo === "EMAIL").length;
      const smsCount = logsEsteMes.filter((log) => log.tipo === "SMS").length;
      const whatsappCount = logsEsteMes.filter((log) => log.tipo === "WHATSAPP").length;

      // 5. Verificar estado de API keys (Resend y Twilio)
      const [resendKey, twilioSid, twilioToken] = await Promise.all([
        getSystemVariable("RESEND_API_KEY"),
        getSystemVariable("TWILIO_ACCOUNT_SID"),
        getSystemVariable("TWILIO_AUTH_TOKEN"),
      ]);

      const integrations = {
        resend: !!resendKey,
        twilio: !!(twilioSid && twilioToken),
      };

      // Calcular tendencia porcentual
      let tendencia = 0;
      if (totalMesPasado > 0) {
        tendencia = Math.round(((totalEsteMes - totalMesPasado) / totalMesPasado) * 100);
      } else if (totalEsteMes > 0) {
        tendencia = 100;
      }

      return {
        success: {
          totalEsteMes,
          tendencia,
          tasaExito,
          canales: {
            EMAIL: emailCount,
            SMS: smsCount,
            WHATSAPP: whatsappCount,
          },
          integrations,
        },
      };
    } catch (error) {
      console.error("❌ Error calculating communications stats:", error);
      return { error: "No se pudieron calcular las estadísticas de comunicación." };
    }
  },
  { roles: ["admin", "coordinador", "profesor", "administrativo", "director", "super_admin"] }
);
