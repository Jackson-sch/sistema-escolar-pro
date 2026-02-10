"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Obtiene todas las áreas curriculares
 */
export async function getCurricularAreasAction() {
  try {
    const areas = await prisma.areaCurricular.findMany({
      include: {
        nivel: true,
      },
      orderBy: {
        orden: "asc"
      }
    })
    return { data: JSON.parse(JSON.stringify(areas)) }
  } catch (error) {
    console.error("Error fetching areas:", error)
    return { error: "No se pudieron obtener las áreas curriculares" }
  }
}

/**
 * Obtiene la carga horaria (Cursos asignados)
 */
export async function getCoursesAction(anio?: number) {
  try {
    const courses = await prisma.curso.findMany({
      where: anio ? { anioAcademico: anio } : undefined,
      include: {
        areaCurricular: true,
        profesor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        },
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return { data: JSON.parse(JSON.stringify(courses)) }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { error: "No se pudo obtener la carga horaria" }
  }
}


export async function upsertAreaAction(values: any, id?: string) {
  try {
    // Limpiar valores vacíos para campos opcionales/relaciones
    const cleanValues = {
      ...values,
      descripcion: values.descripcion || null,
      nivelId: values.nivelId === "" ? null : values.nivelId,
      color: values.color || "#3b82f6",
      creditos: values.creditos === 0 ? null : values.creditos
    }

    if (id) {
      const area = await prisma.areaCurricular.update({
        where: { id },
        data: cleanValues
      })
      revalidatePath("/gestion/academico/areas")
      return { success: "Área curricular actualizada", data: JSON.parse(JSON.stringify(area)) }
    } else {
      const area = await prisma.areaCurricular.create({
        data: cleanValues
      })
      revalidatePath("/gestion/academico/areas")
      return { success: "Área curricular creada", data: JSON.parse(JSON.stringify(area)) }
    }
  } catch (error) {
    console.error("Error upserting area:", error)
    return { error: "No se pudo procesar el área curricular" }
  }
}

/**
 * Crea o actualiza cursos (Carga Horaria)
 * Soporta creación múltiple para varias secciones
 */
export async function upsertCourseAction(values: any, id?: string) {
  try {
    const { nivelAcademicoIds, ...courseData } = values;

    if (id) {
      // Si hay ID, es una actualización individual (usualmente desde la tabla)
      const updateData: any = {
        ...courseData,
        areaCurricular: { connect: { id: values.areaCurricularId } },
        nivelAcademico: { connect: { id: nivelAcademicoIds?.[0] || values.nivelAcademicoId } },
      };

      if (values.profesorId) {
        updateData.profesor = { connect: { id: values.profesorId } };
      } else {
        updateData.profesor = { disconnect: true };
      }

      const course = await prisma.curso.update({
        where: { id },
        data: updateData
      })
      revalidatePath("/gestion/academico/carga-horaria")
      return { success: "Curso actualizado", data: JSON.parse(JSON.stringify(course)) }
    } else {
      // Creación múltiple
      const createdCourses = [];
      const levels = await prisma.nivelAcademico.findMany({
        where: { id: { in: nivelAcademicoIds } }
      });

      for (const nivelId of nivelAcademicoIds) {
        const nivel = levels.find(l => l.id === nivelId);
        if (!nivel) continue;

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
          institucionId: nivel.institucionId,
          profesorId: values.profesorId || null,
        };

        const course = await prisma.curso.create({
          data: createData
        });
        createdCourses.push(course);
      }

      revalidatePath("/gestion/academico/carga-horaria")
      return { 
        success: `${createdCourses.length} asignaciones creadas correctamente`, 
        data: JSON.parse(JSON.stringify(createdCourses)) 
      }
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: `Ya existe un curso con el código "${values.codigo}" en una de las secciones seleccionadas para el año ${values.anioAcademico}.` }
    }
    return { error: "No se pudo procesar la asignación del curso" }
  }
}

/**
 * Asigna un profesor a un curso específico
 */
export async function assignTeacherAction(courseId: string, profesorId: string) {
  try {
    const course = await prisma.curso.update({
      where: { id: courseId },
      data: { profesorId }
    })
    revalidatePath("/gestion/academico/carga-horaria")
    return { success: "Profesor asignado correctamente", data: JSON.parse(JSON.stringify(course)) }
  } catch (error) {
    console.error("Error assigning teacher:", error)
    return { error: "No se pudo asignar el profesor" }
  }
}

/**
 * Elimina un área curricular
 */
export async function deleteAreaAction(id: string) {
  try {
    await prisma.areaCurricular.delete({
      where: { id }
    })
    revalidatePath("/gestion/academico/areas")
    return { success: "Área eliminada correctamente" }
  } catch (error) {
    return { error: "No se pudo eliminar el área (verifique si tiene cursos asociados)" }
  }
}

/**
 * Elimina una asignación de curso (Carga Horaria)
 */
export async function deleteCourseAction(id: string) {
  try {
    await prisma.curso.delete({
      where: { id }
    })
    revalidatePath("/gestion/academico/carga-horaria")
    return { success: "Asignación eliminada correctamente" }
  } catch (error) {
    return { error: "No se pudo eliminar la asignación" }
  }
}

/**
 * Obtiene las instituciones disponibles
 */
export async function getInstitucionesAction() {
  try {
    const instituciones = await prisma.institucionEducativa.findMany({
      select: { id: true, nombreInstitucion: true, cicloEscolarActual: true }
    })
    return { data: JSON.parse(JSON.stringify(instituciones)) }
  } catch (error) {
    return { error: "Error al cargar instituciones" }
  }
}
