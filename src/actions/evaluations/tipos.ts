"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

export const getTiposEvaluacionAction = createSafeAction(
  z.object({}),
  async () => {
    try {
      const tipos = await prisma.tipoEvaluacion.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      });
      return { success: serialize(tipos) };
    } catch (error) {
      console.error("Error fetching tipos:", error);
      return { error: "No se pudieron obtener los tipos de evaluación" };
    }
  }
);
