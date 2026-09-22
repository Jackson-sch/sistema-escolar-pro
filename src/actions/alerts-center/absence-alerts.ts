"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { serialize } from "@/lib/dto";
import { sendWhatsappAction } from "@/actions/whatsapp";
import { sendSmsAction } from "@/actions/sms";
import { sendEmailAction } from "@/actions/email";
import { formatDate } from "@/lib/formats";
import { AbsentStudentAlert } from "./types";

/**
 * Obtiene las inasistencias y tardanzas del día para alertas a padres
 */
export async function getDailyAbsenceAlertsAction(fechaStr?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;
    const targetDate = fechaStr ? new Date(fechaStr) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const institucion = await prisma.institucionEducativa.findUnique({
      where: { id: institucionId || undefined },
      select: { nombreInstitucion: true },
    });
    const nombreColegio =
      institucion?.nombreInstitucion || "la Institución Educativa";

    const asistencias = await prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
        estudiante: {
          institucionId: institucionId || undefined,
        },
        OR: [{ presente: false }, { tardanza: true }],
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            dni: true,
            image: true,
            nivelAcademico: {
              include: {
                grado: true,
                nivel: true,
              },
            },
            padresTutores: {
              include: {
                padreTutor: {
                  select: {
                    name: true,
                    apellidoPaterno: true,
                    telefono: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        estudiante: {
          apellidoPaterno: "asc",
        },
      },
    });

    const formattedFecha = formatDate(targetDate);

    const items: AbsentStudentAlert[] = asistencias.map((a) => {
      const e = a.estudiante;
      const nombreCompleto =
        `${e.name} ${e.apellidoPaterno || ""} ${e.apellidoMaterno || ""}`.trim();
      const aula = e.nivelAcademico
        ? `${e.nivelAcademico.grado?.nombre || ""} "${e.nivelAcademico.seccion}" (${e.nivelAcademico.nivel?.nombre || ""})`
        : "Sin aula";

      const primaryGuardian =
        e.padresTutores.find((p) => p.contactoPrimario)?.padreTutor ||
        e.padresTutores[0]?.padreTutor ||
        null;

      const apoderadoNombre = primaryGuardian
        ? `${primaryGuardian.name} ${primaryGuardian.apellidoPaterno || ""}`.trim()
        : "Apoderado(a)";

      const apoderadoTelefono = primaryGuardian?.telefono || "";
      const apoderadoEmail = primaryGuardian?.email || "";

      const tipoFalta = !a.presente ? "INASISTENCIA" : "TARDANZA";

      let msg = "";
      if (tipoFalta === "INASISTENCIA") {
        msg =
          `*ALERTA DE INASISTENCIA ESCOLAR*\n\n` +
          `Estimado(a) ${apoderadoNombre}, le saludamos de *${nombreColegio}*.\n\n` +
          `Le informamos que su hijo(a) *${nombreCompleto}* (${aula}) no ha registrado ingreso al colegio hoy *${formattedFecha}*.\n\n` +
          `Si se trata de una inasistencia justificada (por motivos de salud u otros), por favor responda a este mensaje con el motivo o certificado médico.\n\n` +
          `Atentamente,\n*Coordinación y Dirección Escolar*`;
      } else {
        msg =
          `*AVISO DE TARDANZA*\n\n` +
          `Estimado(a) ${apoderadoNombre}, le saludamos de *${nombreColegio}*.\n\n` +
          `Le informamos que su hijo(a) *${nombreCompleto}* (${aula}) ha registrado *Tardanza* en el ingreso hoy *${formattedFecha}*.\n\n` +
          `Agradecemos su apoyo en fomentar la puntualidad escolar.\n\n` +
          `Atentamente,\n*Coordinación Escolar*`;
      }

      let whatsappDirectUrl = "";
      if (apoderadoTelefono) {
        const cleanPhone = apoderadoTelefono.replace(/\D/g, "");
        const fullPhone =
          cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
        whatsappDirectUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
      }

      return {
        id: a.id,
        asistenciaId: a.id,
        estudianteId: e.id,
        nombreCompleto,
        dni: e.dni || undefined,
        image: e.image || undefined,
        aula,
        tipoFalta,
        justificado: false,
        apoderadoNombre,
        apoderadoTelefono: apoderadoTelefono || undefined,
        apoderadoEmail: apoderadoEmail || undefined,
        whatsappDirectUrl,
      };
    });

    const inasistenciasCount = items.filter(
      (i) => i.tipoFalta === "INASISTENCIA",
    ).length;
    const tardanzasCount = items.filter(
      (i) => i.tipoFalta === "TARDANZA",
    ).length;

    return {
      success: true,
      data: serialize({
        fecha: formattedFecha,
        items,
        resumen: {
          totalAlertas: items.length,
          inasistenciasCount,
          tardanzasCount,
          conTelefonoCount: items.filter((i) => !!i.apoderadoTelefono).length,
        },
      }),
    };
  } catch (error) {
    console.error("Error in getDailyAbsenceAlertsAction:", error);
    return { error: "Error al consultar las inasistencias del día." };
  }
}

