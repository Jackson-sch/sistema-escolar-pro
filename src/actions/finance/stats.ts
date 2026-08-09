"use server";

import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

/**
 * Obtiene estadísticas de cobranza (filtrado por institución)
 */
export const getEstadisticasCobranzaAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;
    const studentFilter = institucionId ? { institucionId } : {};


    const [
      totalStats,
      deudasVencidas,
      totalMoraAcumulada,
      pendientesVerificacion,
      recaudacionMensualRes,
      proyeccionMensualRes,
    ] = await Promise.all([
      prisma.cronogramaPago.aggregate({
        where: {
          estudiante: studentFilter,
        },
        _sum: {
          monto: true,
          montoPagado: true,
        },
      }),
      prisma.cronogramaPago.count({
        where: {
          pagado: false,
          fechaVencimiento: { lt: new Date() },
          estudiante: studentFilter,
        },
      }),
      prisma.cronogramaPago.aggregate({
        where: {
          pagado: false,
          estudiante: studentFilter,
        },
        _sum: {
          moraAcumulada: true,
        },
      }),
      prisma.comprobantePago.count({
        where: {
          estado: "PENDIENTE",
          padre: { institucionId: institucionId || undefined },
        },
      }),
      prisma.pago.aggregate({
        where: {
          fechaPago: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0,
            ),
          },
          estudiante: studentFilter,
          estado: "completado",
        },
        _sum: { monto: true },
      }),
      prisma.cronogramaPago.aggregate({
        where: {
          fechaVencimiento: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          },
          estudiante: studentFilter,
        },
        _sum: { monto: true },
      }),
    ]);

    const totalMora = totalMoraAcumulada._sum.moraAcumulada || 0;
    const totalDeuda = totalStats._sum.monto || 0;
    const yaCobrado = totalStats._sum.montoPagado || 0;

    return {
      success: {
        pendiente: Math.max(0, totalDeuda + totalMora - yaCobrado),
        cobrado: yaCobrado,
        deudasVencidas,
        totalMora,
        pagosPendientesVerificacion: pendientesVerificacion,
        recaudacionMensual: recaudacionMensualRes._sum.monto || 0,
        proyeccionMensual: proyeccionMensualRes._sum.monto || 0,
      },
    };
  },
  { roles: ["administrativo"] },
);
