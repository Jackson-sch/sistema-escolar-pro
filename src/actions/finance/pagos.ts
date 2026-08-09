"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

const REVALIDATE_PATH = "/finanzas";

/**
 * Registra un pago parcial o total
 */
export const registrarPagoAction = createSafeAction(
  z.object({
    cronogramaId: z.string(),
    monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
    metodoPago: z.string().optional(),
    referencia: z.string().optional(),
    numeroBoleta: z.string().optional(),
    observaciones: z.string().optional(),
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId;

    const result = await prisma.$transaction(async (tx) => {
      const cronograma = await tx.cronogramaPago.findFirst({
        where: {
          id: values.cronogramaId,
          estudiante: { institucionId },
        },
        include: { concepto: true },
      });

      if (!cronograma) {
        throw new Error(
          "Cronograma no encontrado o no pertenece a su institución.",
        );
      }

      const nuevoMontoPagado =
        Number(cronograma.montoPagado) + Number(values.monto);
      const estaPagado = nuevoMontoPagado >= Number(cronograma.monto);

      await tx.cronogramaPago.update({
        where: { id: values.cronogramaId },
        data: {
          montoPagado: nuevoMontoPagado,
          pagado: estaPagado,
          updatedAt: new Date(),
        },
      });

      await tx.pago.create({
        data: {
          estudianteId: cronograma.estudianteId,
          cronogramaPagoId: cronograma.id,
          concepto: cronograma.concepto.nombre,
          monto: values.monto,
          metodoPago: values.metodoPago || "Efectivo",
          referenciaPago: values.referencia,
          numeroBoleta: values.numeroBoleta,
          fechaVencimiento: cronograma.fechaVencimiento,
          fechaPago: new Date(),
          estado: "completado",
          observaciones: values.observaciones,
        },
      });

      return {
        estaPagado,
        saldoPendiente: Number(cronograma.monto) - nuevoMontoPagado,
      };
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: result.estaPagado
        ? "Pago registrado y completado exitosamente"
        : `Pago parcial registrado. Saldo pendiente: S/ ${result.saldoPendiente.toFixed(2)}`,
    };
  },
  { roles: ["administrativo"] },
);

/**
/**
 * Obtiene el siguiente número de comprobante autoincremental
 */
export const getNextComprobanteAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;

    const ultimoPago = await prisma.pago.findFirst({
      where: {
        numeroBoleta: {
          startsWith: "B001-",
        },
        estudiante: { institucionId },
      },
      orderBy: {
        numeroBoleta: "desc",
      },
      select: {
        numeroBoleta: true,
      },
    });

    if (!ultimoPago || !ultimoPago.numeroBoleta) {
      return { success: "B001-000001" };
    }

    const currentNumber = parseInt(ultimoPago.numeroBoleta.split("-")[1]);
    const nextNumber = currentNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(6, "0");

    return { success: `B001-${formattedNumber}` };
  },
);

/**
 * Anula un pago realizado
 */
export const anularPagoAction = createSafeAction(
  z.object({ pagoId: z.string() }),
  async ({ pagoId }, session) => {
    const institucionId = session.user.institucionId;

    try {
      await prisma.$transaction(async (tx) => {
        const pago = await tx.pago.findUnique({
          where: { id: pagoId },
          include: {
            cronogramaPago: true,
            estudiante: true,
          },
        });

        if (!pago || pago.estudiante.institucionId !== institucionId) {
          throw new Error("Pago no encontrado o no autorizado.");
        }

        if (pago.estado === "anulado") {
          throw new Error("Este pago ya ha sido anulado.");
        }

        if (!pago.cronogramaPagoId) {
          throw new Error(
            "Este pago no está vinculado a un cronograma y no puede ser anulado mediante este proceso.",
          );
        }

        // 1. Marcar el pago como anulado
        await tx.pago.update({
          where: { id: pagoId },
          data: {
            estado: "anulado",
            updatedAt: new Date(),
          },
        });

        // 2. Revertir montos en el cronograma
        const cronograma = pago.cronogramaPago!;
        const nuevoMontoPagado = Math.max(
          0,
          Number(cronograma.montoPagado) - Number(pago.monto),
        );

        await tx.cronogramaPago.update({
          where: { id: pago.cronogramaPagoId },
          data: {
            montoPagado: nuevoMontoPagado,
            pagado: false, // Siempre false si quitamos un pago
            updatedAt: new Date(),
          },
        });

        return { success: true };
      });

      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Pago anulado correctamente. El saldo ha sido revertido.",
      };
    } catch (error: any) {
      console.error("Error anulando pago:", error);
      return { error: error.message || "No se pudo anular el pago." };
    }
  },
  { roles: ["administrativo"] },
);
