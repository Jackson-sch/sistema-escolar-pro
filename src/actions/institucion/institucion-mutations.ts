"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { auth } from "@/auth";

const REVALIDATE_PATH = "/configuracion/institucion";

/**
 * Actualiza los datos de la institución educativa.
 */
export async function updateInstitucionAction(id: string, values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autenticado" };
    }

    const { cicloEscolarActual, fechaInicioClases, fechaFinClases, ...rest } =
      values;

    const data = {
      ...rest,
      logo: typeof values.logo === "string" ? values.logo : undefined,
      cicloEscolarActual: parseInt(cicloEscolarActual?.toString()) || 2025,
      fechaInicioClases: fechaInicioClases
        ? new Date(fechaInicioClases)
        : undefined,
      fechaFinClases: fechaFinClases ? new Date(fechaFinClases) : undefined,
    };

    await prisma.institucionEducativa.update({
      where: { id },
      data,
    });

    const sedePrincipal = await prisma.sede.findFirst({
      where: {
        institucionId: id,
        esPrincipal: true,
      },
    });

    if (sedePrincipal) {
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
 */
export async function createInstitucionAction(values: any) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "No autenticado" };
    }

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

    const existingInstitucion = await prisma.institucionEducativa.findUnique({
      where: { codigoModular: values.codigoModular },
    });

    if (existingInstitucion) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { institucionId: existingInstitucion.id },
      });

      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath(REVALIDATE_PATH);

      return {
        success:
          "Se ha vinculado tu cuenta a la institución existente correctamente.",
        data: serialize(existingInstitucion),
      };
    }

    const institucion = await prisma.institucionEducativa.create({
      data: {
        ...rest,
        logo: typeof values.logo === "string" ? values.logo : undefined,
        ubigeo: values.ubigeo || values.distrito || "000000",
        cicloEscolarActual:
          parseInt(cicloEscolarActual?.toString()) || new Date().getFullYear(),
        fechaInicioClases: fechaInicioClases
          ? new Date(fechaInicioClases)
          : new Date(`${new Date().getFullYear()}-03-01`),
        fechaFinClases: fechaFinClases
          ? new Date(fechaFinClases)
          : new Date(`${new Date().getFullYear()}-12-20`),
      },
    });

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

    await prisma.user.update({
      where: { id: session.user.id },
      data: { institucionId: institucion.id },
    });

    const estadosSistemicos = [
      {
        codigo: "ACTIVO",
        nombre: "Activo",
        color: "#10b981",
        permiteLogin: true,
        esActivo: true,
      },
      {
        codigo: "INACTIVO",
        nombre: "Inactivo",
        color: "#ef4444",
        permiteLogin: false,
        esActivo: false,
      },
      {
        codigo: "SUSPENDIDO",
        nombre: "Suspendido",
        color: "#f59e0b",
        permiteLogin: false,
        esActivo: false,
      },
      {
        codigo: "EGRESADO",
        nombre: "Egresado",
        color: "#6366f1",
        permiteLogin: false,
        esActivo: false,
      },
    ];

    await Promise.all(
      estadosSistemicos.map((estado) =>
        prisma.estadoUsuario.upsert({
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
        })
      )
    );

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
