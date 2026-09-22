"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { EscalaCalificacion } from "@prisma/client";
import type {
  BatchPlanCourseItem,
  CurricularPlanResult,
  GenerateBatchInput,
} from "./batch-cneb-types";

export async function getCurricularPlanForSectionAction(
  seccionId: string,
  periodoId: string,
  profesorId?: string,
): Promise<{ data?: CurricularPlanResult; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const seccion = await prisma.nivelAcademico.findUnique({
      where: { id: seccionId },
      include: {
        grado: true,
        nivel: true,
        cursos: {
          where: { activo: true, ...(profesorId ? { profesorId } : {}) },
          include: {
            areaCurricular: {
              include: { competencias: { include: { capacidades: true } } },
            },
            profesor: { select: { name: true, apellidoPaterno: true } },
            evaluaciones: { where: { periodoId }, select: { id: true } },
          },
        },
      },
    });

    if (!seccion) return { error: "Sección no encontrada" };

    const paralelas = await prisma.nivelAcademico.findMany({
      where: {
        gradoId: seccion.gradoId,
        anioAcademico: seccion.anioAcademico,
        institucionId: seccion.institucionId,
        id: { not: seccion.id },
        activo: true,
      },
      select: { id: true, seccion: true, grado: { select: { nombre: true } } },
      orderBy: { seccion: "asc" },
    });

    const tipos = await prisma.tipoEvaluacion.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, codigo: true },
      orderBy: { createdAt: "asc" },
    });

    const nivelNorm = (seccion.nivel?.nombre || "").toUpperCase();
    const escalaRecomendada = nivelNorm.includes("SECUNDARIA")
      ? EscalaCalificacion.VIGESIMAL
      : EscalaCalificacion.LITERAL;

    const cursosMapeados: BatchPlanCourseItem[] = seccion.cursos.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      areaCurricularId: c.areaCurricularId,
      profesorNombre: c.profesor
        ? `${c.profesor.name} ${c.profesor.apellidoPaterno || ""}`.trim()
        : undefined,
      competencias: (c.areaCurricular?.competencias || []).map((comp) => ({
        id: comp.id,
        nombre: comp.nombre,
        capacidades: comp.capacidades.map((cap) => ({
          id: cap.id,
          nombre: cap.nombre,
        })),
      })),
      existingEvaluacionesCount: c.evaluaciones.length,
    }));

    return {
      data: serialize({
        seccion: {
          id: seccion.id,
          gradoNombre: seccion.grado?.nombre || "",
          seccion: seccion.seccion,
          nivelNombre: seccion.nivel?.nombre || "",
          escalaRecomendada,
        },
        cursos: cursosMapeados,
        seccionesParalelas: paralelas.map((p) => ({
          id: p.id,
          seccion: p.seccion,
          gradoNombre: p.grado?.nombre || "",
        })),
        tiposEvaluacion: tipos,
      }),
    };
  } catch (error) {
    console.error("Error fetching curricular plan:", error);
    return { error: "No se pudo obtener el plan curricular" };
  }
}

export async function generateBatchCnebEvaluationsAction(
  input: GenerateBatchInput,
): Promise<{ success?: string; count?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const {
      periodoId,
      cursosConCompetencias,
      tipoEvaluacionId,
      escala = EscalaCalificacion.LITERAL,
      replicateSectionIds = [],
      fecha,
    } = input;

    if (!periodoId || !cursosConCompetencias.length) {
      return { error: "Datos incompletos para generar las evaluaciones" };
    }

    let finalTipoId = tipoEvaluacionId;
    if (!finalTipoId) {
      const defaultTipo =
        (await prisma.tipoEvaluacion.findFirst({
          where: { codigo: "SUMA", activo: true },
        })) ||
        (await prisma.tipoEvaluacion.findFirst({ where: { activo: true } }));
      finalTipoId = defaultTipo?.id;
    }
    if (!finalTipoId) return { error: "No hay tipo de evaluación activo" };

    const evalDate = fecha ? new Date(fecha) : new Date();
    const sourceCourses = await prisma.curso.findMany({
      where: { id: { in: cursosConCompetencias.map((c) => c.cursoId) } },
      include: {
        areaCurricular: {
          include: { competencias: { include: { capacidades: true } } },
        },
      },
    });

    let targetCourses: any[] = [];
    if (replicateSectionIds.length > 0) {
      targetCourses = await prisma.curso.findMany({
        where: { nivelAcademicoId: { in: replicateSectionIds }, activo: true },
        select: { id: true, areaCurricularId: true, nombre: true, nivelAcademicoId: true },
      });
    }

    const recordsToCreate: any[] = [];

    for (const item of cursosConCompetencias) {
      const course = sourceCourses.find((c) => c.id === item.cursoId);
      if (!course) continue;

      const selectedComps = (course.areaCurricular?.competencias || []).filter(
        (comp) => item.competenciaIds.includes(comp.id),
      );
      if (!selectedComps.length) continue;

      const baseWeight = Math.floor(100 / selectedComps.length);
      const remainder = 100 - baseWeight * selectedComps.length;

      const addEvalRecords = (targetCourseId: string) => {
        selectedComps.forEach((comp, idx) => {
          recordsToCreate.push({
            nombre: `C${idx + 1}: ${comp.nombre}`,
            descripcion: `Evaluación oficial CNEB: ${comp.nombre}`,
            tipoEvaluacionId: finalTipoId!,
            fecha: evalDate,
            peso: idx === 0 ? baseWeight + remainder : baseWeight,
            notaMinima: escala === EscalaCalificacion.VIGESIMAL ? 11 : null,
            escalaCalificacion: escala,
            cursoId: targetCourseId,
            periodoId,
            capacidadId: comp.capacidades[0]?.id || null,
            activa: true,
            recuperable: false,
          });
        });
      };

      addEvalRecords(course.id);

      for (const targetSecId of replicateSectionIds) {
        const targetCourse = targetCourses.find(
          (tc) =>
            tc.nivelAcademicoId === targetSecId &&
            (tc.areaCurricularId === course.areaCurricularId ||
              tc.nombre.toLowerCase() === course.nombre.toLowerCase()),
        );
        if (targetCourse) addEvalRecords(targetCourse.id);
      }
    }

    if (!recordsToCreate.length) {
      return { error: "No se seleccionaron competencias para generar" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.evaluacion.createMany({ data: recordsToCreate });
    });

    revalidatePath("/evaluaciones");
    revalidatePath("/gestion/academico/siagie");

    return {
      success: `Se generaron exitosamente ${recordsToCreate.length} evaluaciones CNEB`,
      count: recordsToCreate.length,
    };
  } catch (error) {
    console.error("Error generating batch CNEB evaluations:", error);
    return { error: "Ocurrió un error al generar las evaluaciones" };
  }
}
