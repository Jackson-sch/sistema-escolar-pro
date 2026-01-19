"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { ConceptoSchema } from "@/lib/schemas/finance"
import { z } from "zod"

const REVALIDATE_PATH = "/finanzas"

/**
 * Obtiene los conceptos de pago de la institución (filtrado por la sesión del usuario)
 */
export const getConceptosAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId

    const conceptos = await prisma.conceptoPago.findMany({
      where: { 
        institucionId: institucionId || undefined,
        activo: true 
      },
      orderBy: { nombre: "asc" }
    })
    
    return { success: JSON.parse(JSON.stringify(conceptos)) }
  }
)

/**
 * Crea o actualiza un concepto de pago
 */
export const upsertConceptoAction = createSafeAction(
  z.object({
    id: z.string().optional(),
    values: ConceptoSchema
  }),
  async ({ id, values }, session) => {
    const institucionId = session.user.institucionId

    if (!institucionId) {
      return { error: "El usuario no tiene una institución asignada." }
    }

    const data = {
      nombre: values.nombre,
      montoSugerido: values.montoSugerido,
      moneda: values.moneda,
      moraDiaria: values.moraDiaria,
      activo: values.activo,
      institucionId: institucionId
    }

    if (id) {
      const concepto = await prisma.conceptoPago.update({
        where: { id, institucionId },
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: JSON.parse(JSON.stringify(concepto)) }
    } else {
      const concepto = await prisma.conceptoPago.create({
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: JSON.parse(JSON.stringify(concepto)) }
    }
  },
  { roles: ["administrativo"] }
)

/**
 * Elimina (desactiva) un concepto de pago
 */
export const deleteConceptoAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, session) => {
    const institucionId = session.user.institucionId

    await prisma.conceptoPago.update({
      where: { id, institucionId },
      data: { activo: false }
    })
    
    revalidatePath(REVALIDATE_PATH)
    return { success: "Concepto eliminado correctamente" }
  },
  { roles: ["administrativo"] }
)
