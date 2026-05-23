"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";

export async function getCategoriasUniformesAction() {
  try {
    const categorias = await prisma.categoriaUniforme.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return { data: serialize(categorias) };
  } catch (error) {
    console.error("Error fetching uniform categories:", error);
    return { error: "No se pudieron obtener las categorías" };
  }
}
