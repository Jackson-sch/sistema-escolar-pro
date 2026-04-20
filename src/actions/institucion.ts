"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";

const REVALIDATE_PATH = "/configuracion/institucion";

/**
 * Obtiene los datos de la institución educativa.
 * Asume que solo existe una por ahora.
 */
export async function getInstitucionAction() {
  try {
    const institucion = await prisma.institucionEducativa.findFirst();
    return {
      data: institucion ? serialize(institucion) : null,
    };
  } catch (error) {
    console.error("Error fetching institucion:", error);
    return { error: "No se pudieron obtener los datos de la institución" };
  }
}

/**
 * Obtiene datos específicos de una institución por su ID.
 * Útil para layouts y componentes que solo necesitan campos básicos.
 */
export async function getInstitucionByIdAction(id?: string) {
  try {
    const institucion = await prisma.institucionEducativa.findFirst({
      where: { id: id || undefined },
      select: {
        id: true,
        cicloEscolarActual: true,
        nombreInstitucion: true,
        logo: true,
      },
    });
    return { data: serialize(institucion) };
  } catch (error) {
    console.error("Error fetching institucion by id:", error);
    return { error: "No se pudieron obtener los datos de la institución" };
  }
}

/**
 * Obtiene las sedes de la institución
 */
export async function getSedesAction(institucionId?: string) {
  try {
    const sedes = await prisma.sede.findMany({
      where: institucionId ? { institucionId } : undefined,
      orderBy: { nombre: "asc" },
    });
    return { data: serialize(sedes) };
  } catch (error) {
    console.error("Error fetching sedes:", error);
    return { error: "No se pudieron obtener las sedes" };
  }
}

/**
 * Actualiza los datos de la institución educativa.
 */
export async function updateInstitucionAction(id: string, values: any) {
  try {
    const { cicloEscolarActual, fechaInicioClases, fechaFinClases, ...rest } =
      values;

    let logoProcessed = undefined;
    if (values.logo instanceof File) {
      // Si es un archivo, lo convertimos a Base64 en el servidor o lo manejamos
      // Por ahora, asumimos que el cliente enviará Base64 o que el servidor lo manejará.
      // Pero como estamos en Next.js Server Actions, el objeto File es serializable si se envía por FormData,
      // pero aquí estamos recibiendo un objeto JSON plano.
      // Ajustamos: El componente de cliente enviará el string Base64 si queremos persistencia inmediata,
      // o manejaremos el buffer aquí si fuera un FormData.
    }

    const data = {
      ...rest,
      logo: typeof values.logo === "string" ? values.logo : undefined,
      cicloEscolarActual: parseInt(cicloEscolarActual.toString()) || 2025,
      fechaInicioClases: fechaInicioClases
        ? new Date(fechaInicioClases)
        : undefined,
      fechaFinClases: fechaFinClases ? new Date(fechaFinClases) : undefined,
    };

    const institucion = await prisma.institucionEducativa.update({
      where: { id },
      data,
    });

    // Sincronizar con la Sede Principal
    // Buscamos si ya existe una sede principal para esta institución
    const sedePrincipal = await prisma.sede.findFirst({
      where: {
        institucionId: id,
        esPrincipal: true,
      },
    });

    if (sedePrincipal) {
      // Actualizar sede principal existente
      await prisma.sede.update({
        where: { id: sedePrincipal.id },
        data: {
          nombre: values.nombreInstitucion,
          direccion: values.direccion,
          telefono: values.telefono,
          email: values.email,
          logo: typeof values.logo === "string" ? values.logo : undefined,
          activo: true,
        },
      });
    } else {
      // Crear sede principal si no existe
      await prisma.sede.create({
        data: {
          nombre: values.nombreInstitucion,
          direccion: values.direccion,
          telefono: values.telefono,
          email: values.email,
          logo: typeof values.logo === "string" ? values.logo : undefined,
          esPrincipal: true,
          institucionId: id,
          activo: true,
        },
      });
    }

    revalidatePath(REVALIDATE_PATH);
    revalidatePath("/finanzas");

    return {
      success:
        "Datos de la institución y sede principal actualizados correctamente",
    };
  } catch (error: any) {
    console.error("Error updating institucion:", error);
    return { error: `No se pudieron actualizar los datos: ${error.message}` };
  }
}

