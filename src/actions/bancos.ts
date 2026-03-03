"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

const BankAccountSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  tipo: z.enum(["BANCO", "BILLETERA_DIGITAL"]),
  numero: z.string().min(1, "El número es requerido"),
  cci: z.string().optional(),
  titular: z.string().min(1, "El titular es requerido"),
  tipoCuenta: z.string().optional(),
  qrCode: z.string().optional(),
  esPrincipal: z.boolean().default(false),
  activo: z.boolean().default(true),
});

export const getBankAccountsAction = createSafeAction(
  z.object({ onlyActive: z.boolean().default(true) }),
  async ({ onlyActive = true }, session) => {
    const institucionId = session.user.institucionId;

    const cuentas = await prisma.cuentaBancaria.findMany({
      where: {
        institucionId: institucionId || undefined,
        activo: onlyActive ? true : undefined,
      },
      orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }],
    });

    return { success: JSON.parse(JSON.stringify(cuentas)) };
  },
);

export const saveBankAccountAction = createSafeAction(
  BankAccountSchema,
  async (data, session) => {
    const institucionId = session.user.institucionId;

    try {
      if (data.esPrincipal) {
        // Desmarcar otras como principales si esta lo es
        await prisma.cuentaBancaria.updateMany({
          where: { institucionId: institucionId || undefined },
          data: { esPrincipal: false },
        });
      }

      if (data.id) {
        const cuenta = await prisma.cuentaBancaria.update({
          where: { id: data.id },
          data: {
            ...data,
            institucionId: institucionId || undefined,
          },
        });
        revalidatePath("/configuracion/institucion");
        revalidatePath("/portal/deudas");
        return { success: JSON.parse(JSON.stringify(cuenta)) };
      } else {
        const cuenta = await prisma.cuentaBancaria.create({
          data: {
            ...data,
            id: undefined,
            institucionId: institucionId || undefined,
          },
        });
        revalidatePath("/configuracion/institucion");
        revalidatePath("/portal/deudas");
        return { success: JSON.parse(JSON.stringify(cuenta)) };
      }
    } catch (error) {
      console.error("Error al guardar cuenta bancaria:", error);
      return { error: "No se pudo guardar la cuenta bancaria" };
    }
  },
);

export const deleteBankAccountAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }) => {
    try {
      await prisma.cuentaBancaria.delete({
        where: { id },
      });
      revalidatePath("/configuracion/institucion");
      revalidatePath("/portal/deudas");
      return { success: true };
    } catch (error) {
      return { error: "No se pudo eliminar la cuenta" };
    }
  },
);
