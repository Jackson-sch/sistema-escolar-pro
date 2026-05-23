"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPortalUniformesDataAction(padreId: string) {
  try {
    const [uniforms, categorias, sedes, relaciones] = await Promise.all([
      prisma.uniforme.findMany({
        where: { activo: true },
        include: {
          categoria: true,
          variantes: {
            include: { sede: true },
          },
          favoritos: {
            where: { userId: padreId },
            select: { id: true },
          },
          _count: {
            select: { favoritos: true },
          },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.categoriaUniforme.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.sede.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              image: true,
              nivelAcademico: {
                include: {
                  nivel: true,
                  grado: true,
                  sede: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const ventas = await prisma.ventaUniforme.findMany({
      where: { padreId },
      include: {
        estudiante: true,
        sede: true,
        detalles: {
          include: {
            variante: {
              include: { uniforme: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hijos = relaciones.map((r) => serialize(r.hijo));

    return {
      data: {
        uniforms: serialize(uniforms),
        categorias: serialize(categorias),
        sedes: serialize(sedes),
        hijos,
        ventas: serialize(ventas),
      },
    };
  } catch (error) {
    console.error("Error fetching portal uniform data:", error);
    return { error: "No se pudo cargar la información de uniformes" };
  }
}

export async function toggleFavoritoUniformeAction(
  userId: string,
  uniformeId: string,
) {
  try {
    const existing = await prisma.favoritoUniforme.findUnique({
      where: {
        userId_uniformeId: {
          userId,
          uniformeId,
        },
      },
    });

    if (existing) {
      await prisma.favoritoUniforme.delete({
        where: { id: existing.id },
      });
      revalidatePath("/portal/uniformes");
      return { data: { active: false } };
    } else {
      await prisma.favoritoUniforme.create({
        data: {
          userId,
          uniformeId,
        },
      });
      revalidatePath("/portal/uniformes");
      return { data: { active: true } };
    }
  } catch (error) {
    console.error("Error toggling uniform favorite:", error);
    return { error: "No se pudo actualizar favoritos" };
  }
}