/**
 * Crea una nueva institución educativa durante el onboarding.
 * - Crea la institución sin directorId (el admin global no es director).
 * - Crea la sede principal automáticamente.
 * - Asocia al usuario admin actual con la nueva institución.
 * - Crea datos sistémicos iniciales (estados de usuario base).
 */
export async function createInstitucionAction(values: any) {
  try {
    const session = await (await import("@/auth")).auth();

    if (!session?.user?.id) {
      return { error: "No autenticado" };
    }

    // Verificar que el usuario es administrativo
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, institucionId: true },
    });

    if (currentUser?.role !== "administrativo") {
      return { error: "Solo los administradores pueden crear instituciones" };
    }

    if (currentUser?.institucionId) {
      return { error: "Ya tienes una institución asociada" };
    }

    const {
      cicloEscolarActual,
      fechaInicioClases,
      fechaFinClases,
      ...rest
    } = values;

    // Verificar si ya existe una institución con ese código modular
    const existingInstitucion = await prisma.institucionEducativa.findUnique({
      where: { codigoModular: values.codigoModular },
    });

    if (existingInstitucion) {
      // Si ya existe, vinculamos al usuario actual con esa institución
      await prisma.user.update({
        where: { id: session.user.id },
        data: { institucionId: existingInstitucion.id },
      });

      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath(REVALIDATE_PATH);

      return {
        success: "Se ha vinculado tu cuenta a la institución existente correctamente.",
        data: serialize(existingInstitucion),
      };
    }

    // Crear la institución (sin directorId)
    const institucion = await prisma.institucionEducativa.create({
      data: {
        ...rest,
        logo: typeof values.logo === "string" ? values.logo : undefined,
        ubigeo: values.ubigeo || values.distrito || "000000",
        cicloEscolarActual: parseInt(cicloEscolarActual?.toString()) || new Date().getFullYear(),
        fechaInicioClases: fechaInicioClases
          ? new Date(fechaInicioClases)
          : new Date(`${new Date().getFullYear()}-03-01`),
        fechaFinClases: fechaFinClases
          ? new Date(fechaFinClases)
          : new Date(`${new Date().getFullYear()}-12-20`),
      },
    });

    // Crear sede principal
    await prisma.sede.create({
      data: {
        nombre: values.nombreInstitucion,
        direccion: values.direccion,
        telefono: values.telefono || null,
        email: values.email || null,
        logo: typeof values.logo === "string" ? values.logo : undefined,
        esPrincipal: true,
        institucionId: institucion.id,
        activo: true,
      },
    });

    // Asociar usuario admin a la institución
    await prisma.user.update({
      where: { id: session.user.id },
      data: { institucionId: institucion.id },
    });

    // Crear estados de usuario sistémicos para la institución
    const estadosSistemicos = [
      { codigo: "ACTIVO", nombre: "Activo", color: "#10b981", permiteLogin: true, esActivo: true },
      { codigo: "INACTIVO", nombre: "Inactivo", color: "#ef4444", permiteLogin: false, esActivo: false },
      { codigo: "SUSPENDIDO", nombre: "Suspendido", color: "#f59e0b", permiteLogin: false, esActivo: false },
      { codigo: "EGRESADO", nombre: "Egresado", color: "#6366f1", permiteLogin: false, esActivo: false },
    ];

    for (const estado of estadosSistemicos) {
      await prisma.estadoUsuario.upsert({
        where: {
          codigo_institucionId: {
            codigo: `${estado.codigo}_${institucion.id.substring(0, 8)}`,
            institucionId: institucion.id,
          },
        },
        update: {},
        create: {
          codigo: `${estado.codigo}_${institucion.id.substring(0, 8)}`,
          nombre: estado.nombre,
          color: estado.color,
          permiteLogin: estado.permiteLogin,
          esActivo: estado.esActivo,
          sistemico: true,
          institucionId: institucion.id,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(REVALIDATE_PATH);

    return {
      success: "Institución creada exitosamente",
      data: serialize(institucion),
    };
  } catch (error: any) {
    console.error("Error creating institucion:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe una institución con ese código modular" };
    }
    return { error: `No se pudo crear la institución: ${error.message}` };
  }
}
