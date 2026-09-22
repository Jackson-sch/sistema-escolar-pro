"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Obtiene todas las áreas curriculares
 */
export async function getCurricularAreasAction(nivelId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }

    const where: any = {};
    if (nivelId) {
      where.OR = [{ nivelId }, { nivelId: null }];
    }

    // Si no es super_admin, limitar por institucionId
    if (session.user.role !== "super_admin" && session.user.institucionId) {
      where.institucionId = session.user.institucionId;
    }

    const areas = await prisma.areaCurricular.findMany({
      where,
      include: {
        nivel: true,
      },
      orderBy: {
        orden: "asc",
      },
    });
    return { data: serialize(areas) };
  } catch (error) {
    console.error("Error fetching areas:", error);
    return { error: "No se pudieron obtener las áreas curriculares" };
  }
}

/**
 * Obtiene la carga horaria (Cursos asignados)
 */
export async function getCoursesAction(filters?: {
  anioAcademico?: number;
  profesorId?: string;
  nivelId?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }

    const isProfessor = session.user.role === "profesor";
    const targetProfesorId = isProfessor ? session.user.id : filters?.profesorId;

    const teacherCondition = targetProfesorId
      ? {
          OR: [
            { profesorId: targetProfesorId },
            { nivelAcademico: { tutorId: targetProfesorId } },
          ],
        }
      : {};

    const where: any = {
      ...teacherCondition,
      anioAcademico: filters?.anioAcademico,
      nivelId: filters?.nivelId || undefined,
      activo: true,
    };

    // Si no es super_admin, limitar por institucionId
    if (session.user.role !== "super_admin" && session.user.institucionId) {
      where.institucionId = session.user.institucionId;
    }

    const courses = await prisma.curso.findMany({
      where,
      include: {
        areaCurricular: true,
        profesor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            image: true,
          },
        },
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { data: serialize(courses) };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { error: "No se pudo obtener la carga horaria" };
  }
}

/**
 * Crea o actualiza un área curricular
 */
export async function upsertAreaAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }

    const role = session.user.role;
    if (role !== "super_admin" && role !== "administrativo") {
      return { error: "No tienes permiso para realizar esta acción." };
    }

    const targetInstitucionId = session.user.institucionId;

    // Limpiar valores vacíos para campos opcionales/relaciones
    const cleanValues = {
      ...values,
      descripcion: values.descripcion || null,
      nivelId: values.nivelId === "" ? null : values.nivelId,
      color: values.color || "#3b82f6",
      icono: values.icono || null,
      creditos: values.creditos === 0 ? null : values.creditos,
      institucionId: targetInstitucionId || values.institucionId,
    };

    if (id) {
      // Verificar que el área pertenece a la misma institución si no es super_admin
      if (role !== "super_admin" && targetInstitucionId) {
        const existing = await prisma.areaCurricular.findFirst({
          where: { id, institucionId: targetInstitucionId },
        });
        if (!existing) {
          return { error: "Área curricular no encontrada o no tiene permisos." };
        }
      }

      const area = await prisma.areaCurricular.update({
        where: { id },
        data: cleanValues,
      });
      revalidatePath("/gestion/academico/areas");
      return {
        success: "Área curricular actualizada",
        data: serialize(area),
      };
    } else {
      const area = await prisma.areaCurricular.create({
        data: cleanValues,
      });
      revalidatePath("/gestion/academico/areas");
      return {
        success: "Área curricular creada",
        data: serialize(area),
      };
    }
  } catch (error) {
    console.error("Error upserting area:", error);
    return { error: "No se pudo procesar el área curricular" };
  }
}

/**
 * Crea o actualiza cursos (Carga Horaria)
 * Soporta creación múltiple para varias secciones
 */
