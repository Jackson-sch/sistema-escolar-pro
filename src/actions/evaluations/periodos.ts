"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";

export const getPeriodosAction = createSafeAction(
  z.object({ anioEscolar: z.number().optional() }).optional(),
  async (filters, session) => {
    try {
      const periodos = await prisma.periodoAcademico.findMany({
        where: {
          ...(filters?.anioEscolar ? { anioEscolar: filters.anioEscolar } : {}),
          activo: true,
          institucionId: session.user.institucionId || undefined,
        },
        orderBy: { fechaInicio: "asc" },
      });
      return { success: serialize(periodos) };
    } catch (error) {
      console.error("Error fetching periodos:", error);
      return { error: "No se pudieron obtener los periodos" };
    }
  }
);

export const upsertPeriodoAction = createSafeAction(
  z.object({
    values: z.any(),
    id: z.string().optional()
  }),
  async ({ values, id }, session) => {
    try {
      const data = {
        ...values,
        fechaInicio: new Date(values.fechaInicio),
        fechaFin: new Date(values.fechaFin),
        numero: parseInt(values.numero),
        anioEscolar: parseInt(values.anioEscolar),
        institucionId: session.user.institucionId || values.institucionId
      };

      if (id) {
        const existing = await prisma.periodoAcademico.findUnique({
          where: { id, institucionId: session.user.institucionId || undefined }
        });
        if (!existing) return { error: "Periodo no encontrado o sin permisos" };

        const periodo = await prisma.periodoAcademico.update({
          where: { id },
          data,
        });
        revalidatePath("/evaluaciones");
        return {
          success: "Periodo actualizado",
          data: serialize(periodo),
        };
      } else {
        const periodo = await prisma.periodoAcademico.create({ data });
        revalidatePath("/evaluaciones");
        return {
          success: "Periodo creado",
          data: serialize(periodo),
        };
      }
    } catch (error) {
      console.error("Error upserting periodo:", error);
      return { error: "No se pudo procesar el periodo" };
    }
  },
  { roles: ["administrativo"] }
);
