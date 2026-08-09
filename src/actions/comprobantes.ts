"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import { 
  ComprobanteSchema, 
  AprobarComprobanteSchema, 
  RechazarComprobanteSchema 
} from "@/lib/schemas/comprobantes";
import { z } from "zod";
import { sendEmailAction } from "@/actions/email";
import { sendSmsAction } from "@/actions/sms";
import { getActiveSedeId } from "@/actions/active-sede";


/**
 * Crea un nuevo comprobante de pago
 */
export const createComprobanteAction = createSafeAction(
  ComprobanteSchema,
  async (data, session) => {
    const userId = session.user.id;

    // Verificar que el cronograma existe y pertenece a un hijo del padre
    const cronograma = await prisma.cronogramaPago.findUnique({
      where: { id: data.cronogramaId },
      include: {
        estudiante: {
          include: {
            padresTutores: true,
          },
        },
      },
    });

    if (!cronograma) {
      return { error: "Cronograma no encontrado" };
    }

    const esPadre = cronograma.estudiante.padresTutores.some(
      (r) => r.padreTutorId === userId
    );

    if (!esPadre) {
      return { error: "No autorizado para este estudiante" };
    }

    const comprobante = await prisma.comprobantePago.create({
      data: {
        cronogramaId: data.cronogramaId,
        padreId: userId,
        archivoUrl: data.archivoUrl,
        monto: data.monto,
        bancoOrigen: data.bancoOrigen,
        numeroOperacion: data.numeroOperacion,
        fechaOperacion: new Date(data.fechaOperacion),
        estado: "PENDIENTE",
      },
    });

    revalidatePath("/portal");
    revalidatePath("/finanzas/verificacion");

    return { success: serialize(comprobante) };
  }
)

/**
 * Obtiene comprobantes pendientes de verificación (para admin)
 */
export const getPendingComprobantesAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;
    const activeSedeId = await getActiveSedeId();
    const currentYear = new Date().getFullYear();

    const studentWhereCondition: any = {
      institucionId: institucionId || undefined,
    };

    if (activeSedeId) {
      studentWhereCondition.matriculas = {
        some: {
          anioAcademico: currentYear,
          nivelAcademico: { sedeId: activeSedeId },
        },
      };
    }

    const comprobantes = await prisma.comprobantePago.findMany({
      where: { 
        estado: "PENDIENTE",
        cronograma: {
          estudiante: studentWhereCondition,
        }
      },
      include: {
        cronograma: {
          include: {
            concepto: true,
            estudiante: {
              include: {
                nivelAcademico: {
                  include: {
                    grado: true,
                    nivel: true,
                  },
                },
              },
            },
          },
        },
        padre: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: serialize(comprobantes) };
  },
  { roles: ["administrativo"] }
)

/**
 * Aprueba un comprobante y marca el pago como realizado
 */