export async function upsertCourseAction(values: any, id?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }

    const role = session.user.role;
    if (role !== "super_admin" && role !== "administrativo") {
      return { error: "No tienes permiso para realizar esta acción." };
    }

    const targetInstitucionId = session.user.institucionId;
    const { nivelAcademicoIds, ...courseData } = values;

    if (id) {
      // Verificar pertenencia si no es super_admin
      if (role !== "super_admin" && targetInstitucionId) {
        const existing = await prisma.curso.findFirst({
          where: { id, institucionId: targetInstitucionId },
        });
        if (!existing) {
          return { error: "Curso no encontrado o no tiene permisos." };
        }
      }

      // Si hay ID, es una actualización individual (usualmente desde la tabla)
      const updateData: any = {
        ...courseData,
        areaCurricular: { connect: { id: values.areaCurricularId } },
        nivelAcademico: {
          connect: { id: nivelAcademicoIds?.[0] || values.nivelAcademicoId },
        },
      };

      if (values.profesorId) {
        updateData.profesor = { connect: { id: values.profesorId } };
      } else {
        updateData.profesor = { disconnect: true };
      }

      const course = await prisma.curso.update({
        where: { id },
        data: updateData,
      });
      revalidatePath("/gestion/academico/carga-horaria");
      return {
        success: "Curso actualizado",
        data: serialize(course),
      };
    } else {
      // Creación múltiple
      const createdCourses = [];
      const levels = await prisma.nivelAcademico.findMany({
        where: { id: { in: nivelAcademicoIds } },
        select: { id: true, nivelId: true, gradoId: true, institucionId: true, tutorId: true },
      });

      const levelsMap = new Map(levels.map((l) => [l.id, l]));

      for (const nivelId of nivelAcademicoIds) {
        const nivel = levelsMap.get(nivelId);
        if (!nivel) continue;

        // Validar que el nivel pertenece a la institución del usuario administrativo
        if (role !== "super_admin" && targetInstitucionId && nivel.institucionId !== targetInstitucionId) {
          continue;
        }

        // Si la opción asignada correspondía al tutor del salón de origen o tutor por defecto,
        // asignar el tutor PROPIO de cada sección individual.
        let targetProfesorId = values.profesorId || null;
        if (values.isTutorDefault || (values.originTutorId && values.profesorId === values.originTutorId)) {
          targetProfesorId = nivel.tutorId || values.profesorId || null;
        }

        const createData: any = {
          nombre: courseData.nombre,
          codigo: courseData.codigo,
          descripcion: courseData.descripcion,
          anioAcademico: courseData.anioAcademico,
          horasSemanales: courseData.horasSemanales,
          creditos: courseData.creditos,
          activo: courseData.activo ?? true,
          areaCurricularId: values.areaCurricularId,
          nivelAcademicoId: nivelId,
          nivelId: nivel.nivelId,
          gradoId: nivel.gradoId,
          institucionId: targetInstitucionId || nivel.institucionId,
          profesorId: targetProfesorId,
        };

        const course = await prisma.curso.create({
          data: createData,
        });
        createdCourses.push(course);
      }

      revalidatePath("/gestion/academico/carga-horaria");
      return {
        success: `${createdCourses.length} asignaciones creadas correctamente`,
        data: serialize(createdCourses),
      };
    }
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `Ya existe un curso con el código "${values.codigo}" en una de las secciones seleccionadas para el año ${values.anioAcademico}.`,
      };
    }
    console.error("Error upserting course:", error);
    return { error: "No se pudo procesar la asignación del curso" };
  }
}

/**
 * Asigna un profesor a un curso específico
 */
export async function assignTeacherAction(
  courseId: string,
  profesorId: string | null,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }
    const role = session.user.role;
    if (role !== "super_admin" && role !== "administrativo") {
      return { error: "No tienes permiso para realizar esta acción." };
    }
    const targetInstitucionId = session.user.institucionId;

    if (role !== "super_admin" && targetInstitucionId) {
      const existing = await prisma.curso.findFirst({
        where: { id: courseId, institucionId: targetInstitucionId },
      });
      if (!existing) {
        return { error: "Curso no encontrado o no tiene permisos." };
      }
    }

    const course = await prisma.curso.update({
      where: { id: courseId },
      data: { profesorId },
    });
    revalidatePath("/gestion/academico/carga-horaria");
    revalidatePath("/gestion/academico/estructura");
    return {
      success: "Profesor asignado correctamente",
      data: serialize(course),
    };
  } catch (error) {
    console.error("Error assigning teacher:", error);
    return { error: "No se pudo asignar el profesor" };
  }
}

/**
 * Elimina un área curricular
 */
