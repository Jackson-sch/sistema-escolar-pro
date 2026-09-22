"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendWhatsappAction } from "@/actions/whatsapp";
import { sendSmsAction } from "@/actions/sms";
import { sendEmailAction } from "@/actions/email";

/**
 * Envía comunicados masivos a nivel global o filtrado por aula/nivel
 */
export async function sendBroadcastMessageAction({
  subject,
  message,
  scope = "ALL",
  targetId,
  channels = ["WHATSAPP"],
}: {
  subject: string;
  message: string;
  scope?: "ALL" | "NIVEL" | "GRADO" | "SECCION";
  targetId?: string;
  channels?: ("WHATSAPP" | "SMS" | "EMAIL")[];
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;

    // Buscar apoderados según el alcance
    const relations = await prisma.relacionFamiliar.findMany({
      where: {
        hijo: {
          institucionId: institucionId || undefined,
          ...(scope === "SECCION" && targetId
            ? { nivelAcademicoId: targetId }
            : {}),
          ...(scope === "GRADO" && targetId
            ? { nivelAcademico: { gradoId: targetId } }
            : {}),
          ...(scope === "NIVEL" && targetId
            ? { nivelAcademico: { nivelId: targetId } }
            : {}),
        },
      },
      include: {
        padreTutor: true,
        hijo: true,
      },
    });

    // Desduplicar apoderados por ID
    const uniqueParentsMap = new Map<string, any>();
    relations.forEach((rel) => {
      if (rel.padreTutor && !uniqueParentsMap.has(rel.padreTutor.id)) {
        uniqueParentsMap.set(rel.padreTutor.id, rel.padreTutor);
      }
    });

    const parents = Array.from(uniqueParentsMap.values());
    if (parents.length === 0) {
      return {
        error:
          "No se encontraron apoderados destinatarios para el grupo seleccionado.",
      };
    }

    let enviados = 0;
    let fallidos = 0;
    const hasWhatsapp = channels.includes("WHATSAPP");
    const hasSms = channels.includes("SMS");
    const hasEmail = channels.includes("EMAIL");

    const results = await Promise.all(
      parents.map(async (parent) => {
        const parentName =
          `${parent.name} ${parent.apellidoPaterno || ""}`.trim();
        let sentAny = false;
        const promises: Promise<void>[] = [];

        if (hasWhatsapp && parent.telefono) {
          promises.push(
            sendWhatsappAction({
              to: parent.telefono,
              mensaje: message,
            }).then((res) => {
              if (!res?.error) sentAny = true;
            })
          );
        }

        if (hasSms && parent.telefono) {
          promises.push(
            sendSmsAction({
              to: parent.telefono,
              mensaje: message,
            }).then((res) => {
              if (!res?.error) sentAny = true;
            })
          );
        }

        if (hasEmail && parent.email) {
          promises.push(
            sendEmailAction({
              to: parent.email,
              subject,
              nombre: parentName,
              mensaje: message,
            }).then((res) => {
              if (!res?.error) sentAny = true;
            })
          );
        }

        await Promise.all(promises);
        return sentAny;
      })
    );

    for (const sentAny of results) {
      if (sentAny) enviados++;
      else fallidos++;
    }

    return {
      success: true,
      mensaje: `Comunicado enviado a ${enviados} familias (${fallidos} fallidos).`,
      enviados,
      fallidos,
    };
  } catch (error: any) {
    console.error("Error sending broadcast message:", error);
    return { error: `Error al enviar comunicado masivo: ${error.message}` };
  }
}
