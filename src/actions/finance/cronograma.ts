"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import {
  CronogramaFilterSchema,
  CreateCronogramaMasivoSchema,
} from "@/lib/schemas/finance";
import { z } from "zod";

const REVALIDATE_PATH = "/finanzas";

/**
 * Obtiene el cronograma de pagos (deudas) de estudiantes
 */
export const getCronogramaAction = createSafeAction(
  CronogramaFilterSchema,
  async (filters, session) => {
    let institucionId = session?.user?.institucionId;
    if (!institucionId) {
      const firstInst = await prisma.institucionEducativa.findFirst({
        select: { id: true },
      });
      institucionId = firstInst?.id;
    }

    const startOfYear = filters?.anioAcademico
      ? new Date(filters.anioAcademico, 0, 1)
      : undefined;
    const endOfYear = filters?.anioAcademico
      ? new Date(filters.anioAcademico, 11, 31, 23, 59, 59)
      : undefined;

    const cronograma = await prisma.cronogramaPago.findMany({
      where: {
        estudiante: {
          ...(institucionId ? { institucionId } : {}),
          id: filters?.estudianteId,
        },
        conceptoId: filters?.conceptoId,
        pagado: filters?.pagado,
        ...(startOfYear && endOfYear
          ? {
              fechaVencimiento: {
                gte: startOfYear,
                lte: endOfYear,
              },
            }
          : {}),
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoModular: true,
            dni: true,
            image: true,
            codigoEstudiante: true,
            nivelAcademicoId: true,
            nivelAcademico: {
              include: {
                grado: true,
                nivel: true,
              },
            },
            matriculas: {
              include: {
                nivelAcademico: {
                  include: {
                    grado: true,
                    nivel: true,
                  },
                },
              },
              orderBy: { anioAcademico: "desc" },
              take: 1,
            },
          },
        },
        concepto: {
          select: { id: true, nombre: true },
        },
        pagos: true,
      },
      orderBy: [
        { pagado: "asc" },
        { fechaVencimiento: "desc" },
        { estudiante: { apellidoPaterno: "asc" } },
      ],
    });
    return { success: serialize(cronograma) };
  },
);

/**
 * Crea deudas masivamente para todos los estudiantes de un nivel académico
 */
export const createCronogramaMasivoAction = createSafeAction(
  CreateCronogramaMasivoSchema,
  async (values, session) => {
    const institucionId = session.user.institucionId;
    if (!institucionId) return { error: "Institución no identificada." };

    const date = new Date(values.fechaVencimiento);
    const concepto = await prisma.conceptoPago.findUnique({
      where: { id: values.conceptoId, institucionId },
    });

    if (!concepto) {
      return {
        error:
          "El concepto de pago seleccionado no existe o no pertenece a su institución.",
      };
    }

    // Obtener la institución para saber el ciclo escolar actual
    const institucion = await prisma.institucionEducativa.findUnique({
      where: { id: institucionId },
      select: { cicloEscolarActual: true },
    });

    if (!institucion)
      return {
        error: "No se pudo encontrar la información de la institución.",
      };

    const anioActual = institucion.cicloEscolarActual;

    const estudiantes = await prisma.user.findMany({
      where: {
        role: "estudiante",
        institucionId,
        nivelAcademico: values.nivelId ? { nivelId: values.nivelId } : undefined,
        // Solo estudiantes con matrícula activa en el año actual
        matriculas: {
          some: {
            anioAcademico: anioActual,
            estado: "activo",
          },
        },
      },
      include: {
        matriculas: {
          where: {
            anioAcademico: anioActual,
            estado: "activo",
          },
          select: { descuentoBeca: true, tipoBeca: true, anioAcademico: true },
          take: 1,
        },
        cronogramaPagos: {
          where: { conceptoId: values.conceptoId },
        },
      },
    });

    if (estudiantes.length === 0) {
      return {
        error: "No se encontraron estudiantes para los filtros seleccionados.",
      };
    }

    // Filtrar estudiantes que ya tienen este concepto generado
    const estudiantesSinConcepto = estudiantes.filter(
      (est) => est.cronogramaPagos.length === 0,
    );

    if (estudiantesSinConcepto.length === 0) {
      return {
        error:
          "Todos los estudiantes seleccionados ya tienen este concepto generado.",
      };
    }

    const results = await prisma.$transaction(
      estudiantesSinConcepto.map((est: any) => {
        const beca = est.matriculas?.[0]?.descuentoBeca || 0;
        const montoFinal = Math.max(0, values.monto - beca);

        return prisma.cronogramaPago.create({
          data: {
            estudianteId: est.id,
            conceptoId: values.conceptoId,
            monto: montoFinal,
            fechaVencimiento: date,
            montoPagado: 0,
            pagado: false,
          },
        });
      }),
    );

    revalidatePath(REVALIDATE_PATH);
    return {
      success: `Cronograma generado exitosamente para ${results.length} estudiantes`,
    };
  },
  { roles: ["administrativo"] },
);

