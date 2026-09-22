"use server";
import { serialize } from "@/lib/dto";

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
  z
    .object({
      includeInactive: z.boolean().optional(),
    })
    .optional(),
  async (input, session) => {
    let institucionId = session?.user?.institucionId;
    if (!institucionId) {
      const firstInst = await prisma.institucionEducativa.findFirst({
        select: { id: true },
      });
      institucionId = firstInst?.id;
    }

    const includeInactive = input?.includeInactive ?? true;

    const conceptos = await prisma.conceptoPago.findMany({
      where: {
        ...(institucionId ? { institucionId } : {}),
        ...(includeInactive ? {} : { activo: true }),
      },
      orderBy: { nombre: "asc" },
    });

    return { success: serialize(conceptos) };
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
    let institucionId = session?.user?.institucionId;
    if (!institucionId) {
      const firstInst = await prisma.institucionEducativa.findFirst({
        select: { id: true },
      });
      institucionId = firstInst?.id;
    }

    if (!institucionId) {
      return {
        error:
          "No se encontró una institución educativa vinculada a tu cuenta.",
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
          where: { id },
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
 * Crea múltiples conceptos de pago en una sola transacción atómica (Plantillas Rápidas)
 */
export const createBatchConceptosAction = createSafeAction(
  z.object({
    conceptos: z.array(ConceptoSchema),
  }),
  async ({ conceptos }, session) => {
    let institucionId = session?.user?.institucionId;
    if (!institucionId) {
      const firstInst = await prisma.institucionEducativa.findFirst({
        select: { id: true },
      });
      institucionId = firstInst?.id;
    }

    if (!institucionId) {
      return {
        error: "No se encontró ninguna institución educativa registrada.",
      };
    }

    try {
      await prisma.$transaction(
        conceptos.map((c) =>
          prisma.conceptoPago.create({
            data: {
              nombre: c.nombre,
              montoSugerido: c.montoSugerido,
              moneda: c.moneda,
              moraDiaria: c.moraDiaria,
              activo: c.activo,
              institucionId,
            },
          }),
        ),
      );

      revalidatePath(REVALIDATE_PATH);
      return {
        success: `Se han creado ${conceptos.length} conceptos de pago correctamente.`,
      };
    } catch (error) {
      console.error("Error en createBatchConceptosAction:", error);
      return {
        error: "Ocurrió un error al crear el lote de conceptos.",
      };
    }
  },
  { roles: ["administrativo"] },
);

/**
 * Activa o desactiva directamente un concepto de pago
 */
export const toggleConceptoActivoAction = createSafeAction(
  z.object({
    id: z.string(),
    activo: z.boolean(),
  }),
  async ({ id, activo }, session) => {
    let institucionId = session?.user?.institucionId;
    if (!institucionId) {
      const firstInst = await prisma.institucionEducativa.findFirst({
        select: { id: true },
      });
      institucionId = firstInst?.id;
    }

    const concepto = await prisma.conceptoPago.update({
      where: { id },
      data: { activo },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: `Concepto "${concepto.nombre}" ${activo ? "activado" : "desactivado"} correctamente`,
    };
  },
  { roles: ["administrativo"] },
);

/**
 * Elimina un concepto de pago (o lo desactiva si tiene pagos asociados)
 */
export const deleteConceptoAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }) => {
    const cronogramasAsociados = await prisma.cronogramaPago.count({
      where: { conceptoId: id },
    });

    if (cronogramasAsociados > 0) {
      await prisma.conceptoPago.update({
        where: { id },
        data: { activo: false },
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success:
          "El concepto tiene registros asociados, por lo que fue desactivado en lugar de eliminado físicamente.",
      };
    }

    await prisma.conceptoPago.delete({
      where: { id },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: "Concepto eliminado correctamente" };
  },
  { roles: ["administrativo"] },
);
