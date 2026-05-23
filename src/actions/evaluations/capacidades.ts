"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";

export const getCapacidadesByCursoAction = createSafeAction(
  z.object({ cursoId: z.string() }),
  async ({ cursoId }, session) => {
    try {
      const curso = await prisma.curso.findUnique({
        where: { id: cursoId, nivelAcademico: { institucionId: session.user.institucionId || undefined } },
        include: {
          areaCurricular: {
            include: {
              competencias: {
                include: { capacidades: true },
              },
            },
          },
        },
      });

      if (!curso?.areaCurricular) return { success: [] };

      const capacidades = curso.areaCurricular.competencias.flatMap((comp) =>
        comp.capacidades.map((cap) => ({
          ...cap,
          competenciaNombre: comp.nombre,
        })),
      );

      return { success: serialize(capacidades) };
    } catch (error) {
      console.error("Error fetching capacities by course:", error);
      return { error: "No se pudieron obtener las capacidades" };
    }
  }
);
