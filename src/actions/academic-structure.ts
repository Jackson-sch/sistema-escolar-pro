"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/gestion/academico/estructura";

// ==================== NIVELES ====================

/**
 * Obtiene los niveles de la institución
 */
import { getActiveSedeId } from "@/actions/active-sede";

export async function getNivelesAction(targetInstitucionId?: string, targetSedeId?: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId || targetInstitucionId;
    const activeSedeId = targetSedeId || (await getActiveSedeId());

    const whereCondition: any = {};
    if (institucionId) whereCondition.institucionId = institucionId;
    if (activeSedeId) whereCondition.sedeId = activeSedeId;

    const niveles = await prisma.nivel.findMany({
      where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      include: {
        _count: { select: { grados: true } },
      },
      orderBy: { nombre: "asc" },
    });
    return { data: serialize(niveles) };
  } catch (error) {
    console.error("Error fetching niveles:", error);
    return { error: "No se pudieron obtener los niveles" };
  }
}

/**
 * Crea o actualiza un nivel
 */
export async function upsertNivelAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    if (!values.nombre || values.nombre.trim() === "") {
      return { error: "El nombre del nivel es requerido" };
    }
    if (id) {
      const nivel = await prisma.nivel.update({
        where: { id },
        data: values,
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Nivel actualizado",
        data: serialize(nivel),
      };
    } else {
      const nivel = await prisma.nivel.create({
        data: values,
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Nivel creado",
        data: serialize(nivel),
      };
    }
  } catch (error: any) {
    console.error("Error upserting nivel:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe un nivel con ese nombre" };
    }
    return { error: "No se pudo procesar el nivel" };
  }
}

/**
 * Elimina un nivel
 */
export async function deleteNivelAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    await prisma.nivel.delete({ where: { id } });
    revalidatePath(REVALIDATE_PATH);
    return { success: "Nivel eliminado" };
  } catch (error: any) {
    console.error("Error deleting nivel:", error);
    if (error.code === "P2003") {
      return { error: "No se puede eliminar porque tiene grados asociados" };
    }
    return { error: "No se pudo eliminar el nivel" };
  }
}

// ==================== GRADOS ====================

/**
 * Obtiene los grados, opcionalmente filtrados por nivel o profesor
 */
export async function getGradosAction(nivelId?: string, profesorId?: string) {
  try {
    const grados = await prisma.grado.findMany({
      where: {
        nivelId: nivelId || undefined,
        ...(profesorId
          ? {
              nivelesAcademicos: {
                some: {
                  cursos: {
                    some: {
                      profesorId,
                      activo: true,
                    },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        nivel: { select: { nombre: true } },
        _count: { select: { nivelesAcademicos: true } },
      },
      orderBy: [{ nivel: { nombre: "asc" } }, { orden: "asc" }],
    });
    return { data: serialize(grados) };
  } catch (error) {
    console.error("Error fetching grados:", error);
    return { error: "No se pudieron obtener los grados" };
  }
}

/**
 * Crea o actualiza un grado
 */
export async function upsertGradoAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    if (!values.nivelId) return { error: "Debe seleccionar un nivel" };
    if (!values.nombre || values.nombre.trim() === "")
      return { error: "El nombre es requerido" };
    if (!values.codigo || values.codigo.trim() === "")
      return { error: "El código es requerido" };

    if (id) {
      const grado = await prisma.grado.update({
        where: { id },
        data: values,
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Grado actualizado",
        data: serialize(grado),
      };
    } else {
      const grado = await prisma.grado.create({
        data: values,
      });
      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Grado creado",
        data: serialize(grado),
      };
    }
  } catch (error: any) {
    console.error("Error upserting grado:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe un grado con ese código en el nivel" };
    }
    return { error: "No se pudo procesar el grado" };
  }
}

/**
 * Elimina un grado
 */
export async function deleteGradoAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    await prisma.grado.delete({ where: { id } });
    revalidatePath(REVALIDATE_PATH);
    return { success: "Grado eliminado" };
  } catch (error: any) {
    console.error("Error deleting grado:", error);
    if (error.code === "P2003") {
      return { error: "No se puede eliminar porque tiene secciones asociadas" };
    }
    return { error: "No se pudo eliminar el grado" };
  }
}