/**
 * Elimina cronogramas masivamente por concepto
 */
export const deleteCronogramaMasivoAction = createSafeAction(
  z.object({
    conceptoId: z.string(),
    nivelId: z.string().optional(),
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId;

    const where: any = {
      conceptoId: values.conceptoId,
      pagado: false,
      montoPagado: 0,
      estudiante: {
        institucionId,
        nivelAcademico: values.nivelId ? { nivelId: values.nivelId } : undefined,
      },
    };

    const count = await prisma.cronogramaPago.count({ where });
    if (count === 0)
      return {
        error: "No se encontraron cronogramas pendientes para eliminar.",
      };

    await prisma.cronogramaPago.deleteMany({ where });

    revalidatePath(REVALIDATE_PATH);
    return { success: `Se eliminaron ${count} cronogramas correctamente` };
  },
  { roles: ["administrativo"] },
);

/**
 * Actualiza la fecha de vencimiento masivamente
 */
export const updateCronogramaFechaMasivoAction = createSafeAction(
  z.object({
    conceptoId: z.string(),
    nuevaFecha: z.union([z.date(), z.string()]),
    nivelId: z.string().optional(),
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId;
    const nuevaFecha = new Date(values.nuevaFecha);

    const where: any = {
      conceptoId: values.conceptoId,
      pagado: false,
      estudiante: {
        institucionId,
        nivelAcademico: values.nivelId ? { nivelId: values.nivelId } : undefined,
      },
    };

    const count = await prisma.cronogramaPago.count({ where });
    if (count === 0)
      return {
        error: "No se encontraron cronogramas pendientes para actualizar.",
      };

    await prisma.cronogramaPago.updateMany({
      where,
      data: { fechaVencimiento: nuevaFecha },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: `Se actualizó la fecha de ${count} cronogramas correctamente`,
    };
  },
  { roles: ["administrativo"] },
);

/**
 * Aplica mora (interés) masivamente
 */
export const applyBulkMoraAction = createSafeAction(
  z.object({
    conceptoId: z.string().optional(),
    nivelId: z.string().optional(),
  }),
  async (filters, session) => {
    const institucionId = session.user.institucionId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cronogramasVencidos = await prisma.cronogramaPago.findMany({
      where: {
        pagado: false,
        fechaVencimiento: { lt: today },
        conceptoId: filters.conceptoId || undefined,
        estudiante: {
          institucionId,
          nivelAcademico: filters.nivelId ? { nivelId: filters.nivelId } : undefined,
        },
      },
      include: {
        concepto: true,
      },
    });

    if (cronogramasVencidos.length === 0)
      return { success: "No hay cronogramas vencidos para procesar." };

    let count = 0;
    await prisma.$transaction(
      cronogramasVencidos.map((cp) => {
        const fechaVencimiento = new Date(cp.fechaVencimiento);
        fechaVencimiento.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - fechaVencimiento.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const moraDiaria = cp.concepto.moraDiaria || 0;
        const nuevaMora = diffDays * moraDiaria;

        count++;
        return prisma.cronogramaPago.update({
          where: { id: cp.id },
          data: {
            moraAcumulada: nuevaMora,
            updatedAt: new Date(),
          },
        });
      }),
    );

    revalidatePath(REVALIDATE_PATH);
    return {
      success: `Se actualizó el interés por mora de ${count} registros`,
    };
  },
  { roles: ["administrativo"] },
);

/**
 * Obtiene el expediente de cobranza completo del alumno para la Caja Rápida (POS)
 */
export const getStudentCobroDetailsAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }, session) => {
    const institucionId = session.user.institucionId;

    const student = await prisma.user.findFirst({
      where: {
        id: estudianteId,
        role: "estudiante",
        institucionId: institucionId || undefined,
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        image: true,
        codigoEstudiante: true,
        codigoSiagie: true,
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true,
            sede: true,
          },
        },
        padresTutores: {
          include: {
            padreTutor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                dni: true,
                telefono: true,
                email: true,
              },
            },
          },
        },
        cronogramaPagos: {
          orderBy: { fechaVencimiento: "asc" },
          include: {
            concepto: true,
            pagos: {
              where: { estado: "completado" },
              orderBy: { fechaPago: "desc" },
            },
          },
        },
      },
    });

    if (!student) {
      return { error: "Estudiante no encontrado en su institución." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cronogramas = student.cronogramaPagos.map((cp) => {
      const vencimiento = new Date(cp.fechaVencimiento);
      vencimiento.setHours(0, 0, 0, 0);

      const totalMonto = Number(cp.monto) + Number(cp.moraAcumulada || 0);
      const totalPagado = Number(cp.montoPagado || 0);
      const saldoPendiente = Math.max(0, totalMonto - totalPagado);

      let estado: "PAID" | "PENDING" | "EXPIRED" | "PARTIALLY_PAID" = "PENDING";
      if (cp.pagado || saldoPendiente === 0) {
        estado = "PAID";
      } else if (totalPagado > 0) {
        estado = "PARTIALLY_PAID";
      } else if (vencimiento < today) {
        estado = "EXPIRED";
      }

      return {
        id: cp.id,
        conceptoId: cp.conceptoId,
        conceptoNombre: cp.concepto.nombre,
        mes: new Date(cp.fechaVencimiento).getMonth() + 1,
        montoBase: Number(cp.monto),
        moraAcumulada: Number(cp.moraAcumulada || 0),
        montoTotal: totalMonto,
        montoPagado: totalPagado,
        saldoPendiente,
        fechaVencimiento: cp.fechaVencimiento,
        estado,
        pagado: cp.pagado,
        diasVencido: vencimiento < today && saldoPendiente > 0 ? Math.ceil((today.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        ultimosPagos: cp.pagos.map((p) => ({
          id: p.id,
          monto: Number(p.monto),
          metodoPago: p.metodoPago,
          numeroBoleta: p.numeroBoleta,
          fechaPago: p.fechaPago,
        })),
      };
    });

    // Calcular KPIs de cobranza
    const totalDeudaVencida = cronogramas
      .filter((c) => c.estado === "EXPIRED")
      .reduce((sum, c) => sum + c.saldoPendiente, 0);

    const totalPorCobrarAnio = cronogramas
      .filter((c) => c.estado !== "PAID")
      .reduce((sum, c) => sum + c.saldoPendiente, 0);

    const totalCobrado = cronogramas.reduce((sum, c) => sum + c.montoPagado, 0);

    // Obtener siguiente correlativo sugerido
    const ultimoPago = await prisma.pago.findFirst({
      where: {
        numeroBoleta: { startsWith: "B001-" },
        estudiante: { institucionId: institucionId || undefined },
      },
      orderBy: { numeroBoleta: "desc" },
      select: { numeroBoleta: true },
    });

    let nextNumeroBoleta = "B001-000001";
    if (ultimoPago?.numeroBoleta) {
      const parts = ultimoPago.numeroBoleta.split("-");
      if (parts[1]) {
        const num = parseInt(parts[1], 10) + 1;
        nextNumeroBoleta = `B001-${num.toString().padStart(6, "0")}`;
      }
    }

    const primaryGuardian = student.padresTutores.find((p) => p.contactoPrimario)?.padreTutor ||
      student.padresTutores[0]?.padreTutor || null;

    return {
      success: serialize({
        student: {
          id: student.id,
          name: student.name,
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          dni: student.dni,
          image: student.image,
          codigoEstudiante: student.codigoEstudiante,
          codigoSiagie: student.codigoSiagie,
          nivelAcademico: student.nivelAcademico,
        },
        primaryGuardian,
        cronogramas,
        resumen: {
          totalDeudaVencida,
          totalPorCobrarAnio,
          totalCobrado,
          cuotasPendientesCount: cronogramas.filter((c) => c.estado !== "PAID").length,
          cuotasVencidasCount: cronogramas.filter((c) => c.estado === "EXPIRED").length,
        },
        nextNumeroBoleta,
      }),
    };
  },
  { roles: ["administrativo"] },
);