/**
 * Envía alertas masivas de inasistencia/tardanza a los apoderados
 */
export async function sendBulkAbsenceAlertsAction({
  studentAlertIds,
  canal = "WHATSAPP",
}: {
  studentAlertIds: string[];
  canal?: "WHATSAPP" | "SMS" | "EMAIL";
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;

    const asistencias = await prisma.asistencia.findMany({
      where: {
        id: { in: studentAlertIds },
      },
      include: {
        estudiante: {
          include: {
            nivelAcademico: { include: { grado: true } },
            padresTutores: { include: { padreTutor: true } },
          },
        },
      },
    });

    const institucion = await prisma.institucionEducativa.findUnique({
      where: { id: institucionId || undefined },
      select: { nombreInstitucion: true },
    });
    const nombreColegio =
      institucion?.nombreInstitucion || "la Institución Educativa";

    let enviados = 0;
    let fallidos = 0;

    const results = await Promise.all(
      asistencias.map(async (a) => {
        const e = a.estudiante;
        const nombreCompleto = `${e.name} ${e.apellidoPaterno || ""}`.trim();
        const primaryGuardian =
          e.padresTutores.find((p) => p.contactoPrimario)?.padreTutor ||
          e.padresTutores[0]?.padreTutor;

        if (!primaryGuardian) {
          return false;
        }

        const apoderadoNombre =
          `${primaryGuardian.name} ${primaryGuardian.apellidoPaterno || ""}`.trim();
        const tipo = !a.presente ? "Inasistencia" : "Tardanza";
        const fechaTexto = formatDate(a.fecha);

        const mensaje = `Estimado(a) ${apoderadoNombre}, le informamos que ${nombreCompleto} ha registrado ${tipo} hoy ${fechaTexto} en ${nombreColegio}. Si tiene alguna consulta, comuníquese con el colegio.`;

        if (canal === "WHATSAPP" && primaryGuardian.telefono) {
          const res = await sendWhatsappAction({
            to: primaryGuardian.telefono,
            mensaje,
          });
          return !res?.error;
        } else if (canal === "SMS" && primaryGuardian.telefono) {
          const res = await sendSmsAction({
            to: primaryGuardian.telefono,
            mensaje,
          });
          return !res?.error;
        } else if (canal === "EMAIL" && primaryGuardian.email) {
          const res = await sendEmailAction({
            to: primaryGuardian.email,
            subject: `Aviso de ${tipo} - ${nombreCompleto}`,
            nombre: apoderadoNombre,
            mensaje,
          });
          return !res?.error;
        }
        return false;
      })
    );

    for (const success of results) {
      if (success) enviados++;
      else fallidos++;
    }

    return {
      success: true,
      mensaje: `Alertas procesadas: ${enviados} enviadas exitosamente, ${fallidos} omitidas/fallidas.`,
      enviados,
      fallidos,
    };
  } catch (error) {
    console.error("Error in sendBulkAbsenceAlertsAction:", error);
    return { error: "Error al despachar las alertas de inasistencia." };
  }
}
