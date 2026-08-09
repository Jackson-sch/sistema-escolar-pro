"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";

export const getResumenNotasEstudianteAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    periodoId: z.string().optional(),
  }),
  async ({ estudianteId, periodoId }, session) => {
    try {
      const esAdminProfesor = ["administrativo", "profesor"].includes(session.user.role || "");
      const esPadre = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: session.user.id, hijoId: estudianteId }
      });

      if (!esAdminProfesor && !esPadre && session.user.id !== estudianteId) {
        return { error: "No tiene permiso para ver estas notas" };
      }

      const notas = await prisma.nota.findMany({
        where: {
          estudianteId,
          evaluacion: periodoId ? { periodoId } : undefined,
          estudiante: { institucionId: session.user.institucionId || undefined },
        },
        include: {
          evaluacion: {
            include: {
              tipoEvaluacion: true,
              periodo: true,
            },
          },
          curso: {
            include: { areaCurricular: true },
          },
        },
        orderBy: { fechaRegistro: "desc" },
      });

      const notasPorCurso = notas.reduce((acc: any, nota) => {
        const cursoId = nota.cursoId;
        if (!acc[cursoId]) {
          acc[cursoId] = {
            curso: nota.curso,
            notas: [],
            promedio: 0,
          };
        }
        acc[cursoId].notas.push(nota);
        return acc;
      }, {});

      Object.values(notasPorCurso).forEach((grupo: any) => {
        const sum = grupo.notas.reduce((acc: number, n: any) => acc + n.valor, 0);
        grupo.promedio = grupo.notas.length > 0 ? sum / grupo.notas.length : 0;
      });

      return { success: serialize(notasPorCurso) };
    } catch (error) {
      console.error("Error fetching resumen:", error);
      return { error: "No se pudo obtener el resumen de notas" };
    }
  }
);

export const getRankingEstudianteAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    periodoId: z.string().optional(),
    anioEscolar: z.number().optional()
  }),
  async ({ estudianteId, periodoId, anioEscolar }, session) => {
    try {
      const anio = anioEscolar || new Date().getFullYear();
      
      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId, institucionId: session.user.institucionId || undefined },
        select: { nivelAcademicoId: true },
      });

      if (!estudiante?.nivelAcademicoId) {
        return { success: { posicion: 0, total: 0, promedioEstudiante: 0 } };
      }

      const compañeros = await prisma.user.findMany({
        where: {
          nivelAcademicoId: estudiante.nivelAcademicoId,
          role: "estudiante",
        },
        select: { id: true, name: true },
      });

      if (compañeros.length === 0) {
        return { success: { posicion: 1, total: 1, promedioEstudiante: 0 } };
      }

      const promediosDb = await prisma.nota.groupBy({
        by: ["estudianteId"],
        where: {
          estudianteId: { in: compañeros.map((c) => c.id) },
          evaluacion: {
            periodo: {
              anioEscolar: anio,
              id: periodoId || undefined,
            },
          },
        },
        _avg: { valor: true },
      });

      const promediosEstudiantes = compañeros.map((comp) => {
        const dbAvg = promediosDb.find((p) => p.estudianteId === comp.id);
        return { id: comp.id, promedio: dbAvg?._avg.valor || 0 };
      });

      const rankingOrdenado = promediosEstudiantes.sort(
        (a, b) => b.promedio - a.promedio,
      );

      const index = rankingOrdenado.findIndex((r) => r.id === estudianteId);
      const posicion = index !== -1 ? index + 1 : rankingOrdenado.length;

      return {
        success: {
          posicion,
          total: rankingOrdenado.length,
          promedioEstudiante: rankingOrdenado[index]?.promedio || 0,
        },
      };
    } catch (error) {
      console.error("Error calculando ranking:", error);
      return { error: "No se pudo calcular el ranking" };
    }
  }
);

export const getAsistenciaEstudianteAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    periodoId: z.string().optional(),
    anioEscolar: z.number().optional()
  }),
  async ({ estudianteId, periodoId, anioEscolar }, session) => {
    try {
      const anio = anioEscolar || new Date().getFullYear();
      const whereClause: any = {
        estudianteId,
        estudiante: { institucionId: session.user.institucionId || undefined }
      };

      if (periodoId) {
        const periodo = await prisma.periodoAcademico.findUnique({
          where: { id: periodoId },
          select: { fechaInicio: true, fechaFin: true },
        });

        if (periodo) {
          whereClause.fecha = {
            gte: periodo.fechaInicio,
            lte: periodo.fechaFin,
          };
        }
      } else {
        const fechaInicioAnio = new Date(anio, 0, 1);
        const fechaFinAnio = new Date(anio, 11, 31);
        whereClause.fecha = {
          gte: fechaInicioAnio,
          lte: fechaFinAnio,
        };
      }

      const asistencias = await prisma.asistencia.findMany({
        where: whereClause,
        select: { presente: true },
      });

      const totalDias = asistencias.length;
      const diasPresente = asistencias.filter((a) => a.presente).length;
      const porcentaje = totalDias > 0 ? (diasPresente / totalDias) * 100 : 0;

      return {
        success: {
          porcentaje: parseFloat(porcentaje.toFixed(1)),
          totalDias,
          diasPresente,
        },
      };
    } catch (error) {
      console.error("Error calculando asistencia:", error);
      return { error: "No se pudo calcular la asistencia" };
    }
  }
);
