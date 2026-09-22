"use server";

import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/safe-action";
import { serialize } from "@/lib/dto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ensurePermissionsSeeded,
  DEFAULT_CARGO_PERMISSIONS,
} from "./permissions-seed";

/**
 * Consulta la matriz de cargos y permisos institucionales.
 */
export const getPermissionsMatrixAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    await ensurePermissionsSeeded();

    const institucionId = session.user.institucionId;

    const [cargos, permisos] = await Promise.all([
      prisma.cargo.findMany({
        where: {
          activo: true,
          OR: [
            { institucionId: institucionId || undefined },
            { institucionId: null },
          ],
        },
        include: {
          permisos: {
            select: {
              permisoId: true,
              permiso: {
                select: {
                  id: true,
                  codigo: true,
                  modulo: true,
                },
              },
            },
          },
          _count: {
            select: { usuarios: true },
          },
        },
        orderBy: [{ jerarquia: "asc" }, { nombre: "asc" }],
      }),
      prisma.permiso.findMany({
        where: { activo: true },
        orderBy: [{ modulo: "asc" }, { codigo: "asc" }],
      }),
    ]);

    return {
      success: {
        cargos: serialize(cargos),
        permisos: serialize(permisos),
      },
    };
  },
  { roles: ["administrativo"] }
);

const togglePermissionSchema = z.object({
  cargoId: z.string().min(1),
  permisoId: z.string().min(1),
  active: z.boolean(),
});

/**
 * Activa o revoca un permiso específico para un cargo institucional.
 */
export const toggleCargoPermissionAction = createSafeAction(
  togglePermissionSchema,
  async ({ cargoId, permisoId, active }) => {
    if (active) {
      await prisma.cargoPermiso.upsert({
        where: {
          cargoId_permisoId: { cargoId, permisoId },
        },
        update: {},
        create: { cargoId, permisoId },
      });
    } else {
      await prisma.cargoPermiso.deleteMany({
        where: { cargoId, permisoId },
      });
    }

    revalidatePath("/configuracion/permisos");
    return { success: true };
  },
  { roles: ["administrativo"] }
);

const toggleModuleSchema = z.object({
  cargoId: z.string().min(1),
  permisoIds: z.array(z.string().min(1)),
  enableAll: z.boolean(),
});

/**
 * Habilita o deshabilita todos los permisos de un módulo para un cargo.
 */
export const toggleModulePermissionsAction = createSafeAction(
  toggleModuleSchema,
  async ({ cargoId, permisoIds, enableAll }) => {
    if (enableAll) {
      for (const permisoId of permisoIds) {
        await prisma.cargoPermiso.upsert({
          where: { cargoId_permisoId: { cargoId, permisoId } },
          update: {},
          create: { cargoId, permisoId },
        });
      }
    } else {
      await prisma.cargoPermiso.deleteMany({
        where: {
          cargoId,
          permisoId: { in: permisoIds },
        },
      });
    }

    revalidatePath("/configuracion/permisos");
    return { success: true };
  },
  { roles: ["administrativo"] }
);

const resetCargoSchema = z.object({
  cargoId: z.string().min(1),
  cargoCodigo: z.string().min(1),
});

/**
 * Restablece los permisos recomendados de fábrica para un cargo según su código.
 */
export const resetDefaultCargoPermissionsAction = createSafeAction(
  resetCargoSchema,
  async ({ cargoId, cargoCodigo }) => {
    const defaultCodes = DEFAULT_CARGO_PERMISSIONS[cargoCodigo] || [];

    const permisos = await prisma.permiso.findMany({
      where: { codigo: { in: defaultCodes } },
      select: { id: true },
    });

    // Eliminar permisos actuales del cargo
    await prisma.cargoPermiso.deleteMany({ where: { cargoId } });

    // Insertar permisos por defecto
    if (permisos.length > 0) {
      await prisma.cargoPermiso.createMany({
        data: permisos.map((p) => ({
          cargoId,
          permisoId: p.id,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath("/configuracion/permisos");
    return { success: true };
  },
  { roles: ["administrativo"] }
);