export const aprobarComprobanteAction = createSafeAction(
  AprobarComprobanteSchema,
  async ({ id: comprobanteId }, session) => {
    const institucionId = session.user.institucionId;

    const comprobante = await prisma.comprobantePago.findFirst({
      where: { 
        id: comprobanteId,
        cronograma: {
          estudiante: {
            institucionId: institucionId || undefined
          }
        }
      },
      include: { 
        cronograma: {
          include: {
            concepto: true,
            estudiante: true,
          }
        },
        padre: true
      },
    });

    if (!comprobante) {
      return { error: "Comprobante no encontrado o no pertenece a su institución" };
    }

    const montoComprobante = Number(comprobante.monto);
    const montoPagadoActual = Number(comprobante.cronograma.montoPagado);
    const montoTotal = Number(comprobante.cronograma.monto);
    const nuevoMontoPagado = montoPagadoActual + montoComprobante;
    const estaPagado = nuevoMontoPagado >= montoTotal;

    // Generar número de boleta (Scoping by institution if possible, but currently global)
    const ultimoPago = await prisma.pago.findFirst({
      where: {
        estudiante: { institucionId }
      },
      orderBy: { createdAt: 'desc' },
      select: { numeroBoleta: true }
    });
    
    let numeroBoleta = 'B001-000001';
    if (ultimoPago?.numeroBoleta) {
      const match = ultimoPago.numeroBoleta.match(/B(\d+)-(\d+)/);
      if (match) {
        const serie = parseInt(match[1]);
        const numero = parseInt(match[2]) + 1;
        numeroBoleta = `B${String(serie).padStart(3, '0')}-${String(numero).padStart(6, '0')}`;
      }
    }

    await prisma.$transaction([
      prisma.comprobantePago.update({
        where: { id: comprobanteId },
        data: {
          estado: "APROBADO",
          verificadoPorId: session.user.id,
          verificadoEn: new Date(),
        },
      }),
      prisma.cronogramaPago.update({
        where: { id: comprobante.cronogramaId },
        data: {
          montoPagado: nuevoMontoPagado,
          pagado: estaPagado,
        },
      }),
      prisma.pago.create({
        data: {
          cronogramaPagoId: comprobante.cronogramaId,
          estudianteId: comprobante.cronograma.estudianteId,
          concepto: comprobante.cronograma.concepto.nombre,
          monto: montoComprobante,
          fechaVencimiento: comprobante.cronograma.fechaVencimiento,
          fechaPago: new Date(),
          metodoPago: "Transferencia",
          referenciaPago: comprobante.numeroOperacion,
          numeroBoleta,
          estado: "completado",
        },
      }),
    ]);

    revalidatePath("/portal");
    revalidatePath("/finanzas/verificacion");
    revalidatePath("/finanzas");

    // Enviar notificación por correo (asíncrono, no bloquea el retorno de la acción)
    if (comprobante.padre?.email) {
      sendEmailAction({
        to: comprobante.padre.email,
        subject: "Pago Verificado y Aprobado",
        nombre: `${comprobante.padre.name} ${comprobante.padre.apellidoPaterno || ''}`.trim(),
        mensaje: `Su pago por el concepto de "${comprobante.cronograma.concepto.nombre}" (S/ ${montoComprobante}) ha sido verificado y aprobado. Se ha registrado bajo la boleta: ${numeroBoleta}.`,
        accionLabel: "Ver Historial en el Portal",
        accionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/finanzas`
      }).catch(err => console.error("Error enviando email comprobante:", err));
    }

    if (comprobante.padre?.telefono) {
      sendSmsAction({
        to: comprobante.padre.telefono,
        mensaje: `Su pago de S/${montoComprobante} ha sido aprobado. Boleta: ${numeroBoleta}. Gracias.`
      }).catch(err => console.error("Error enviando sms comprobante:", err));
    }

    return { success: "Comprobante aprobado exitosamente" };
  },
  { roles: ["administrativo"] }
)

/**
 * Rechaza un comprobante con motivo
 */
export const rechazarComprobanteAction = createSafeAction(
  RechazarComprobanteSchema,
  async ({ id: comprobanteId, motivo }, session) => {
    const institucionId = session.user.institucionId;

    const comprobante = await prisma.comprobantePago.findFirst({
      where: { 
        id: comprobanteId,
        cronograma: {
          estudiante: {
            institucionId: institucionId || undefined
          }
        }
      },
      include: {
        cronograma: { include: { concepto: true } },
        padre: true
      }
    });

    if (!comprobante) {
      return { error: "Comprobante no encontrado o no pertenece a su institución" };
    }

    await prisma.comprobantePago.update({
      where: { id: comprobanteId },
      data: {
        estado: "RECHAZADO",
        motivoRechazo: motivo,
        verificadoPorId: session.user.id,
        verificadoEn: new Date(),
      },
    });

    revalidatePath("/portal");
    revalidatePath("/finanzas/verificacion");

    // Enviar notificación de rechazo
    if (comprobante.padre?.email) {
      sendEmailAction({
        to: comprobante.padre.email,
        subject: "Atención: Comprobante de Pago Rechazado",
        nombre: `${comprobante.padre.name} ${comprobante.padre.apellidoPaterno || ''}`.trim(),
        mensaje: `La verificación de su pago para "${comprobante.cronograma.concepto.nombre}" ha sido rechazada. Motivo: ${motivo}. Por favor, revise y vuelva a intentarlo o comuníquese con secretaría.`,
        accionLabel: "Ir a Mis Finanzas",
        accionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/finanzas`
      }).catch(err => console.error("Error enviando email rechazo:", err));
    }

    if (comprobante.padre?.telefono) {
      sendSmsAction({
        to: comprobante.padre.telefono,
        mensaje: `Su comprobante de pago fue devuelto/rechazado. Motivo: ${motivo}. Revise el portal.`
      }).catch(err => console.error("Error enviando sms rechazo:", err));
    }

    return { success: "Comprobante rechazado correctamente" };
  },
  { roles: ["administrativo"] }
)
