"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";
import { logAuditEvent } from "@/lib/audit";

const REVALIDATE_PATH = "/evaluaciones";

export async function getNotasEvaluacionAction(evaluacionId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      select: { curso: { select: { institucionId: true } } },
    });

    if (
      !evaluacion ||
      (session.user.institucionId &&
        evaluacion.curso.institucionId !== session.user.institucionId)
    ) {
      return { error: "Evaluación no encontrada o acceso denegado" };
    }

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
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        nivelAcademico: true,
      },
    });

    if (
      !curso?.nivelAcademicoId ||
      (session.user.institucionId &&
        curso.institucionId !== session.user.institucionId)
    ) {
      return { error: "El curso no tiene sección asignada o acceso denegado" };
    }

    const estudiantes = await prisma.user.findMany({
      where: {
        role: "estudiante",
        OR: [
          { nivelAcademicoId: curso.nivelAcademicoId },
          {
            matriculas: {
              some: {
                nivelAcademicoId: curso.nivelAcademicoId,
                estado: "activo",
              },
            },
          },
        ],
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
            OR: [
              { profesorId: session.user.id },
              { nivelAcademico: { tutorId: session.user.id } },
            ],
          },
        });
        if (!asignacion) return { error: "No tiene permiso para este curso" };
      }

      const operations = notas.map((nota) => {
        let valorFinal = Math.min(20, Math.max(0, nota.valor));
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

      // Bitácora de Auditoría
      logAuditEvent({
        accion: "UPDATE",
        entidad: "Nota",
        entidadId: evaluacionId,
        detalles: {
          evaluacionId,
          cursoId,
          totalNotas: results.length,
        },
        usuarioId: session.user.id,
        usuarioNombre: session.user.name || undefined,
        usuarioEmail: session.user.email || undefined,
        institucionId: session.user.institucionId || undefined,
      });

      revalidatePath(REVALIDATE_PATH);
      return { success: `${results.length} notas registradas correctamente` };
    } catch (error) {
      console.error("Error registrando notas masivas:", error);
      return { error: "Error al registrar las notas" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);
