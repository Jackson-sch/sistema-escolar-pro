"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Obtiene la lista de estudiantes vinculados a un padre/tutor
 */
export const getParentStudentsAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              image: true,
              nivelAcademico: {
                select: {
                  nivel: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                  grado: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const hijos = relaciones.map((r) => r.hijo);
      return { success: serialize(hijos) };
    } catch (error) {
      console.error("Error fetching parent students:", error);
      return { error: "No se pudo obtener la lista de estudiantes" };
    }
  }
);
