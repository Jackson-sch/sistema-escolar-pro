"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

const REVALIDATE_PATH = "/finanzas"

/**
 * Registra un pago parcial o total
 */
export const registrarPagoAction = createSafeAction(
  z.object({
    cronogramaId: z.string(),
    monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
    metodoPago: z.string().optional(),
    referencia: z.string().optional(),
    numeroBoleta: z.string().optional(),
    observaciones: z.string().optional(),
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId

    const result = await prisma.$transaction(async (tx) => {
      const cronograma = await tx.cronogramaPago.findFirst({
        where: { 
          id: values.cronogramaId,
          estudiante: { institucionId } 
        },
        include: { concepto: true }
      })

      if (!cronograma) {
        throw new Error("Cronograma no encontrado o no pertenece a su institución.")
      }

      const nuevoMontoPagado = Number(cronograma.montoPagado) + Number(values.monto)
      const estaPagado = nuevoMontoPagado >= Number(cronograma.monto)

      await tx.cronogramaPago.update({
        where: { id: values.cronogramaId },
        data: {
          montoPagado: nuevoMontoPagado,
          pagado: estaPagado,
          updatedAt: new Date()
        }
      })

      await tx.pago.create({
        data: {
          estudianteId: cronograma.estudianteId,
          cronogramaPagoId: cronograma.id,
          concepto: cronograma.concepto.nombre,
          monto: values.monto,
          metodoPago: values.metodoPago || "Efectivo",
          referenciaPago: values.referencia,
          numeroBoleta: values.numeroBoleta,
          fechaVencimiento: cronograma.fechaVencimiento,
          fechaPago: new Date(),
          estado: "completado",
          observaciones: values.observaciones
        }
      })

      return { estaPagado, saldoPendiente: Number(cronograma.monto) - nuevoMontoPagado }
    })

    revalidatePath(REVALIDATE_PATH)
    return {
      success: result.estaPagado
        ? "Pago registrado y completado exitosamente"
        : `Pago parcial registrado. Saldo pendiente: S/ ${result.saldoPendiente.toFixed(2)}`
    }
  },
  { roles: ["administrativo"] }
)

/**
 * Obtiene el resumen de deudas por estudiante
 */
export const getResumenDeudaAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }, session) => {
    const institucionId = session.user.institucionId

    const deudas = await prisma.cronogramaPago.findMany({
      where: { 
        estudianteId, 
        pagado: false,
        estudiante: { institucionId }
      },
      include: { concepto: true }
    })

    const totalDeuda = deudas.reduce((acc, d) => acc + (d.monto - d.montoPagado), 0)
    const cuotasPendientes = deudas.length

    return {
      success: {
        deudas: JSON.parse(JSON.stringify(deudas)),
        totalDeuda,
        cuotasPendientes
      }
    }
  }
)

/**
 * Obtiene el siguiente número de comprobante autoincremental
 */
export const getNextComprobanteAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId

    const ultimoPago = await prisma.pago.findFirst({
      where: {
        numeroBoleta: {
          startsWith: "B001-"
        },
        estudiante: { institucionId }
      },
      orderBy: {
        numeroBoleta: "desc"
      },
      select: {
        numeroBoleta: true
      }
    })

    if (!ultimoPago || !ultimoPago.numeroBoleta) {
      return { success: "B001-000001" }
    }

    const currentNumber = parseInt(ultimoPago.numeroBoleta.split("-")[1])
    const nextNumber = currentNumber + 1
    const formattedNumber = nextNumber.toString().padStart(6, "0")

    return { success: `B001-${formattedNumber}` }
  }
)
