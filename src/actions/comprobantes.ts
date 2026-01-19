"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import { 
  ComprobanteSchema, 
  AprobarComprobanteSchema, 
  RechazarComprobanteSchema 
} from "@/lib/schemas/comprobantes";
import { z } from "zod";

/**
 * Obtiene las deudas pendientes de los hijos de un padre
 */
export const getDeudaHijosAction = createSafeAction(
  z.object({ padreId: z.string() }),
  async ({ padreId }) => {
    const relaciones = await prisma.relacionFamiliar.findMany({
      where: { padreTutorId: padreId },
      include: {
        hijo: {
          include: {
            cronogramaPagos: {
              where: { pagado: false },
              include: { concepto: true },
              orderBy: { fechaVencimiento: "asc" },
            },
          },
        },
      },
    });

    const deudas = relaciones.flatMap((r) =>
      r.hijo.cronogramaPagos.map((c) => ({
        ...c,
        estudianteNombre: `${r.hijo.name} ${r.hijo.apellidoPaterno}`,
      }))
    );

    return { success: JSON.parse(JSON.stringify(deudas)) };
  }
)

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

    return { success: JSON.parse(JSON.stringify(comprobante)) };
  }
)

/**
 * Obtiene los comprobantes de un padre
 */
export const getComprobantesAction = createSafeAction(
  z.object({ padreId: z.string() }),
  async ({ padreId }) => {
    const comprobantes = await prisma.comprobantePago.findMany({
      where: { padreId },
      include: {
        cronograma: {
          include: {
            concepto: true,
            estudiante: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: JSON.parse(JSON.stringify(comprobantes)) };
  }
)

/**
 * Obtiene comprobantes pendientes de verificación (para admin)
 */
export const getPendingComprobantesAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;

    const comprobantes = await prisma.comprobantePago.findMany({
      where: { 
        estado: "PENDIENTE",
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
          },
        },
        padre: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: JSON.parse(JSON.stringify(comprobantes)) };
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
        } 
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

    return { success: "Comprobante rechazado correctamente" };
  },
  { roles: ["administrativo"] }
)
