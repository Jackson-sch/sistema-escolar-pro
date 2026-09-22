"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/gestion/academico/estructura";

/**
 * Obtiene las secciones (NivelAcademico), opcionalmente filtradas
 */
export async function getSeccionesAction(filters?: {
  gradoId?: string;
  anioAcademico?: number;
  profesorId?: string;
  institucionId?: string;
}) {
  try {
    const session = await auth();
    const institucionId = filters?.institucionId || session?.user?.institucionId || undefined;

    const secciones = await prisma.nivelAcademico.findMany({
      where: {
        gradoId: filters?.gradoId,
        anioAcademico: filters?.anioAcademico,
        institucionId,
        ...(filters?.profesorId
          ? {
              cursos: {
                some: {
                  profesorId: filters.profesorId,
                  activo: true,
                },
              },
            }
          : {}),
      },
      include: {
        nivel: { select: { id: true, nombre: true } },
        grado: {
          select: { id: true, nombre: true, codigo: true, nivelId: true },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            image: true,
          },
        },
        sede: { select: { id: true, nombre: true } },
        cursos: {
          where: { activo: true },
          include: {
            profesor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                image: true,
              },
            },
            areaCurricular: { select: { id: true, nombre: true, color: true } },
          },
        },
      },
      orderBy: [
        { nivel: { nombre: "asc" } },
        { grado: { orden: "asc" } },
        { seccion: "asc" },
      ],
    });

    const counts = await prisma.matricula.groupBy({
      by: ["nivelAcademicoId"],
      where: {
        anioAcademico: filters?.anioAcademico,
        estado: "activo",
      },
      _count: {
        _all: true,
      },
    });

    const countMap = new Map(
      counts.map((c) => [c.nivelAcademicoId, c._count._all]),
    );

    const data = secciones.map((s) => ({
      ...s,
      _count: {
        matriculas: countMap.get(s.id) || 0,
      },
    }));

    return { data: serialize(data) };
  } catch (error) {
    console.error("Error fetching secciones:", error);
    return { error: "No se pudieron obtener las secciones" };
  }
}

/**
 * Crea o actualiza una sección (NivelAcademico)
 */
export async function upsertSeccionAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    if (values.gradoId && !values.nivelId) {
      const grado = await prisma.grado.findUnique({
        where: { id: values.gradoId },
        select: { nivelId: true },
      });
      if (grado) {
        values.nivelId = grado.nivelId;
      }
    }

    if (id) {
      const seccion = await prisma.nivelAcademico.update({
        where: { id },
        data: values,
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Sección actualizada",
        data: serialize(seccion),
      };
    } else {
      const seccion = await prisma.nivelAcademico.create({
        data: values,
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Sección creada",
        data: serialize(seccion),
      };
    }
  } catch (error: any) {
    console.error("Error upserting seccion:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe esta sección para el grado y año académico" };
    }
    return { error: "No se pudo procesar la sección" };
  }
}

/**
 * Wizard Atómico: Crea una nueva sección con todos sus cursos y docentes asignados en 1 sola transacción
 */