export async function deleteAreaAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }
    const role = session.user.role;
    if (role !== "super_admin" && role !== "administrativo") {
      return { error: "No tienes permiso para realizar esta acción." };
    }
    const targetInstitucionId = session.user.institucionId;

    const area = await prisma.areaCurricular.findUnique({
      where: { id },
      include: {
        _count: { select: { cursos: true } },
        competencias: {
          include: {
            capacidades: {
              include: {
                _count: { select: { evaluaciones: true } },
              },
            },
          },
        },
      },
    });

    if (!area) {
      return { error: "Área curricular no encontrada o no tiene permisos." };
    }

    if (role !== "super_admin" && targetInstitucionId && area.institucionId !== targetInstitucionId) {
      return { error: "No tiene permisos para eliminar esta área." };
    }

    // Si tiene cursos asignados, informar con precisión
    if (area._count.cursos > 0) {
      return {
        error: `No se puede eliminar: tiene ${area._count.cursos} curso(s) asignado(s). Transfiera los cursos a otra área primero.`,
      };
    }

    // Verificar si alguna capacidad tiene evaluaciones registradas
    const totalEvals = area.competencias.reduce(
      (sum, comp) =>
        sum +
        comp.capacidades.reduce((cSum, cap) => cSum + cap._count.evaluaciones, 0),
      0,
    );
    if (totalEvals > 0) {
      return {
        error: `No se puede eliminar: tiene ${totalEvals} evaluación(es) registrada(s) en sus competencias.`,
      };
    }

    // Borrado en cascada seguro: capacidades -> competencias -> área
    await prisma.$transaction(async (tx) => {
      for (const comp of area.competencias) {
        await tx.capacidad.deleteMany({
          where: { competenciaId: comp.id },
        });
      }
      await tx.competencia.deleteMany({
        where: { areaCurricularId: area.id },
      });
      await tx.areaCurricular.delete({
        where: { id: area.id },
      });
    });

    revalidatePath("/gestion/academico/areas");
    return { success: "Área curricular eliminada correctamente." };
  } catch (error) {
    console.error("Error al eliminar área curricular:", error);
    return {
      error: "Ocurrió un error al eliminar el área curricular.",
    };
  }
}

/**
 * Transfiere los cursos de un área origen a un área destino
 */
export async function transferAreaCoursesAction({
  sourceAreaId,
  targetAreaId,
}: {
  sourceAreaId: string;
  targetAreaId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado." };
    }
    const role = session.user.role;
    if (role !== "super_admin" && role !== "administrativo") {
      return { error: "No tiene permisos para realizar esta acción." };
    }

    const [source, target] = await Promise.all([
      prisma.areaCurricular.findUnique({ where: { id: sourceAreaId } }),
      prisma.areaCurricular.findUnique({ where: { id: targetAreaId } }),
    ]);

    if (!source || !target) {
      return { error: "Una de las áreas seleccionadas no existe." };
    }

    const updated = await prisma.curso.updateMany({
      where: { areaCurricularId: sourceAreaId },
      data: { areaCurricularId: targetAreaId },
    });

    revalidatePath("/gestion/academico/areas");
    revalidatePath("/gestion/academico/carga-horaria");
    return {
      success: `Se transfirieron ${updated.count} cursos exitosamente de "${source.nombre}" a "${target.nombre}".`,
    };
  } catch (error) {
    console.error("Error al transferir cursos:", error);
    return { error: "Error al transferir los cursos entre áreas." };
  }
}

/**
 * Elimina una asignación de curso (Carga Horaria)
 */
export async function deleteCourseAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }
    const role = session.user.role;
    if (role !== "super_admin" && role !== "administrativo") {
      return { error: "No tienes permiso para realizar esta acción." };
    }
    const targetInstitucionId = session.user.institucionId;

    if (role !== "super_admin" && targetInstitucionId) {
      const existing = await prisma.curso.findFirst({
        where: { id, institucionId: targetInstitucionId },
      });
      if (!existing) {
        return { error: "Curso no encontrado o no tiene permisos." };
      }
    }

    await prisma.curso.delete({
      where: { id },
    });
    revalidatePath("/gestion/academico/carga-horaria");
    return { success: "Asignación eliminada correctamente" };
  } catch (error) {
    return { error: "No se pudo eliminar la asignación" };
  }
}

/**
 * Obtiene las instituciones disponibles
 */
export async function getInstitucionesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Por favor inicie sesión." };
    }

    const instituciones = await prisma.institucionEducativa.findMany({
      select: {
        id: true,
        nombreInstitucion: true,
        cicloEscolarActual: true,
        codigoModular: true,
        dre: true,
        ugel: true,
        direccion: true,
        telefono: true,
        logo: true,
      },
    });
    return { data: serialize(instituciones) };
  } catch (error) {
    return { error: "Error al cargar instituciones" };
  }
}
