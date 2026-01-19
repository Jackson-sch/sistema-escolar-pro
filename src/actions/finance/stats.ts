"use server"

import prisma from "@/lib/prisma"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

/**
 * Obtiene estadísticas de cobranza (filtrado por institución)
 */
export const getEstadisticasCobranzaAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId
    const studentFilter = institucionId ? { institucionId } : {}

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalStats, deudasVencidas, totalMoraAcumulada] = await Promise.all([
      prisma.cronogramaPago.aggregate({
        where: { 
          estudiante: studentFilter 
        },
        _sum: { 
          monto: true, 
          montoPagado: true 
        }
      }),
      prisma.cronogramaPago.count({
        where: {
          pagado: false,
          fechaVencimiento: { lt: today },
          estudiante: studentFilter
        }
      }),
      prisma.cronogramaPago.aggregate({
        where: { 
          pagado: false,
          estudiante: studentFilter
        },
        _sum: { 
          moraAcumulada: true 
        }
      })
    ])

    const totalMora = totalMoraAcumulada._sum.moraAcumulada || 0
    const totalDeuda = totalStats._sum.monto || 0
    const yaCobrado = totalStats._sum.montoPagado || 0

    return {
      success: {
        pendiente: Math.max(0, (totalDeuda + totalMora) - yaCobrado),
        cobrado: yaCobrado,
        deudasVencidas,
        totalMora
      }
    }
  },
  { roles: ["administrativo"] }
)
