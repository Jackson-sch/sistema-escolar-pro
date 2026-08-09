"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { achievementSchema, AchievementValues } from "@/lib/validations/achievement";

/**
 * Registra un nuevo logro para un estudiante
 */
export async function createAchievementAction(studentId: string, values: AchievementValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const validatedFields = achievementSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Datos inválidos" };
    }

    const achievement = await prisma.logro.create({
      data: {
        ...validatedFields.data,
        estudianteId: studentId,
      },
    });

    revalidatePath(`/gestion/estudiantes`);
    return { success: "Logro registrado correctamente", data: serialize(achievement) };
  } catch (error) {
    console.error("Error creating achievement:", error);
    return { error: "No se pudo registrar el logro" };
  }
}

/**
 * Obtiene los logros de un estudiante
 */
export async function getStudentAchievementsAction(studentId: string) {
  try {
    const achievements = await prisma.logro.findMany({
      where: { estudianteId: studentId },
      orderBy: { fecha: "desc" },
    });

    return { data: serialize(achievements) };
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return { error: "No se pudieron cargar los logros" };
  }
}

/**
 * Elimina un logro
 */
export async function deleteAchievementAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    await prisma.logro.delete({
      where: { id },
    });

    revalidatePath(`/gestion/estudiantes`);
    return { success: "Logro eliminado correctamente" };
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return { error: "No se pudo eliminar el logro" };
  }
}
