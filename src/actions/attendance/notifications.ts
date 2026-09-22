"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { serialize } from "@/lib/dto";
import { sendEmailAction } from "@/actions/email";
import { sendSmsAction } from "@/actions/sms";
import { sendWhatsappAction } from "@/actions/whatsapp";
import {
  type AttendanceNotificationConfig,
  DEFAULT_ATTENDANCE_NOTIF_CONFIG,
} from "@/components/asistencia/scanner-qr/scanner-types";

function getConfigKey(institucionId?: string | null): string {


  return institucionId ? `ASISTENCIA_NOTIF_CONFIG_${institucionId}` : "ASISTENCIA_NOTIF_CONFIG";
}

/**
 * Obtiene la configuración de notificaciones de asistencia para la institución.
 */
export async function getAttendanceNotificationConfigAction() {
  try {
    const session = await auth();
    const institucionId = session?.user?.institucionId;
    const key = getConfigKey(institucionId);

    const record = await prisma.variableSistema.findUnique({
      where: { clave: key },
    });

    if (!record?.valor) {
      return { success: true, data: DEFAULT_ATTENDANCE_NOTIF_CONFIG };
    }

    const parsed = JSON.parse(record.valor) as AttendanceNotificationConfig;
    return {
      success: true,
      data: {
        enabled: parsed.enabled ?? true,
        notifyOnPuntual: parsed.notifyOnPuntual ?? true,
        notifyOnTardanza: parsed.notifyOnTardanza ?? true,
        channels: parsed.channels || ["WHATSAPP", "EMAIL"],
      },
    };
  } catch (error) {
    console.error("Error reading attendance notification config:", error);
    return { success: true, data: DEFAULT_ATTENDANCE_NOTIF_CONFIG };
  }
}

/**
 * Actualiza la configuración de notificaciones de asistencia.
 */
export async function saveAttendanceNotificationConfigAction(
  config: AttendanceNotificationConfig
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;
    const key = getConfigKey(institucionId);

    await prisma.variableSistema.upsert({
      where: { clave: key },
      create: {
        clave: key,
        valor: JSON.stringify(config),
        tipo: "json",
        descripcion: "Configuración de notificaciones automáticas de asistencia a padres",
        seccion: "asistencia",
        activo: true,
      },
      update: {
        valor: JSON.stringify(config),
        activo: true,
      },
    });

    return { success: true, data: config };
  } catch (error) {
    console.error("Error saving attendance notification config:", error);
    return { error: "No se pudo guardar la configuración de notificaciones" };
  }
}

interface DispatchAttendanceParams {
  studentId: string;
  studentName: string;
  dni?: string | null;
  aula?: string;
  horaLlegada?: string;
  horaSalida?: string;
  isTardanza?: boolean;
  tipo?: "ingreso" | "salida";
  institucionId?: string | null;
  userId?: string;
}

/**
 * Despachador principal de notificaciones a los padres del estudiante.
 */
