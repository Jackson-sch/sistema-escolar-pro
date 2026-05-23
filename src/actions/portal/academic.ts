"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Obtiene el resumen de asistencia de un estudiante para un mes y año específicos
 */
export const getStudentMonthAttendanceAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    mes: z.number(),
    anio: z.number(),
  }),
  async ({ estudianteId, mes, anio }, session) => {
    try {
      const padreId = session.user.id;
      
      // Validación de Seguridad: Verificar que el estudiante es hijo del usuario logueado
      const esHijo = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: padreId, hijoId: estudianteId }
      });

      if (!esHijo && session.user.role !== "administrativo") {
        return { error: "No tiene permiso para ver la asistencia de este estudiante" };
      }

      const startDate = new Date(anio, mes, 1);
      const endDate = new Date(anio, mes + 1, 0, 23, 59, 59, 999);

      const asistencias = await prisma.asistencia.findMany({
        where: {
          estudianteId,
          fecha: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          curso: true,
        },
        orderBy: { fecha: "asc" },
      });

      return { success: serialize(asistencias) };
    } catch (error) {
      console.error("Error fetching student month attendance:", error);
      return { error: "No se pudo obtener la asistencia mensual" };
    }
  }
);

/**
 * Obtiene los anuncios y eventos dirigidos a un estudiante específico (según su nivel y grado)
 */
export const getPortalCommunicationsAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }, session) => {
    try {
      const padreId = session.user.id;

      if (estudianteId !== "todos") {
        // Validación: El estudiante debe ser hijo del padre
        const esHijo = await prisma.relacionFamiliar.findFirst({
          where: { padreTutorId: padreId, hijoId: estudianteId }
        });

        if (!esHijo && session.user.role !== "administrativo") {
          return { error: "Acceso denegado a comunicaciones de este estudiante" };
        }
      }

      if (estudianteId === "todos") {
        const [anuncios, eventos] = await Promise.all([
          prisma.anuncio.findMany({
            where: {
              activo: true,
              OR: [{ dirigidoA: "TODOS" }, { dirigidoA: "PADRES" }],
            },
            include: {
              autor: {
                select: { name: true, apellidoPaterno: true, image: true },
              },
            },
            orderBy: [{ fijado: "desc" }, { fechaPublicacion: "desc" }],
          }),
          prisma.evento.findMany({
            where: {
              estado: "programado",
              OR: [{ publico: true }, { dirigidoA: "PADRES" }],
            },
            include: {
              organizador: {
                select: { name: true, image: true },
              },
            },
            orderBy: { fechaInicio: "asc" },
          }),
        ]);

        return {
          success: {
            anuncios: serialize(anuncios),
            eventos: serialize(eventos),
          },
        };
      }

      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId },
        include: {
          nivelAcademico: true,
        },
      });

      if (!estudiante) return { error: "Estudiante no encontrado" };

      const nivelId = estudiante.nivelAcademico?.nivelId;
      const gradoId = estudiante.nivelAcademico?.gradoId;

      const [anuncios, eventos] = await Promise.all([
        prisma.anuncio.findMany({
          where: {
            activo: true,
            OR: [
              { dirigidoA: "TODOS" },
              {
                AND: [
                  { dirigidoA: "PADRES" },
                  { niveles: { none: {} } },
                  { grados: { none: {} } },
                ],
              },
              {
                AND: [
                  { dirigidoA: { in: ["PADRES", "ESTUDIANTES"] } },
                  {
                    OR: [
                      { niveles: { some: { id: nivelId } } },
                      { grados: { some: { id: gradoId } } },
                    ],
                  },
                ],
              },
            ],
          },
          include: {
            autor: {
              select: { name: true, apellidoPaterno: true, image: true },
            },
          },
          orderBy: [{ fijado: "desc" }, { fechaPublicacion: "desc" }],
        }),
        prisma.evento.findMany({
          where: {
            estado: "programado",
            OR: [
              { publico: true },
              {
                AND: [
                  { dirigidoA: "PADRES" },
                  { niveles: { none: {} } },
                  { grados: { none: {} } },
                ],
              },
              {
                AND: [
                  { dirigidoA: { in: ["PADRES", "ESTUDIANTES"] } },
                  {
                    OR: [
                      { niveles: { some: { id: nivelId } } },
                      { grados: { some: { id: gradoId } } },
                    ],
                  },
                ],
              },
            ],
          },
          include: {
            organizador: {
              select: { name: true, image: true },
            },
          },
          orderBy: { fechaInicio: "asc" },
        }),
      ]);

      return {
        success: {
          anuncios: serialize(anuncios),
          eventos: serialize(eventos),
        },
      };
    } catch (error) {
      console.error("Error fetching portal communications:", error);
      return { error: "No se pudieron obtener las comunicaciones" };
    }
  }
);

/**
 * Obtiene el horario semanal de un estudiante
 */
export const getStudentScheduleAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }, session) => {
    try {
      const padreId = session.user.id;

      // Validación de Seguridad
      const esHijo = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: padreId, hijoId: estudianteId }
      });

      if (!esHijo && session.user.role !== "administrativo") {
        return { error: "No autorizado para ver el horario de este estudiante" };
      }

      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId },
        include: {
          nivelAcademico: true,
        },
      });

      if (!estudiante?.nivelAcademicoId)
        return { error: "Estudiante no tiene sección asignada" };

      const horarios = await prisma.horario.findMany({
        where: {
          curso: {
            nivelAcademicoId: estudiante.nivelAcademicoId,
          },
        },
        include: {
          curso: {
            include: {
              areaCurricular: true,
              profesor: {
                select: { name: true, apellidoPaterno: true },
              },
            },
          },
        },
        orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
      });

      return { success: serialize(horarios) };
    } catch (error) {
      console.error("Error fetching student schedule:", error);
      return { error: "No se pudo obtener el horario" };
    }
  }
);
