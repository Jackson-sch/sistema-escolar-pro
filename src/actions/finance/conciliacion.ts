"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface TransaccionBancariaItem {
  identificador: string; // DNI o Código de Estudiante
  monto: number;
  referencia: string; // N° de operación bancaria
  fecha?: string;
  canal?: string; // BCP, BBVA, Interbank, Yape, etc.
}

export interface ConciliacionResult {
  totalProcesados: number;
  exitosos: number;
  noEncontrados: number;
  montoTotalConciliado: number;
  detalles: Array<{
    identificador: string;
    estudianteNombre?: string;
    referencia: string;
    monto: number;
    estado: "CONCILIADO" | "ERROR" | "NO_ENCONTRADO" | "DEUDA_INSUFICIENTE";
    mensaje: string;
  }>;
}

/**
 * Procesa en lote una lista de transacciones bancarias conciliándolas con
 * los cronogramas de pago pendientes de los estudiantes.
 */
export async function conciliarTransaccionesBancariasAction(
  transacciones: TransaccionBancariaItem[]
): Promise<{ success?: boolean; data?: ConciliacionResult; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;
    if (!transacciones || transacciones.length === 0) {
      return { error: "No se enviaron transacciones para conciliar" };
    }

    const resultado: ConciliacionResult = {
      totalProcesados: transacciones.length,
      exitosos: 0,
      noEncontrados: 0,
      montoTotalConciliado: 0,
      detalles: [],
    };

    for (const txItem of transacciones) {
      const cleanIdentificador = txItem.identificador.trim();
      const monto = Number(txItem.monto);

      if (!cleanIdentificador || isNaN(monto) || monto <= 0) {
        resultado.detalles.push({
          identificador: cleanIdentificador,
          referencia: txItem.referencia,
          monto,
          estado: "ERROR",
          mensaje: "Datos de transacción inválidos (monto o ID incorrectos)",
        });
        continue;
      }

      // 1. Buscar estudiante por DNI o código
      const estudiante = await prisma.user.findFirst({
        where: {
          role: "estudiante",
          ...(institucionId ? { institucionId } : {}),
          OR: [
            { dni: cleanIdentificador },
            { codigoEstudiante: cleanIdentificador },
          ],
        },
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          institucionId: true,
        },
      });

      if (!estudiante) {
        resultado.noEncontrados++;
        resultado.detalles.push({
          identificador: cleanIdentificador,
          referencia: txItem.referencia,
          monto,
          estado: "NO_ENCONTRADO",
          mensaje: `No se encontró estudiante con DNI/Código ${cleanIdentificador}`,
        });
        continue;
      }

      const nombreCompleto = `${estudiante.apellidoPaterno || ""} ${estudiante.apellidoMaterno || ""} ${estudiante.name || ""}`.trim();

      // 2. Buscar cronogramas pendientes más antiguos
      const cronogramaPendiente = await prisma.cronogramaPago.findFirst({
        where: {
          estudianteId: estudiante.id,
          pagado: false,
        },
        orderBy: {
          fechaVencimiento: "asc",
        },
        include: {
          concepto: true,
        },
      });

      if (!cronogramaPendiente) {
        resultado.detalles.push({
          identificador: cleanIdentificador,
          estudianteNombre: nombreCompleto,
          referencia: txItem.referencia,
          monto,
          estado: "DEUDA_INSUFICIENTE",
          mensaje: "El estudiante no registra deudas pendientes por conciliar",
        });
        continue;
      }

      // 3. Ejecutar pago dentro de transacción
      await prisma.$transaction(async (tx) => {
        const nuevoMontoPagado = Number(cronogramaPendiente.montoPagado) + monto;
        const estaPagado = nuevoMontoPagado >= Number(cronogramaPendiente.monto);

        await tx.cronogramaPago.update({
          where: { id: cronogramaPendiente.id },
          data: {
            montoPagado: nuevoMontoPagado,
            pagado: estaPagado,
            updatedAt: new Date(),
          },
        });

        await tx.pago.create({
          data: {
            estudianteId: estudiante.id,
            cronogramaPagoId: cronogramaPendiente.id,
            concepto: cronogramaPendiente.concepto.nombre,
            monto: monto,
            metodoPago: txItem.canal || "Transferencia / Conciliación Bancaria",
            referenciaPago: txItem.referencia,
            fechaVencimiento: cronogramaPendiente.fechaVencimiento,
            fechaPago: txItem.fecha ? new Date(txItem.fecha) : new Date(),
            estado: "completado",
            observaciones: `Conciliado automáticamente por lote. Ref: ${txItem.referencia}`,
          },
        });

        await tx.auditLog.create({
          data: {
            usuarioId: session.user.id,
            usuarioNombre: session.user.name || "Administrador",
            usuarioEmail: session.user.email,
            institucionId: estudiante.institucionId || institucionId,
            accion: "CONCILIACION_BANCARIA",
            entidad: "Pago",
            detalles: {
              estudianteId: estudiante.id,
              cronogramaId: cronogramaPendiente.id,
              monto,
              referencia: txItem.referencia,
              canal: txItem.canal,
            },
          },
        });
      });

      resultado.exitosos++;
      resultado.montoTotalConciliado += monto;
      resultado.detalles.push({
        identificador: cleanIdentificador,
        estudianteNombre: nombreCompleto,
        referencia: txItem.referencia,
        monto,
        estado: "CONCILIADO",
        mensaje: `Conciliado exitosamente para concepto "${cronogramaPendiente.concepto.nombre}"`,
      });
    }

    revalidatePath("/finanzas");
    return { success: true, data: resultado };
  } catch (error: any) {
    console.error("Error en conciliacion bancaria action:", error);
    return { error: error?.message || "Error al procesar la conciliación bancaria" };
  }
}