export async function dispatchAttendanceNotification({
  studentId,
  studentName,
  dni,
  aula,
  horaLlegada = "",
  horaSalida = "",
  isTardanza = false,
  tipo = "ingreso",
  institucionId,
  userId,
}: DispatchAttendanceParams) {
  try {
    // 1. Obtener la configuración actual
    const configRes = await getAttendanceNotificationConfigAction();
    const config = configRes.data || DEFAULT_ATTENDANCE_NOTIF_CONFIG;

    if (!config.enabled) {
      return { notified: false, reason: "Desactivado por configuración" };
    }
    if (tipo === "ingreso" && isTardanza && !config.notifyOnTardanza) {
      return { notified: false, reason: "Notificaciones de tardanza desactivadas" };
    }
    if (tipo === "ingreso" && !isTardanza && !config.notifyOnPuntual) {
      return { notified: false, reason: "Notificaciones de puntualidad desactivadas" };
    }
    if (!config.channels || config.channels.length === 0) {
      return { notified: false, reason: "No hay canales seleccionados" };
    }

    // 2. Obtener padres/tutores del estudiante
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
      return { notified: false, reason: "Sin apoderados vinculados", parentsCount: 0 };
    }

    // 3. Obtener nombre de la institución para el branding
    const institucion = institucionId
      ? await prisma.institucionEducativa.findUnique({ where: { id: institucionId } })
      : await prisma.institucionEducativa.findFirst();
    const colegio = institucion?.nombreInstitucion || "Sistema Escolar Pro";

    // 4. Preparar mensajes formateados según tipo (Ingreso vs Salida)
    let subject = "";
    let textMessage = "";

    if (tipo === "salida") {
      const horaEfectiva = horaSalida || horaLlegada || new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
      subject = `🚪 Salida Registrada: ${studentName} (${horaEfectiva})`;
      textMessage = `🚪 *AVISO DE SALIDA - ${colegio}*\n\nEstimado(a) apoderado(a), le informamos que su menor hijo(a) *${studentName}* registró su salida de la institución hoy a las *${horaEfectiva}*.\nAula: ${aula || "Asignada"}.\n\n¡Gracias por su atención!`;
    } else {
      subject = isTardanza
        ? `⚠️ Aviso de Tardanza: ${studentName} (${horaLlegada})`
        : `✅ Ingreso Registrado: ${studentName} (${horaLlegada})`;

      textMessage = isTardanza
        ? `⚠️ *AVISO DE TARDANZA - ${colegio}*\n\nEstimado(a) apoderado(a), le informamos que su menor hijo(a) *${studentName}* registró su ingreso hoy a las *${horaLlegada}* con *TARDANZA*.\nAula: ${aula || "Asignada"}.\n\nPor favor tome las precauciones necesarias.`
        : `✅ *INGRESO PUNTUAL - ${colegio}*\n\nEstimado(a) apoderado(a), le informamos que su menor hijo(a) *${studentName}* ingresó al colegio a las *${horaLlegada}* de manera *PUNTUAL*.\nAula: ${aula || "Asignada"}.\n\n¡Que tenga un excelente día!`;
    }

    const channelSet = new Set(config.channels);
    const tasks: Promise<any>[] = [];
    let dispatchedCount = 0;

    for (const { padreTutor } of relaciones) {
      const parentFullName = `${padreTutor.name || ""} ${padreTutor.apellidoPaterno || ""}`.trim() || "Apoderado";


      if (channelSet.has("EMAIL") && padreTutor.email) {
        tasks.push(
          sendEmailAction({
            to: padreTutor.email,
            subject,
            nombre: parentFullName,
            mensaje: textMessage.replace(/\*/g, ""),
            accionLabel: "Ver Portal de Padres",
            accionUrl: process.env.NEXTAUTH_URL || "https://colegio.edu.pe",
          }).catch((err) => ({ error: String(err) }))
        );
        dispatchedCount++;
      }

      if (channelSet.has("WHATSAPP") && padreTutor.telefono) {
        tasks.push(
          sendWhatsappAction({
            to: padreTutor.telefono,
            mensaje: textMessage,
          }).catch((err) => ({ error: String(err) }))
        );
        dispatchedCount++;
      }

      if (channelSet.has("SMS") && padreTutor.telefono) {
        tasks.push(
          sendSmsAction({
            to: padreTutor.telefono,
            mensaje: textMessage.replace(/\*/g, ""),
          }).catch((err) => ({ error: String(err) }))
        );
        dispatchedCount++;
      }
    }

    if (tasks.length === 0) {
      return {
        notified: false,
        reason: "Los apoderados no cuentan con teléfono o correo registrados",
        parentsCount: relaciones.length,
      };
    }

    // Ejecutar en paralelo
    await Promise.allSettled(tasks);

    return {
      notified: true,
      parentsCount: relaciones.length,
      channels: config.channels,
      dispatchedCount,
    };
  } catch (error) {
    console.error("Error in dispatchAttendanceNotification:", error);
    return { notified: false, error: "Error al despachar notificación" };
  }
}

/**
 * Obtiene los últimos logs de notificaciones de asistencia para auditoría
 */
export async function getRecentAttendanceNotificationsAction() {
  try {
    const session = await auth();
    const institucionId = session?.user?.institucionId;

    const logs = await prisma.notificationLog.findMany({
      where: {
        ...(institucionId ? { institucionId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return { success: true, data: serialize(logs) };
  } catch (error) {
    console.error("Error fetching notification logs:", error);
    return { error: "No se pudieron obtener los logs de notificaciones" };
  }
}
