"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getTodasLasVariantesAction(filters?: {
  sedeId?: string;
  categoriaId?: string;
}) {
  try {
    const variantes = await prisma.varianteUniforme.findMany({
      where: {
        ...(filters?.sedeId ? { sedeId: filters.sedeId } : {}),
        ...(filters?.categoriaId
          ? { uniforme: { categoriaId: filters.categoriaId } }
          : {}),
      },
      include: {
        sede: true,
        uniforme: {
          include: {
            categoria: true,
          },
        },
      },
      orderBy: [{ uniforme: { nombre: "asc" } }, { talla: "asc" }],
    });
    return { data: serialize(variantes) };
  } catch (error) {
    console.error("Error fetching all variants:", error);
    return { error: "No se pudieron obtener las variantes de inventario" };
  }
}

export async function registrarMovimientoInventarioAction(data: {
  varianteId: string;
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
  cantidad: number;
  motivo?: string;
  referencia?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const movimiento = await tx.movimientoInventario.create({
        data,
      });

      const factor = data.tipo === "ENTRADA" ? 1 : -1;
      const variante = await tx.varianteUniforme.update({
        where: { id: data.varianteId },
        data: {
          stock: {
            increment: data.cantidad * (data.tipo === "AJUSTE" ? 0 : factor),
            ...(data.tipo === "AJUSTE" ? { set: data.cantidad } : {}),
          },
        },
      });

      return { movimiento, variante };
    });

    revalidatePath("/uniformes");
    return { data: serialize(result) };
  } catch (error) {
    console.error("Error recording inventory movement:", error);
    return { error: "No se pudo registrar el movimiento de inventario" };
  }
}
