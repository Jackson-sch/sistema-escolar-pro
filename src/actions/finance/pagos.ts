"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

const REVALIDATE_PATH = "/finanzas";

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
    const institucionId = session.user.institucionId;

    const result = await prisma.$transaction(async (tx) => {
      const cronograma = await tx.cronogramaPago.findFirst({
        where: {
          id: values.cronogramaId,
          estudiante: { institucionId },
        },
        include: { concepto: true },
      });

      if (!cronograma) {
        throw new Error(
          "Cronograma no encontrado o no pertenece a su institución.",
        );
      }

      const nuevoMontoPagado =
        Number(cronograma.montoPagado) + Number(values.monto);
      const estaPagado = nuevoMontoPagado >= Number(cronograma.monto);

      await tx.cronogramaPago.update({
        where: { id: values.cronogramaId },
        data: {
          montoPagado: nuevoMontoPagado,
          pagado: estaPagado,
          updatedAt: new Date(),
        },
      });

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
          observaciones: values.observaciones,
        },
      });

      return {
        estaPagado,
        saldoPendiente: Number(cronograma.monto) - nuevoMontoPagado,
      };
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: result.estaPagado
        ? "Pago registrado y completado exitosamente"
        : `Pago parcial registrado. Saldo pendiente: S/ ${result.saldoPendiente.toFixed(2)}`,
    };
  },
  { roles: ["administrativo"] },
);

/**
/**
 * Obtiene el siguiente número de comprobante autoincremental
 */
export const getNextComprobanteAction = createSafeAction(
  z.object({}).optional(),
  async (_, session) => {
    const institucionId = session.user.institucionId;

    const ultimoPago = await prisma.pago.findFirst({
      where: {
        numeroBoleta: {
          startsWith: "B001-",
        },
        estudiante: { institucionId },
      },
      orderBy: {
        numeroBoleta: "desc",
      },
      select: {
        numeroBoleta: true,
      },
    });

    if (!ultimoPago || !ultimoPago.numeroBoleta) {
      return { success: "B001-000001" };
    }

    const currentNumber = parseInt(ultimoPago.numeroBoleta.split("-")[1]);
    const nextNumber = currentNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(6, "0");

    return { success: `B001-${formattedNumber}` };
  },
);

/**
 * Anula un pago realizado
 */
export const anularPagoAction = createSafeAction(
  z.object({ pagoId: z.string() }),
  async ({ pagoId }, session) => {
    const institucionId = session.user.institucionId;

    try {
      await prisma.$transaction(async (tx) => {
        const pago = await tx.pago.findUnique({
          where: { id: pagoId },
          include: {
            cronogramaPago: true,
            estudiante: true,
          },
        });

        if (!pago || pago.estudiante.institucionId !== institucionId) {
          throw new Error("Pago no encontrado o no autorizado.");
        }

        if (pago.estado === "anulado") {
          throw new Error("Este pago ya ha sido anulado.");
        }

        if (!pago.cronogramaPagoId) {
          throw new Error(
            "Este pago no está vinculado a un cronograma y no puede ser anulado mediante este proceso.",
          );
        }

        // 1. Marcar el pago como anulado
        await tx.pago.update({
          where: { id: pagoId },
          data: {
            estado: "anulado",
            updatedAt: new Date(),
          },
        });

        // 2. Revertir montos en el cronograma
        const cronograma = pago.cronogramaPago!;
        const nuevoMontoPagado = Math.max(
          0,
          Number(cronograma.montoPagado) - Number(pago.monto),
        );

        await tx.cronogramaPago.update({
          where: { id: pago.cronogramaPagoId },
          data: {
            montoPagado: nuevoMontoPagado,
            pagado: false, // Siempre false si quitamos un pago
            updatedAt: new Date(),
          },
        });

        return { success: true };
      });

      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Pago anulado correctamente. El saldo ha sido revertido.",
      };
    } catch (error: any) {
      console.error("Error anulando pago:", error);
      return { error: error.message || "No se pudo anular el pago." };
    }
  },
  { roles: ["administrativo"] },
);

/**
 * Registra una operación de cobranza rápida (POS Escolar) para una o múltiples cuotas
 */
export const registrarCobroRapidoPOSAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    items: z.array(
      z.object({
        cronogramaId: z.string(),
        monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
      })
    ).min(1, "Debe seleccionar al menos una cuota para cobrar"),
    metodoPago: z.string(),
    referenciaPago: z.string().optional(),
    numeroBoleta: z.string().optional(),
    montoRecibido: z.number().optional(),
    observaciones: z.string().optional(),
  }),
  async (values, session) => {
    const institucionId = session.user.institucionId;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Obtener datos de la institución y estudiante
        const [institucion, estudiante] = await Promise.all([
          tx.institucionEducativa.findUnique({
            where: { id: institucionId || undefined },
            select: {
              nombreInstitucion: true,
              codigoModular: true,
              dre: true,
              ugel: true,
              direccion: true,
              telefono: true,
              logo: true,
              cicloEscolarActual: true,
            },
          }),
          tx.user.findFirst({
            where: { id: values.estudianteId, institucionId },
            include: {
              nivelAcademico: {
                include: {
                  grado: true,
                  nivel: true,
                  sede: true,
                },
              },
              padresTutores: {
                include: { padreTutor: true },
              },
            },
          }),
        ]);

        if (!estudiante) {
          throw new Error("Estudiante no encontrado en la institución.");
        }

        // 2. Determinar número de comprobante único
        let boletaGenerada = values.numeroBoleta?.trim();
        if (!boletaGenerada) {
          const ultimoPago = await tx.pago.findFirst({
            where: {
              numeroBoleta: { startsWith: "B001-" },
              estudiante: { institucionId },
            },
            orderBy: { numeroBoleta: "desc" },
            select: { numeroBoleta: true },
          });

          let nextNum = 1;
          if (ultimoPago?.numeroBoleta) {
            const parts = ultimoPago.numeroBoleta.split("-");
            if (parts[1]) nextNum = parseInt(parts[1], 10) + 1;
          }
          boletaGenerada = `B001-${nextNum.toString().padStart(6, "0")}`;
        }

        // 3. Procesar cada cuota seleccionada en lote
        const cronogramaIds = values.items.map((i) => i.cronogramaId);
        const cronogramas = await tx.cronogramaPago.findMany({
          where: {
            id: { in: cronogramaIds },
            estudianteId: values.estudianteId,
          },
          include: { concepto: true },
        });
        const cronogramaMap = new Map(cronogramas.map((c) => [c.id, c]));

        for (const item of values.items) {
          if (!cronogramaMap.has(item.cronogramaId)) {
            throw new Error(`Cronograma ${item.cronogramaId} no válido.`);
          }
        }

        const pagosRegistrados = await Promise.all(
          values.items.map(async (item) => {
            const cronograma = cronogramaMap.get(item.cronogramaId)!;
            const totalCuota = Number(cronograma.monto) + Number(cronograma.moraAcumulada || 0);
            const nuevoMontoPagado = Number(cronograma.montoPagado) + Number(item.monto);
            const estaPagado = nuevoMontoPagado >= totalCuota;

            await tx.cronogramaPago.update({
              where: { id: item.cronogramaId },
              data: {
                montoPagado: nuevoMontoPagado,
                pagado: estaPagado,
                updatedAt: new Date(),
              },
            });

            const nuevoPago = await tx.pago.create({
              data: {
                estudianteId: values.estudianteId,
                cronogramaPagoId: cronograma.id,
                concepto: cronograma.concepto.nombre,
                monto: item.monto,
                metodoPago: values.metodoPago,
                referenciaPago: values.referenciaPago,
                numeroBoleta: boletaGenerada,
                fechaVencimiento: cronograma.fechaVencimiento,
                fechaPago: new Date(),
                estado: "completado",
                observaciones: values.observaciones,
              },
            });

            return {
              id: nuevoPago.id,
              concepto: cronograma.concepto.nombre,
              mes: new Date(cronograma.fechaVencimiento).getMonth() + 1,
              monto: item.monto,
            };
          })
        );

        // 4. Si se pagó un concepto de Matrícula, ratificar automáticamente la matrícula pendiente
        const tienePagoMatricula = pagosRegistrados.some((p) =>
          p.concepto.toLowerCase().includes("matric")
        );

        if (tienePagoMatricula) {
          const matriculasPendientes = await tx.matricula.findMany({
            where: {
              estudianteId: values.estudianteId,
              estado: "pendiente",
            },
            orderBy: { anioAcademico: "desc" },
          });

          const cicloActual = institucion?.cicloEscolarActual || new Date().getFullYear();

          for (const mat of matriculasPendientes) {
            await tx.matricula.update({
              where: { id: mat.id },
              data: {
                estado: "activo",
                fechaMatricula: new Date(),
              },
            });

            if (mat.anioAcademico === cicloActual) {
              await tx.user.update({
                where: { id: values.estudianteId },
                data: { nivelAcademicoId: mat.nivelAcademicoId },
              });
            }
          }
        }

        const totalCobrado = values.items.reduce((sum, item) => sum + Number(item.monto), 0);

        const primaryGuardian = estudiante.padresTutores.find((p) => p.contactoPrimario)?.padreTutor ||
          estudiante.padresTutores[0]?.padreTutor || null;

        const vuelto = values.montoRecibido && values.montoRecibido > totalCobrado
          ? values.montoRecibido - totalCobrado
          : 0;

        return {
          numeroBoleta: boletaGenerada,
          totalCobrado,
          montoRecibido: values.montoRecibido || totalCobrado,
          vuelto,
          metodoPago: values.metodoPago,
          referenciaPago: values.referenciaPago,
          fechaPago: new Date(),
          estudiante: {
            id: estudiante.id,
            name: estudiante.name,
            apellidoPaterno: estudiante.apellidoPaterno,
            apellidoMaterno: estudiante.apellidoMaterno,
            dni: estudiante.dni,
            codigoEstudiante: estudiante.codigoEstudiante,
            nivelAcademico: estudiante.nivelAcademico,
          },
          primaryGuardian,
          institucion: {
            nombre: institucion?.nombreInstitucion || "Institución Educativa",
            codigoModular: institucion?.codigoModular,
            dre: institucion?.dre,
            ugel: institucion?.ugel,
            direccion: institucion?.direccion,
            telefono: institucion?.telefono,
            logo: institucion?.logo,
          },
          items: pagosRegistrados,
        };
      });

      revalidatePath(REVALIDATE_PATH);
      revalidatePath(`/gestion/estudiantes/${values.estudianteId}`);
      revalidatePath("/gestion/matriculas");

      return {
        success: `Cobro de S/ ${result.totalCobrado.toFixed(2)} registrado con éxito (${result.numeroBoleta})`,
        data: result,
      };
    } catch (error: any) {
      console.error("Error en registrarCobroRapidoPOSAction:", error);
      return { error: error.message || "No se pudo procesar la cobranza." };
    }
  },
  { roles: ["administrativo"] },
);

