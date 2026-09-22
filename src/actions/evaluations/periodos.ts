"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { TipoPeriodo } from "@prisma/client";

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
        include: {
          _count: { select: { evaluaciones: true } },
        },
        orderBy: [{ numero: "asc" }, { fechaInicio: "asc" }],
      });
      return { success: serialize(periodos) };
    } catch (error) {
      console.error("Error fetching periodos:", error);
      return { error: "No se pudieron obtener los periodos" };
    }
  }
);

// Acepta tanto el formato plano { nombre, tipo, ... } como el formato anidado { values: {...}, id?: string }
const upsertPeriodoSchema = z.union([
  z.object({
    values: z.record(z.string(), z.any()),
    id: z.string().optional(),
  }),
  z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre del periodo es requerido"),
    tipo: z.string().default("BIMESTRE"),
    numero: z.coerce.number().min(1).max(12),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    anioEscolar: z.coerce.number().min(2000).max(2100),
    activo: z.boolean().optional(),
    institucionId: z.string().optional(),
  }).passthrough(),
]);

export const upsertPeriodoAction = createSafeAction(
  upsertPeriodoSchema,
  async (input, session) => {
    try {
      const rawValues: any =
        "values" in input && input.values ? input.values : input;
      const id =
        "id" in input && typeof input.id === "string" ? input.id : undefined;

      let targetInstitucionId =
        session.user.institucionId || rawValues.institucionId;
      if (!targetInstitucionId) {
        const defaultInst = await prisma.institucionEducativa.findFirst({
          select: { id: true },
        });
        targetInstitucionId = defaultInst?.id;
      }

      if (!targetInstitucionId) {
        return { error: "No se encontró una institución educativa asociada" };
      }

      const tipoEnum = (rawValues.tipo as TipoPeriodo) || TipoPeriodo.BIMESTRE;
      const numero = parseInt(rawValues.numero, 10) || 1;
      const anioEscolar =
        parseInt(rawValues.anioEscolar, 10) || new Date().getFullYear();

      // Verificar unicidad: @@unique([tipo, numero, anioEscolar, institucionId])
      const duplicate = await prisma.periodoAcademico.findFirst({
        where: {
          tipo: tipoEnum,
          numero,
          anioEscolar,
          institucionId: targetInstitucionId,
          ...(id ? { id: { not: id } } : {}),
        },
      });

      if (duplicate) {
        return {
          error: `Ya existe el periodo ${tipoEnum} N° ${numero} para el año ${anioEscolar} ("${duplicate.nombre}"). Por favor cambia el número o tipo.`,
        };
      }

      const data = {
        nombre: (rawValues.nombre || "").trim(),
        tipo: tipoEnum,
        numero,
        fechaInicio: new Date(rawValues.fechaInicio),
        fechaFin: new Date(rawValues.fechaFin),
        anioEscolar,
        activo: rawValues.activo ?? true,
        institucionId: targetInstitucionId,
      };

      if (id) {
        const existing = await prisma.periodoAcademico.findUnique({
          where: { id },
        });
        if (!existing) return { error: "Periodo no encontrado" };

        const periodo = await prisma.periodoAcademico.update({
          where: { id },
          data,
        });
        revalidatePath("/evaluaciones");
        revalidatePath("/gestion/academico/estructura");
        revalidatePath("/gestion/academico/siagie");
        return {
          success: "Periodo actualizado exitosamente",
          data: serialize(periodo),
        };
      } else {
        const periodo = await prisma.periodoAcademico.create({ data });
        revalidatePath("/evaluaciones");
        revalidatePath("/gestion/academico/estructura");
        revalidatePath("/gestion/academico/siagie");
        return {
          success: "Periodo académico creado exitosamente",
          data: serialize(periodo),
        };
      }
    } catch (error: any) {
      console.error("Error upserting periodo:", error);
      if (error?.code === "P2002") {
        return {
          error: "Ya existe un periodo con el mismo tipo, número y año escolar.",
        };
      }
      return { error: "No se pudo procesar el periodo académico" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

export const deletePeriodoAction = createSafeAction(
  z.object({ id: z.string().min(1) }),
  async ({ id }, session) => {
    try {
      const periodo = await prisma.periodoAcademico.findUnique({
        where: { id },
        include: { _count: { select: { evaluaciones: true } } },
      });

      if (!periodo) {
        return { error: "Periodo no encontrado" };
      }

      if (periodo._count.evaluaciones > 0) {
        return {
          error: `No se puede eliminar "${periodo.nombre}": tiene ${periodo._count.evaluaciones} evaluación(es) registrada(s). Elimina las evaluaciones primero.`,
        };
      }

      await prisma.periodoAcademico.delete({
        where: { id },
      });

      revalidatePath("/evaluaciones");
      revalidatePath("/gestion/academico/estructura");
      revalidatePath("/gestion/academico/siagie");

      return {
        success: `Periodo "${periodo.nombre}" eliminado exitosamente`,
      };
    } catch (error) {
      console.error("Error deleting periodo:", error);
      return { error: "No se pudo eliminar el periodo académico" };
    }
  },
  { roles: ["administrativo"] }
);
