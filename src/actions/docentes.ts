"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveSedeId } from "@/actions/active-sede";

export async function getDirectorioDocentesAction() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        error: "No autorizado",
        status: 401,
      };
    }

    let targetInstitucionId = session.user.institucionId;
    if (!targetInstitucionId && session.user.role === "padre") {
      const relacion = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: session.user.id },
        include: { hijo: { select: { institucionId: true } } },
      });
      targetInstitucionId = relacion?.hijo?.institucionId as string | undefined;
    }

    const activeSedeId = await getActiveSedeId();
    const whereCondition: any = {
      institucionId: (targetInstitucionId as string | undefined) ?? undefined,
      role: "profesor",
      estado: {
        esActivo: true,
      },
    };

    if (activeSedeId) {
      whereCondition.OR = [
        { cursosImpartidos: { some: { nivelAcademico: { sedeId: activeSedeId } } } },
        { nivelesTutoria: { some: { sedeId: activeSedeId } } },
      ];
    }

    // Obtener los docentes de la misma institución educativa del usuario actual.
    // Solo aquellos con el role "profesor" y listando sus campos públicos relevantes
    const docentes = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        image: true,
        email: true,
        especialidad: true,
        cargo: {
          select: { nombre: true },
        },
        telefono: true,
        cursosImpartidos: {
          select: {
            nombre: true,
            nivelAcademico: {
              select: {
                grado: { select: { nombre: true } },
                seccion: true,
              },
            },
          },
        },
      },
      orderBy: [{ apellidoPaterno: "asc" }, { name: "asc" }],
    });

    return {
      data: docentes,
      status: 200,
    };
  } catch (error) {
    console.error("[getDirectorioDocentesAction]", error);
    return {
      error: "Error interno del servidor",
      status: 500,
    };
  }
}