// ==================== SECCIONES (NivelAcademico) ====================

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
    const secciones = await prisma.nivelAcademico.findMany({
      where: {
        gradoId: filters?.gradoId,
        anioAcademico: filters?.anioAcademico,
        institucionId: filters?.institucionId,
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
        grado: { select: { id: true, nombre: true, codigo: true, nivelId: true } },
        tutor: { select: { id: true, name: true, apellidoPaterno: true, apellidoMaterno: true, image: true } },
        sede: { select: { id: true, nombre: true } },
        cursos: {
          where: { activo: true },
          include: {
            profesor: { select: { id: true, name: true, apellidoPaterno: true, apellidoMaterno: true, image: true } },
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

    // Obtener conteos de matrículas filtrados por año y estado para cada sección
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

    // Obtener el nivelId del grado seleccionado
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

      const cursosCreados = [];
      for (const curso of values.cursosData) {
        const nuevoCurso = await tx.curso.create({
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
        });
        cursosCreados.push(nuevoCurso);
      }

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

    // Verificar si tiene estudiantes matriculados
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
export async function assignTutorAction(seccionId: string, tutorId: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    // 1. Obtener la sección y el tutor previo antes de la actualización
    const currentSection = await prisma.nivelAcademico.findUnique({
      where: { id: seccionId },
      select: { tutorId: true },
    });

    const oldTutorId = currentSection?.tutorId;

    // 2. Actualizar el tutor en la sección
    await prisma.nivelAcademico.update({
      where: { id: seccionId },
      data: { tutorId: tutorId || null },
    });

    // 3. Sincronizar los cursos del aula
    if (tutorId) {
      // Al cambiar o asignar nuevo tutor: actualizar los cursos que tenían al tutor anterior o estaban sin docente
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
      // Al remover el tutor: desasignar los cursos que pertenecían a ese tutor anterior
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
  } catch (error) {
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
  } catch (error) {
    return { error: "Error al cargar tutores" };
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
export async function cloneAcademicStructureAction(fromYear: number, toYear: number, institucionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    // 1. Verificar si ya existen secciones para el año destino
    const existingToYear = await prisma.nivelAcademico.count({
      where: { 
        anioAcademico: toYear,
        institucionId
      }
    });

    if (existingToYear > 0) {
      return { error: `Ya existen secciones creadas para el año ${toYear}. No se puede clonar sobre datos existentes.` };
    }

    // 2. Obtener todas las secciones del año origen
    const sourceSections = await prisma.nivelAcademico.findMany({
      where: { 
        anioAcademico: fromYear,
        institucionId
      }
    });

    if (sourceSections.length === 0) {
      return { error: `No se encontraron secciones en el año ${fromYear} para clonar.` };
    }

    // 3. Crear las nuevas secciones
    const newSectionsData = sourceSections.map(s => ({
      seccion: s.seccion,
      descripcion: s.descripcion,
      capacidad: s.capacidad,
      capacidadMaxima: s.capacidadMaxima,
      aulaAsignada: s.aulaAsignada,
      nivelId: s.nivelId,
      gradoId: s.gradoId,
      tutorId: null, // Wipe tutor as it usually changes
      institucionId: s.institucionId,
      sedeId: s.sedeId,
      anioAcademico: toYear,
      activo: true,
      turno: s.turno,
      color: s.color,
    }));

    await prisma.nivelAcademico.createMany({
      data: newSectionsData
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: `Se clonaron ${newSectionsData.length} secciones al año ${toYear} con éxito.` };

  } catch (error) {
    console.error("Error cloning academic structure:", error);
    return { error: "Ocurrió un error al clonar la estructura académica." };
  }
}
