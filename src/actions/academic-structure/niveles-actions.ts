"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
const REVALIDATE_PATH = "/gestion/academico/estructura";

/**
 * Obtiene los niveles de la institución
 */
export async function getNivelesAction(
  targetInstitucionId?: string,
  targetSedeId?: string,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const institucionId = targetInstitucionId || session.user.institucionId;

    const whereCondition: any = {};
    if (institucionId) whereCondition.institucionId = institucionId;
    if (targetSedeId) {
      whereCondition.nivelesAcademicos = {
        some: { sedeId: targetSedeId },
      };
    }

    const niveles = await prisma.nivel.findMany({
      where:
        Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
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
