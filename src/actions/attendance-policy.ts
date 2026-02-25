"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Turno } from "../../prisma/client";

export async function getPoliticasAsistenciaAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { institucionId: true },
    });

    if (!user?.institucionId) return { error: "Institución no encontrada" };

    const politicas = await prisma.politicaAsistencia.findMany({
      where: { institucionId: user.institucionId },
      include: {
        nivel: {
          select: { nombre: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { data: politicas };
  } catch (error) {
    console.error("Error fetching politicas:", error);
    return { error: "No se pudieron obtener las políticas" };
  }
}

export async function savePoliticaAsistenciaAction(data: {
  id?: string;
  nombre: string;
  nivelId?: string | null;
  turno?: Turno | null;
  horaEntrada: string;
  horaSalida: string;
  tolerancia: number;
  activo: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { institucionId: true },
    });

    if (!user?.institucionId) return { error: "Institución no encontrada" };

    const payload = {
      nombre: data.nombre,
      nivelId: data.nivelId || null,
      turno: data.turno || null,
      horaEntrada: data.horaEntrada,
      horaSalida: data.horaSalida,
      tolerancia: data.tolerancia,
      activo: data.activo,
      institucionId: user.institucionId,
    };

    if (data.id) {
      await prisma.politicaAsistencia.update({
        where: { id: data.id },
        data: payload,
      });
    } else {
      await prisma.politicaAsistencia.create({
        data: payload,
      });
    }

    revalidatePath("/asistencia");
    return { success: true };
  } catch (error: any) {
    console.error("DETAILED SAVE ERROR:", error);
    // Solo devolvemos mensaje detallado si es un error conocido de Prisma o validación
    let errorMsg = "No se pudo guardar la política";
    if (error.code === "P2002")
      errorMsg = "Ya existe una política con este nombre";
    if (error.message?.includes("foreign key"))
      errorMsg = "Error de referencia: Verifique el nivel";

    return { error: `${errorMsg} (${error.message || ""})` };
  }
}

export async function deletePoliticaAsistenciaAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    await prisma.politicaAsistencia.delete({
      where: { id },
    });

    revalidatePath("/asistencia");
    return { success: true };
  } catch (error) {
    console.error("Error deleting politica:", error);
    return { error: "No se pudo eliminar la política" };
  }
}
