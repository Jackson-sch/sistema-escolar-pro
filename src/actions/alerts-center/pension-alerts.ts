"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { serialize } from "@/lib/dto";
import { sendWhatsappAction } from "@/actions/whatsapp";
import { sendSmsAction } from "@/actions/sms";
import { sendEmailAction } from "@/actions/email";
import { formatDate } from "@/lib/formats";
import { DuePensionAlert } from "./types";

/**
 * Obtiene las pensiones por vencer en los próximos N días o ya vencidas
 */
export async function getUpcomingDuePensionsAlertsAction(
  diasAnticipacion: number = 5,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDueDate = new Date(today);
    maxDueDate.setDate(maxDueDate.getDate() + diasAnticipacion);
    maxDueDate.setHours(23, 59, 59, 999);

    const institucion = await prisma.institucionEducativa.findUnique({
      where: { id: institucionId || undefined },
      select: { nombreInstitucion: true },
    });
    const nombreColegio =
      institucion?.nombreInstitucion || "la Institución Educativa";

    const cronogramas = await prisma.cronogramaPago.findMany({
      where: {
        pagado: false,
        fechaVencimiento: {
          lte: maxDueDate,
        },
        estudiante: {
          institucionId: institucionId || undefined,
        },
      },
      include: {
        concepto: true,
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            dni: true,
            nivelAcademico: {
              include: { grado: true, nivel: true },
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
      orderBy: { fechaVencimiento: "asc" },
    });

    const items: DuePensionAlert[] = cronogramas.map((cp) => {
      const e = cp.estudiante;
      const nombreEstudiante =
        `${e.name} ${e.apellidoPaterno || ""} ${e.apellidoMaterno || ""}`.trim();
      const aula = e.nivelAcademico
        ? `${e.nivelAcademico.grado?.nombre || ""} "${e.nivelAcademico.seccion}"`
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

      const totalMonto = Number(cp.monto) + Number(cp.moraAcumulada || 0);
      const saldoPendiente = Math.max(
        0,
        totalMonto - Number(cp.montoPagado || 0),
      );

      const vDate = new Date(cp.fechaVencimiento);
      vDate.setHours(0, 0, 0, 0);

      const diffTime = vDate.getTime() - today.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const esVencido = diasRestantes < 0;

      const formattedVencimiento = formatDate(cp.fechaVencimiento);

      let msg = "";
      if (esVencido) {
        msg =
          `*RECORDATORIO DE PENSIÓN VENCIDA*\n\n` +
          `Estimado(a) ${apoderadoNombre}, le saludamos de *${nombreColegio}*.\n\n` +
          `Le recordamos que la cuota *${cp.concepto.nombre}* de su hijo(a) *${nombreEstudiante}* (${aula}) por el monto de *S/ ${saldoPendiente.toFixed(2)}* venció el *${formattedVencimiento}*.\n\n` +
          `Agradeceremos regularizar su pago en ventanilla o por Yape/Plin/Transferencia para evitar recargos por mora.\n\n` +
          `Atentamente,\n*Tesorería Escolar*`;
      } else {
        msg =
          `*RECORDATORIO PREVENTIVO DE PENSIÓN*\n\n` +
          `Estimado(a) ${apoderadoNombre}, le saludamos cordialmente de *${nombreColegio}*.\n\n` +
          `Le recordamos que la cuota *${cp.concepto.nombre}* de su hijo(a) *${nombreEstudiante}* (${aula}) por *S/ ${saldoPendiente.toFixed(2)}* vencerá el próximo *${formattedVencimiento}*.\n\n` +
          `Puede cancelar puntualmente en caja o a través de nuestros canales digitales.\n\n` +
          `¡Agradecemos su puntualidad!\n*Tesorería Escolar*`;
      }

      let whatsappDirectUrl = "";
      if (apoderadoTelefono) {
        const cleanPhone = apoderadoTelefono.replace(/\D/g, "");
        const fullPhone =
          cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
        whatsappDirectUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
      }

      return {
        id: cp.id,
        cronogramaId: cp.id,
        estudianteId: e.id,
        nombreEstudiante,
        aula,
        concepto: cp.concepto.nombre,
        monto: Number(cp.monto),
        saldoPendiente,
        fechaVencimiento: cp.fechaVencimiento,
        diasRestantes,
        esVencido,
        apoderadoNombre,
        apoderadoTelefono: apoderadoTelefono || undefined,
        apoderadoEmail: apoderadoEmail || undefined,
        whatsappDirectUrl,
      };
    });

    const totalDeuda = items.reduce((sum, i) => sum + i.saldoPendiente, 0);
    const vencidosCount = items.filter((i) => i.esVencido).length;
    const porVencerCount = items.filter((i) => !i.esVencido).length;

    return {
      success: true,
      data: serialize({
        items,
        resumen: {
          totalCuotas: items.length,
          totalDeuda,
          vencidosCount,
          porVencerCount,
          conTelefonoCount: items.filter((i) => !!i.apoderadoTelefono).length,
        },
      }),
    };
  } catch (error) {
    console.error("Error in getUpcomingDuePensionsAlertsAction:", error);
    return { error: "Error al consultar las pensiones por vencer." };
  }
}

/**
 * Envía recordatorios masivos de pensiones por WhatsApp, Email o SMS desde el servidor
 */
export async function sendBulkPensionsAlertsAction({
  cronogramaIds,
  canal = "WHATSAPP",
}: {
  cronogramaIds: string[];
  canal?: "WHATSAPP" | "SMS" | "EMAIL";
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;

    const cronogramas = await prisma.cronogramaPago.findMany({
      where: { id: { in: cronogramaIds } },
      include: {
        concepto: true,
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
      cronogramas.map(async (cp) => {
        const e = cp.estudiante;
        const primaryGuardian =
          e.padresTutores.find((p) => p.contactoPrimario)?.padreTutor ||
          e.padresTutores[0]?.padreTutor;

        if (!primaryGuardian) {
          return false;
        }

        const nombreEstudiante = `${e.name} ${e.apellidoPaterno || ""}`.trim();
        const apoderadoNombre =
          `${primaryGuardian.name} ${primaryGuardian.apellidoPaterno || ""}`.trim();
        const saldo =
          Number(cp.monto) +
          Number(cp.moraAcumulada || 0) -
          Number(cp.montoPagado || 0);
        const fechaVenc = formatDate(cp.fechaVencimiento);

        const mensaje = `Estimado(a) ${apoderadoNombre}, le recordamos de ${nombreColegio} que la pensión "${cp.concepto.nombre}" de ${nombreEstudiante} por un saldo de S/ ${saldo.toFixed(2)} vence el ${fechaVenc}. Puede realizar su pago en caja o por transferencia. ¡Muchas gracias!`;

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
            subject: `Recordatorio de Pago: ${cp.concepto.nombre} - ${nombreEstudiante}`,
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
      mensaje: `Recordatorios procesados: ${enviados} enviados exitosamente, ${fallidos} omitidos/fallidos.`,
      enviados,
      fallidos,
    };
  } catch (error) {
    console.error("Error in sendBulkPensionsAlertsAction:", error);
    return { error: "Error al enviar los recordatorios de pensiones." };
  }
}
