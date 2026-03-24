"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDirectorioDocentesAction() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        error: "No autorizado",
        status: 401,
      };
    }

    // Buscamos a los profesores (si el padre y todos los colegios son unívocos, esto es suficiente)
    // De haber multi-institución, podríamos extraerlo del padreTutor->relacionFamiliar->estudiante->institucionId
    // Procedemos a buscar el ID usando los hijos si es necesario o un fallback simple.

    let targetInstitucionId = session.user.institucionId;
    if (!targetInstitucionId && session.user.role === "padre") {
      const relacion = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: session.user.id },
        include: { hijo: { select: { institucionId: true } } },
      });
      targetInstitucionId = relacion?.hijo?.institucionId as string | undefined;
    }

    // Obtener los docentes de la misma institución educativa del usuario actual.
    // Solo aquellos con el role "profesor" y listando sus campos públicos relevantes
    const docentes = await prisma.user.findMany({
      where: {
        institucionId: (targetInstitucionId as string | undefined) ?? undefined,
        role: "profesor",
        estado: {
          esActivo: true,
        },
      },
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
