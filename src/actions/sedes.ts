"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const REVALIDATE_PATH = "/configuracion/institucion";

const SedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.email("Email inválido").optional().or(z.literal("")),
  director: z.string().optional(),
  codigoIdentifier: z.string().optional(),
  logo: z.string().optional(),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  activo: z.boolean().optional().default(true),
});

export async function getSedesAction() {
  try {
    const institucion = await prisma.institucionEducativa.findFirst();

    if (!institucion) {
      return { error: "No se encontró ninguna institución configurada" };
    }

    const sedes = await prisma.sede.findMany({
      where: {
        institucionId: institucion.id,
        activo: true,
      },
      orderBy: [
        { esPrincipal: "desc" },
        { nombre: "asc" },
      ],
      include: {
        nivelesAcademicos: {
          select: {
            nivel: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    return { data: sedes };
  } catch (error) {
    console.error("Error fetching sedes:", error);
    return { error: "No se pudieron obtener las sedes" };
  }
}

export async function createSedeAction(values: z.infer<typeof SedeSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const validatedFields = SedeSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Campos inválidos" };
    }

    const institucion = await prisma.institucionEducativa.findFirst();
    if (!institucion) {
      return { error: "No se encontró la institución principal" };
    }

    const { nombre } = validatedFields.data;

    const existingSede = await prisma.sede.findFirst({
      where: {
        institucionId: institucion.id,
        nombre: {
          equals: nombre,
          mode: "insensitive",
        },
        activo: true,
      },
    });

    if (existingSede) {
      return { error: "Ya existe una sede con este nombre" };
    }

    await prisma.sede.create({
      data: {
        ...validatedFields.data,
        institucionId: institucion.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: "Sede creada correctamente" };
  } catch (error: any) {
    console.error("Error creating sede:", error);
    return { error: error.message || "Error al crear la sede" };
  }
}

export async function updateSedeAction(
  id: string,
  values: z.infer<typeof SedeSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const validatedFields = SedeSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Campos inválidos" };
    }

    const existing = await prisma.sede.findUnique({ where: { id } });

    await prisma.sede.update({
      where: { id },
      data: {
        ...validatedFields.data,
        esPrincipal: existing?.esPrincipal ?? false,
      },
    });

    if (existing?.esPrincipal && existing.institucionId) {
      await prisma.institucionEducativa.update({
        where: { id: existing.institucionId },
        data: {
          nombreInstitucion: validatedFields.data.nombre,
          direccion: validatedFields.data.direccion || undefined,
          telefono: validatedFields.data.telefono || undefined,
          email: validatedFields.data.email || undefined,
          logo: validatedFields.data.logo || undefined,
        },
      });
    }

    revalidatePath(REVALIDATE_PATH);
    return { success: "Sede actualizada correctamente" };
  } catch (error: any) {
    console.error("Error updating sede:", error);
    return {
      error: `Error al actualizar la sede: ${error.message || "Error desconocido"}`,
    };
  }
}

export async function setSedePrincipalAction(sedeId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const targetSede = await prisma.sede.findUnique({ where: { id: sedeId } });
    if (!targetSede) {
      return { error: "Sede no encontrada" };
    }

    // Desmarcar todas las sedes como principal
    await prisma.sede.updateMany({
      where: { institucionId: targetSede.institucionId },
      data: { esPrincipal: false },
    });

    // Marcar la sede seleccionada como principal
    await prisma.sede.update({
      where: { id: sedeId },
      data: { esPrincipal: true, activo: true },
    });

    // Sincronizar datos principales con la institución
    if (targetSede.institucionId) {
      await prisma.institucionEducativa.update({
        where: { id: targetSede.institucionId },
        data: {
          nombreInstitucion: targetSede.nombre,
          direccion: targetSede.direccion || undefined,
          telefono: targetSede.telefono || undefined,
          email: targetSede.email || undefined,
          logo: targetSede.logo || undefined,
        },
      });
    }

    revalidatePath(REVALIDATE_PATH);
    return { success: `"${targetSede.nombre}" es ahora la Sede Principal` };
  } catch (error: any) {
    console.error("Error setting sede principal:", error);
    return { error: "Error al marcar la sede como principal" };
  }
}

export async function deleteSedeAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const sede = await prisma.sede.findUnique({
      where: { id },
      include: {
        _count: {
          select: { nivelesAcademicos: true },
        },
      },
    });

    if (sede && sede.esPrincipal) {
      return { error: "No se puede eliminar la sede principal" };
    }

    if (sede && sede._count.nivelesAcademicos > 0) {
      return {
        error:
          "No se puede eliminar la sede porque tiene niveles académicos asociados. Desactívela en su lugar.",
      };
    }

    if (sede?._count.nivelesAcademicos === 0) {
      await prisma.sede.delete({
        where: { id },
      });
    } else {
      await prisma.sede.update({
        where: { id },
        data: { activo: false },
      });
    }

    revalidatePath(REVALIDATE_PATH);
    return { success: "Sede eliminada correctamente" };
  } catch (error: any) {
    console.error("Error deleting sede:", error);
    return { error: "Error al eliminar la sede" };
  }
}
