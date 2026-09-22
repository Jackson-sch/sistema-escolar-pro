"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/gestion/academico/estructura";

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
