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
 * Crea o actualiza un curso (Carga Horaria)
 */
export async function upsertCourseAction(values: any, id?: string) {
  try {
    if (id) {
      const course = await prisma.curso.update({
        where: { id },
        data: values
      })
      revalidatePath("/gestion/academico/carga-horaria")
      return { success: "Curso/Asignación actualizado", data: JSON.parse(JSON.stringify(course)) }
    } else {
      const course = await prisma.curso.create({
        data: values
      })
      revalidatePath("/gestion/academico/carga-horaria")
      return { success: "Docente asignado correctamente", data: JSON.parse(JSON.stringify(course)) }
    }
  } catch (error) {
    console.error("Error upserting course:", error)
    return { error: "No se pudo procesar la asignación del curso" }
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
