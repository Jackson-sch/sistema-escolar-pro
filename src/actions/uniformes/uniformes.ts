"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/storage";

export async function getUniformesAction(categoriaId?: string) {
  try {
    const uniforms = await prisma.uniforme.findMany({
      where: {
        activo: true,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: {
        categoria: true,
        variantes: {
          include: {
            sede: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });
    return { data: serialize(uniforms) };
  } catch (error) {
    console.error("Error fetching uniforms:", error);
    return { error: "No se pudieron obtener los uniformes" };
  }
}

export async function upsertUniformeAction(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const { id, variantes, ...rest } = data;
    let uniforme;

    if (id) {
      uniforme = await prisma.uniforme.update({
        where: { id },
        data: rest,
      });
    } else {
      uniforme = await prisma.uniforme.create({
        data: {
          ...rest,
          variantes: {
            create:
              variantes?.map((v: any) => ({
                talla: v.talla,
                precio: v.precio,
                stock: v.stock,
                sedeId: v.sedeId,
              })) || [],
          },
        },
      });
    }

    if (id && variantes) {
      const currentVariantes = await prisma.varianteUniforme.findMany({
        where: { uniformeId: id },
      });

      const incomingIds = new Set(
        variantes.flatMap((v: any) => (v.id ? [v.id] : [])),
      );
      const toDelete = currentVariantes.filter(
        (cv) => !incomingIds.has(cv.id),
      );

      if (toDelete.length > 0) {
        await prisma.varianteUniforme.deleteMany({
          where: { id: { in: toDelete.map((d) => d.id) } },
        });
      }

      for (const v of variantes) {
        if (v.id) {
          await prisma.varianteUniforme.update({
            where: { id: v.id },
            data: {
              talla: v.talla,
              precio: v.precio,
              stock: v.stock,
              sedeId: v.sedeId,
            },
          });
        } else {
          await prisma.varianteUniforme.upsert({
            where: {
              uniformeId_talla_sedeId: {
                uniformeId: id,
                talla: v.talla,
                sedeId: v.sedeId,
              },
            },
            update: {
              precio: v.precio,
              stock: v.stock,
            },
            create: {
              uniformeId: id,
              talla: v.talla,
              precio: v.precio,
              stock: v.stock,
              sedeId: v.sedeId,
            },
          });
        }
      }
    }

    revalidatePath("/uniformes");
    return { data: serialize(uniforme) };
  } catch (error) {
    console.error("Error upserting uniform:", error);
    return { error: "No se pudo guardar el uniforme" };
  }
}

export async function deleteUniformeAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const uniforme = await prisma.uniforme.findUnique({
      where: { id },
      select: { imagen: true },
    });

    if (!uniforme) {
      return { error: "Uniforme no encontrado" };
    }

    await prisma.uniforme.delete({
      where: { id },
    });

    if (uniforme.imagen) {
      await deleteFile(uniforme.imagen);
    }

    revalidatePath("/uniformes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting uniform:", error);
    return {
      error:
        "No se pudo eliminar el uniforme. Verifique que no tenga pedidos asociados.",
    };
  }
}
