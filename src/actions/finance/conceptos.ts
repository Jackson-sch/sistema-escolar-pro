"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import { ConceptoSchema } from "@/lib/schemas/finance";
import { z } from "zod";

const REVALIDATE_PATH = "/finanzas";

/**
 * Obtiene los conceptos de pago de la institución (filtrado por la sesión del usuario)
 */
export const getConceptosAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;

    const conceptos = await prisma.conceptoPago.findMany({
      where: {
        institucionId: institucionId || undefined,
        activo: true,
      },
      orderBy: { nombre: "asc" },
    });

    return { success: JSON.parse(JSON.stringify(conceptos)) };
  },
);

/**
 * Crea o actualiza un concepto de pago
 */
export const upsertConceptoAction = createSafeAction(
  z.object({
    id: z.string().optional(),
    values: ConceptoSchema,
  }),
  async ({ id, values }, session) => {
    const institucionId = session.user.institucionId;

    // Validar que la institución existe antes de proceder (evitar error de clave foránea huérfana)
    const institucionExiste = await prisma.institucionEducativa.findUnique({
      where: { id: institucionId },
      select: { id: true },
    });

    if (!institucionExiste) {
      console.error(
        `ERROR CRÍTICO: La institución con ID ${institucionId} no existe en la base de datos.`,
      );
      return {
        error:
          "Tu sesión está vinculada a una institución que ya no existe. Por favor, cierra sesión e inicia de nuevo.",
      };
    }

    const data = {
      nombre: values.nombre,
      montoSugerido: values.montoSugerido,
      moneda: values.moneda,
      moraDiaria: values.moraDiaria,
      activo: values.activo,
      institucionId: institucionId,
    };

    try {
      if (id) {
        const concepto = await prisma.conceptoPago.update({
          where: { id, institucionId },
          data,
        });
        revalidatePath(REVALIDATE_PATH);
        return {
          success: `Concepto "${concepto.nombre}" actualizado correctamente`,
        };
      } else {
        const concepto = await prisma.conceptoPago.create({
          data,
        });
        revalidatePath(REVALIDATE_PATH);
        return {
          success: `Concepto "${concepto.nombre}" creado correctamente`,
        };
      }
    } catch (error) {
      console.error("Error detallado en upsertConceptoAction:", error);
      return {
        error: "No se pudo guardar el concepto. Error interno del servidor.",
      };
    }
  },
  { roles: ["administrativo"] },
);

/**
 * Elimina (desactiva) un concepto de pago
 */
export const deleteConceptoAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, session) => {
    const institucionId = session.user.institucionId;

    await prisma.conceptoPago.update({
      where: { id, institucionId },
      data: { activo: false },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: "Concepto eliminado correctamente" };
  },
  { roles: ["administrativo"] },
);
