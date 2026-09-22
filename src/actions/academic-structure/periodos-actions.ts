"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/gestion/academico/estructura";

/**
 * Obtiene los años académicos únicos registrados en las secciones
 */
export async function getAniosAcademicosAction() {
  try {
    const anios = await prisma.nivelAcademico.findMany({
      select: { anioAcademico: true },
      distinct: ["anioAcademico"],
      orderBy: { anioAcademico: "desc" },
    });
    return { data: anios.map((a) => a.anioAcademico) };
  } catch {
    return { error: "Error al cargar años académicos" };
  }
}

/**
 * Obtiene los tutores disponibles (profesores)
 */
export async function getTutoresAction() {
  try {
    const tutores = await prisma.user.findMany({
      where: {
        role: { in: ["profesor", "administrativo", "super_admin"] },
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        image: true,
      },
      orderBy: { apellidoPaterno: "asc" },
    });
    return { data: serialize(tutores) };
  } catch {
    return { error: "Error al cargar tutores" };
  }
}

/**
 * Obtiene los periodos académicos de un año específico
 */
export async function getPeriodosByAnioAction(anio: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const periodos = await prisma.periodoAcademico.findMany({
      where: {
        anioEscolar: anio,
        institucionId: session.user.institucionId || undefined,
      },
      orderBy: { numero: "asc" },
    });
    return { data: serialize(periodos) };
  } catch (error) {
    console.error("Error fetching periodos:", error);
    return { error: "No se pudieron obtener los periodos" };
  }
}

/**
 * Clona la estructura de secciones de un año a otro
 */
export async function cloneAcademicStructureAction(
  fromYear: number,
  toYear: number,
  institucionId: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const existingToYear = await prisma.nivelAcademico.count({
      where: {
        anioAcademico: toYear,
        institucionId,
      },
    });

    if (existingToYear > 0) {
      return {
        error: `Ya existen secciones creadas para el año ${toYear}. No se puede clonar sobre datos existentes.`,
      };
    }

    const sourceSections = await prisma.nivelAcademico.findMany({
      where: {
        anioAcademico: fromYear,
        institucionId,
      },
      include: {
        cursos: {
          where: { activo: true },
        },
      },
    });

    if (sourceSections.length === 0) {
      return {
        error: `No se encontraron secciones en el año ${fromYear} para clonar.`,
      };
    }

    let totalCursosClonados = 0;

    await prisma.$transaction(async (tx) => {
      for (const s of sourceSections) {
        const newSection = await tx.nivelAcademico.create({
          data: {
            seccion: s.seccion,
            descripcion: s.descripcion,
            capacidad: s.capacidad,
            capacidadMaxima: s.capacidadMaxima,
            aulaAsignada: s.aulaAsignada,
            nivelId: s.nivelId,
            gradoId: s.gradoId,
            tutorId: null, // El tutor se reasigna para el nuevo ciclo
            institucionId: s.institucionId,
            sedeId: s.sedeId,
            anioAcademico: toYear,
            activo: true,
            turno: s.turno,
            color: s.color,
          },
        });

        // Clonar cursos del aula
        if (s.cursos && s.cursos.length > 0) {
          for (const curso of s.cursos) {
            const baseCodigo = curso.codigo.replace(new RegExp(`-${fromYear}$`), "");
            const newCodigo = `${baseCodigo}-${s.seccion}-${toYear}`;

            await tx.curso.create({
              data: {
                nombre: curso.nombre,
                codigo: newCodigo,
                descripcion: curso.descripcion,
                anioAcademico: toYear,
                horasSemanales: curso.horasSemanales,
                creditos: curso.creditos,
                areaCurricularId: curso.areaCurricularId,
                nivelAcademicoId: newSection.id,
                gradoId: s.gradoId,
                nivelId: s.nivelId,
                institucionId: s.institucionId,
                alcance: curso.alcance,
                activo: true,
                profesorId: null, // Docente a designar en el nuevo año
              },
            });
            totalCursosClonados++;
          }
        }
      }
    });

    revalidatePath(REVALIDATE_PATH);
    revalidatePath("/gestion/academico/carga-horaria");
    return {
      success: `Se clonaron ${sourceSections.length} secciones y ${totalCursosClonados} cursos al ciclo ${toYear} con éxito.`,
    };
  } catch (error) {
    console.error("Error cloning academic structure:", error);
    return { error: "Ocurrió un error al clonar la estructura académica." };
  }
}
