"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Obtiene las deudas y los hijos para el módulo de deudas
 */
export const getDeudasPortalAction = createSafeAction(
  z.object({ hijoId: z.string().optional() }),
  async ({ hijoId }, session) => {
    try {
      const padreId = session.user.id;
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            include: {
              nivelAcademico: {
                include: { grado: true, nivel: true },
              },
            },
          },
        },
      });

      const hijos = relaciones.map((r) => r.hijo);
      const selectedHijoId = hijoId || hijos[0]?.id;

      if (hijoId && !hijos.some(h => h.id === hijoId)) {
        return { error: "No autorizado para ver las deudas de este estudiante" };
      }

      let deudas: any[] = [];
      let historial: any[] = [];

      if (selectedHijoId) {
        const [deudasRes, historialRes] = await Promise.all([
          prisma.cronogramaPago.findMany({
            where: {
              estudianteId: selectedHijoId,
              pagado: false,
            },
            include: {
              concepto: true,
              estudiante: true,
            },
            orderBy: { fechaVencimiento: "asc" },
          }),
          prisma.cronogramaPago.findMany({
            where: {
              estudianteId: selectedHijoId,
              pagado: true,
            },
            include: {
              concepto: true,
              estudiante: {
                include: {
                  nivelAcademico: {
                    include: { grado: true, nivel: true },
                  },
                },
              },
              pagos: {
                where: { numeroBoleta: { not: null } },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
            orderBy: { updatedAt: "desc" },
          }),
        ]);

        deudas = deudasRes;
        historial = historialRes;
      }

      return {
        success: {
          hijos: serialize(hijos),
          deudas: serialize(deudas),
          historial: serialize(historial),
          selectedHijoId,
        },
      };
    } catch (error) {
      console.error("Error fetching deudas portal info:", error);
      return { error: "No se pudieron obtener las deudas" };
    }
  }
);

/**
 * Obtiene las boletas y comprobantes para el módulo de boletas
 */
export const getBoletasPortalAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const [institucion, relaciones, comprobantesAprobados] = await Promise.all([
        prisma.institucionEducativa.findFirst({
           where: { id: session.user.institucionId || undefined }
        }),
        prisma.relacionFamiliar.findMany({
          where: { padreTutorId: padreId },
          include: {
            hijo: {
              include: {
                nivelAcademico: {
                  include: { grado: true, nivel: true },
                },
                cronogramaPagos: {
                  where: {
                    pagado: true,
                    pagos: { some: { numeroBoleta: { not: null } } },
                  },
                  include: {
                    concepto: true,
                    pagos: {
                      where: { numeroBoleta: { not: null } },
                      orderBy: { createdAt: "desc" },
                      take: 1,
                    },
                  },
                  orderBy: { updatedAt: "desc" },
                },
              },
            },
          },
        }),
        prisma.comprobantePago.findMany({
          where: { padreId: padreId, estado: "APROBADO" },
          include: {
            cronograma: {
              include: {
                concepto: true,
                estudiante: {
                  include: {
                    nivelAcademico: {
                      include: { grado: true, nivel: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { verificadoEn: "desc" },
        }),
      ]);

      return {
        success: {
          institucion: serialize(institucion),
          relaciones: serialize(relaciones),
          comprobantesAprobados: serialize(
            comprobantesAprobados,
          ),
        },
      };
    } catch (error) {
      console.error("Error fetching boletas portal info:", error);
      return { error: "No se pudieron obtener las boletas" };
    }
  }
);

/**
 * Obtiene el detalle de un cronograma para el formulario de nuevo comprobante
 */
export const getCronogramaDetailAction = createSafeAction(
  z.object({
    cronogramaId: z.string(),
    padreId: z.string().optional(),
  }),
  async ({ cronogramaId }, session) => {
    try {
      const padreId = session.user.id;
      const cronograma = await prisma.cronogramaPago.findUnique({
        where: { id: cronogramaId },
        include: {
          concepto: true,
          estudiante: {
            include: {
              padresTutores: true,
            },
          },
        },
      });

      if (!cronograma) return { error: "Deuda no encontrada" };

      const esPadre = cronograma.estudiante.padresTutores.some(
        (r) => r.padreTutorId === padreId,
      );

      if (!esPadre && session.user.role !== "administrativo") {
        return { error: "No tienes permiso para ver esta deuda" };
      }

      return { success: serialize(cronograma) };
    } catch (error) {
      console.error("Error fetching cronograma detail:", error);
      return { error: "No se pudo obtener el detalle de la deuda" };
    }
  }
);

/**
 * Obtiene todas las deudas pendientes de todos los hijos para el selector
 */
export const getAllPendingDeudasAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const relaciones = await prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            include: {
              cronogramaPagos: {
                where: { pagado: false },
                include: { concepto: true },
              },
            },
          },
        },
      });

      return { success: serialize(relaciones) };
    } catch (error) {
      console.error("Error fetching all pending deudas:", error);
      return { error: "No se pudieron obtener las deudas pendientes" };
    }
  }
);