export async function createFullSectionWizardAction(values: {
  seccionData: {
    gradoId: string;
    seccion: string;
    turno?: string;
    capacidad?: number;
    aulaAsignada?: string;
    tutorId?: string | null;
    anioAcademico: number;
    institucionId: string;
  };
  cursosData: Array<{
    nombre: string;
    codigo: string;
    areaCurricularId: string;
    horasSemanales: number;
    profesorId?: string | null;
  }>;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const grado = await prisma.grado.findUnique({
      where: { id: values.seccionData.gradoId },
      select: { nivelId: true },
    });

    if (!grado) {
      return { error: "Grado no encontrado" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const seccion = await tx.nivelAcademico.create({
        data: {
          ...values.seccionData,
          nivelId: grado.nivelId,
        } as any,
      });

      const cursosCreados = await Promise.all(
        values.cursosData.map((curso) =>
          tx.curso.create({
            data: {
              nombre: curso.nombre,
              codigo: curso.codigo,
              areaCurricularId: curso.areaCurricularId,
              horasSemanales: curso.horasSemanales || 3,
              profesorId: curso.profesorId || values.seccionData.tutorId || null,
              nivelAcademicoId: seccion.id,
              nivelId: grado.nivelId,
              gradoId: values.seccionData.gradoId,
              anioAcademico: values.seccionData.anioAcademico,
              institucionId: values.seccionData.institucionId,
            },
          })
        )
      );

      return { seccion, cursos: cursosCreados };
    });

    revalidatePath("/gestion/academico/estructura");
    revalidatePath("/gestion/academico/carga-horaria");

    return {
      success: `¡Sección "${result.seccion.seccion}" creada exitosamente con ${result.cursos.length} cursos configurados!`,
      data: serialize(result),
    };
  } catch (error: any) {
    console.error("Error en wizard de creación de sección:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe esta sección para el grado y año académico." };
    }
    return { error: "No se pudo crear la sección completa." };
  }
}

/**
 * Elimina una sección
 */
export async function deleteSeccionAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const seccion = await prisma.nivelAcademico.findUnique({
      where: { id },
      include: { _count: { select: { matriculas: true, students: true } } },
    });

    if (
      seccion &&
      (seccion._count.matriculas > 0 || seccion._count.students > 0)
    ) {
      return {
        error: "No se puede eliminar porque tiene estudiantes matriculados",
      };
    }

    await prisma.nivelAcademico.delete({ where: { id } });
    revalidatePath(REVALIDATE_PATH);
    return { success: "Sección eliminada" };
  } catch (error) {
    console.error("Error deleting seccion:", error);
    return { error: "No se pudo eliminar la sección" };
  }
}

/**
 * Asigna un tutor a una sección de forma rápida
 */
export async function assignTutorAction(
  seccionId: string,
  tutorId: string | null,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const currentSection = await prisma.nivelAcademico.findUnique({
      where: { id: seccionId },
      select: { tutorId: true },
    });

    const oldTutorId = currentSection?.tutorId;

    await prisma.nivelAcademico.update({
      where: { id: seccionId },
      data: { tutorId: tutorId || null },
    });

    if (tutorId) {
      await prisma.curso.updateMany({
        where: {
          nivelAcademicoId: seccionId,
          OR: [
            { profesorId: null },
            ...(oldTutorId ? [{ profesorId: oldTutorId }] : []),
          ],
        },
        data: {
          profesorId: tutorId,
        },
      });
    } else if (oldTutorId) {
      await prisma.curso.updateMany({
        where: {
          nivelAcademicoId: seccionId,
          profesorId: oldTutorId,
        },
        data: {
          profesorId: null,
        },
      });
    }

    revalidatePath("/gestion/academico/estructura");
    revalidatePath("/gestion/academico/carga-horaria");
    revalidatePath("/dashboard");

    return {
      success: tutorId
        ? "Tutor asignado y sincronizado con los cursos del aula"
        : "Tutor removido y cursos del aula desasignados",
    };
  } catch (error) {
    console.error("Error assigning tutor:", error);
    return { error: "No se pudo asignar el tutor" };
  }
}

/**
 * Obtiene los estudiantes matriculados en una sección
 */
export async function getStudentsInSeccionAction(nivelAcademicoId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const students = await prisma.user.findMany({
      where: {
        role: "estudiante",
        institucionId: session.user.institucionId || undefined,
        OR: [
          { nivelAcademicoId },
          {
            matriculas: {
              some: {
                nivelAcademicoId,
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
        dni: true,
      },
      orderBy: {
        apellidoPaterno: "asc",
      },
    });
    return { data: serialize(students) };
  } catch (error) {
    console.error("Error fetching students in seccion:", error);
    return { error: "No se pudieron obtener los estudiantes" };
  }
}
