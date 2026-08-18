"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";

const REVALIDATE_PATH = "/evaluaciones";

export const getEvaluacionDetailAction = createSafeAction(
  z.object({ evaluacionId: z.string() }),
  async ({ evaluacionId }, session) => {
    try {
      const evaluacion = await prisma.evaluacion.findUnique({
        where: { id: evaluacionId },
        include: {
          tipoEvaluacion: true,
          curso: {
            include: {
              areaCurricular: true,
              nivelAcademico: {
                include: { grado: true },
              },
            },
          },
          periodo: true,
        },
      });

      if (!evaluacion) return { success: null };

      if (evaluacion.curso.nivelAcademico.institucionId !== session.user.institucionId) {
          return { error: "No tiene permiso para ver esta evaluación" };
      }

      return { success: serialize(evaluacion) };
    } catch (error) {
      console.error("Error fetching evaluacion detail:", error);
      return { error: "No se pudo obtener el detalle de la evaluación" };
    }
  }
);

export const getEvaluacionesAction = createSafeAction(
  z.object({
    cursoId: z.string().optional(),
    periodoId: z.string().optional(),
    tipoEvaluacionId: z.string().optional(),
    profesorId: z.string().optional(),
  }).optional(),
  async (filters, session) => {
    try {
      const isProfessor = session.user.role === "profesor";
      const targetProfesorId = isProfessor ? session.user.id : filters?.profesorId;

      const profesorWhere = targetProfesorId
        ? {
            OR: [
              { profesorId: targetProfesorId },
              { nivelAcademico: { tutorId: targetProfesorId } },
            ],
          }
        : {};

      const evaluaciones = await prisma.evaluacion.findMany({
        where: {
          cursoId: filters?.cursoId || undefined,
          periodoId: filters?.periodoId || undefined,
          tipoEvaluacionId: filters?.tipoEvaluacionId || undefined,
          activa: true,
          curso: {
            nivelAcademico: {
              institucionId: session.user.institucionId || undefined,
            },
            ...profesorWhere,
          },
        },
        include: {
          tipoEvaluacion: true,
          curso: {
            include: {
              areaCurricular: true,
              nivelAcademico: {
                include: { grado: true },
              },
            },
          },
          periodo: true,
          capacidad: {
            include: {
              competencia: true,
            },
          },
          _count: { select: { notas: true } },
        },
        orderBy: { fecha: "desc" },
      });
      return { success: serialize(evaluaciones) };
    } catch (error) {
      console.error("Error fetching evaluaciones:", error);
      return { error: "No se pudieron obtener las evaluaciones" };
    }
  }
);

export const upsertEvaluacionAction = createSafeAction(
  z.object({
    values: z.any(),
    id: z.string().optional()
  }),
  async ({ values, id }, session) => {
    try {
      const data = {
        ...values,
        peso: parseFloat(values.peso),
        notaMinima: values.notaMinima ? parseFloat(values.notaMinima) : null,
        fecha: new Date(values.fecha),
        fechaLimite: values.fechaLimite ? new Date(values.fechaLimite) : null,
        capacidadId: values.capacidadId || null,
      };

      if (id) {
        const existing = await prisma.evaluacion.findUnique({
          where: { id },
          include: { curso: { include: { nivelAcademico: true } } }
        });

        if (!existing || existing.curso.nivelAcademico.institucionId !== session.user.institucionId) {
            return { error: "Evaluación no encontrada o sin permisos" };
        }

        const evaluacion = await prisma.evaluacion.update({
          where: { id },
          data,
        });
        revalidatePath(REVALIDATE_PATH);
        return {
          success: "Evaluación actualizada",
          data: serialize(evaluacion),
        };
      } else {
        const evaluacion = await prisma.evaluacion.create({ data });
        revalidatePath(REVALIDATE_PATH);
        return {
          success: "Evaluación creada",
          data: serialize(evaluacion),
        };
      }
    } catch (error) {
      console.error("Error upserting evaluacion:", error);
      return { error: "No se pudo procesar la evaluación" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

export const deleteEvaluacionAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, session) => {
    try {
      const existing = await prisma.evaluacion.findUnique({
        where: { id },
        include: { curso: { include: { nivelAcademico: true } } }
      });

      if (!existing || existing.curso.nivelAcademico.institucionId !== session.user.institucionId) {
        return { error: "Evaluación no encontrada o sin permisos" };
      }

      const notas = await prisma.nota.count({ where: { evaluacionId: id } });
      if (notas > 0) {
        return {
          error: `No se puede eliminar: tiene ${notas} notas registradas`,
        };
      }

      await prisma.evaluacion.delete({
        where: { id },
      });
      revalidatePath(REVALIDATE_PATH);
      return { success: "Evaluación eliminada correctamente" };
    } catch (error) {
      console.error("Error deleting evaluacion:", error);
      return { error: "No se pudo eliminar la evaluación" };
    }
  },
  { roles: ["administrativo"] }
);
