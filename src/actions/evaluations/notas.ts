"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";

const REVALIDATE_PATH = "/evaluaciones";

export async function getNotasEvaluacionAction(evaluacionId: string) {
  try {
    const notas = await prisma.nota.findMany({
      where: { evaluacionId },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true,
          },
        },
      },
      orderBy: { estudiante: { apellidoPaterno: "asc" } },
    });
    return { data: serialize(notas) };
  } catch (error) {
    console.error("Error fetching notas:", error);
    return { error: "No se pudieron obtener las notas" };
  }
}

export async function getEstudiantesCursoAction(cursoId: string) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        nivelAcademico: true,
      },
    });

    if (!curso?.nivelAcademicoId) {
      return { error: "El curso no tiene sección asignada" };
    }

    const estudiantes = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: curso.nivelAcademicoId,
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        codigoEstudiante: true,
      },
      orderBy: { apellidoPaterno: "asc" },
    });

    return { data: serialize(estudiantes) };
  } catch (error) {
    console.error("Error fetching estudiantes:", error);
    return { error: "No se pudieron obtener los estudiantes" };
  }
}

export const upsertNotaAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    evaluacionId: z.string(),
    cursoId: z.string(),
    valor: z.number(),
    valorLiteral: z.string().optional(),
    comentario: z.string().optional(),
  }),
  async (values, session) => {
    try {
      if (session.user.role === "profesor") {
        const evaluacion = await prisma.evaluacion.findUnique({
          where: { id: values.evaluacionId },
          include: { curso: true }
        });
        
        if (!evaluacion || evaluacion.cursoId !== values.cursoId) {
            return { error: "Inconsistencia en datos de evaluación" };
        }

        const asignacion = await prisma.curso.findFirst({
          where: {
            id: values.cursoId,
            profesorId: session.user.id,
          }
        });

        if (!asignacion) {
          return { error: "No tiene permiso para registrar notas en este curso" };
        }
      } else if (session.user.role !== "administrativo") {
        return { error: "No autorizado" };
      }

      let valorFinal = values.valor;
      if (values.valorLiteral) {
        const mapping: Record<string, number> = {
          AD: 20,
          A: 17,
          B: 13,
          C: 10,
        };
        if (mapping[values.valorLiteral]) {
          valorFinal = mapping[values.valorLiteral];
        }
      }

      const nota = await prisma.nota.upsert({
        where: {
          estudianteId_evaluacionId: {
            estudianteId: values.estudianteId,
            evaluacionId: values.evaluacionId,
          },
        },
        update: {
          valor: valorFinal,
          valorLiteral: values.valorLiteral,
          comentario: values.comentario,
        },
        create: {
          estudianteId: values.estudianteId,
          evaluacionId: values.evaluacionId,
          cursoId: values.cursoId,
          valor: valorFinal,
          valorLiteral: values.valorLiteral,
          comentario: values.comentario,
        },
      });

      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Nota registrada",
        data: serialize(nota),
      };
    } catch (error) {
      console.error("Error upserting nota:", error);
      return { error: "No se pudo registrar la nota" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

export const registrarNotasMasivasAction = createSafeAction(
  z.object({
    evaluacionId: z.string(),
    cursoId: z.string(),
    notas: z.array(z.object({
      estudianteId: z.string(),
      valor: z.number(),
      valorLiteral: z.string().optional(),
      comentario: z.string().optional(),
    })),
  }),
  async ({ evaluacionId, cursoId, notas }, session) => {
    try {
      if (session.user.role === "profesor") {
          const asignacion = await prisma.curso.findFirst({
            where: {
              id: cursoId,
              profesorId: session.user.id,
            }
          });
          if (!asignacion) return { error: "No tiene permiso para este curso" };
      }

      const operations = notas.map((nota) => {
        let valorFinal = nota.valor;
        if (nota.valorLiteral) {
          const mapping: Record<string, number> = {
            AD: 20, A: 17, B: 13, C: 10,
          };
          if (mapping[nota.valorLiteral]) {
            valorFinal = mapping[nota.valorLiteral];
          }
        }

        return prisma.nota.upsert({
          where: {
            estudianteId_evaluacionId: {
              estudianteId: nota.estudianteId,
              evaluacionId,
            },
          },
          update: {
            valor: valorFinal,
            valorLiteral: nota.valorLiteral,
            comentario: nota.comentario,
          },
          create: {
            estudianteId: nota.estudianteId,
            evaluacionId,
            cursoId,
            valor: valorFinal,
            valorLiteral: nota.valorLiteral,
            comentario: nota.comentario,
          },
        });
      });

      const results = await prisma.$transaction(operations);
      revalidatePath(REVALIDATE_PATH);
      return { success: `${results.length} notas registradas correctamente` };
    } catch (error) {
      console.error("Error registrando notas masivas:", error);
      return { error: "Error al registrar las notas" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);
