"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVentasUniformesAction(filters: {
  estudianteId?: string;
  sedeId?: string;
  estado?: string;
}) {
  try {
    const ventas = await prisma.ventaUniforme.findMany({
      where: {
        ...(filters.estudianteId ? { estudianteId: filters.estudianteId } : {}),
        ...(filters.sedeId ? { sedeId: filters.sedeId } : {}),
        ...(filters.estado ? { estado: filters.estado as any } : {}),
      },
      include: {
        estudiante: true,
        sede: true,
        detalles: {
          include: {
            variante: {
              include: {
                uniforme: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { data: serialize(ventas) };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { error: "No se pudieron obtener las ventas" };
  }
}

export async function crearReservaUniformeAction(data: {
  estudianteId: string;
  padreId: string;
  sedeId: string;
  detalles: {
    varianteId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}) {
  try {
    const total = data.detalles.reduce(
      (acc, d) => acc + d.cantidad * d.precioUnitario,
      0,
    );

    const count = await prisma.ventaUniforme.count();
    const codigo = `VU-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const venta = await prisma.ventaUniforme.create({
      data: {
        codigo,
        estudianteId: data.estudianteId,
        padreId: data.padreId,
        sedeId: data.sedeId,
        total,
        estado: "RESERVADO",
        detalles: {
          create: data.detalles.map((d) => ({
            varianteId: d.varianteId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.cantidad * d.precioUnitario,
          })),
        },
      },
    });

    revalidatePath("/portal/uniformes");
    return { data: serialize(venta) };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return { error: "No se pudo crear la reserva" };
  }
}

export async function aprobarVentaUniformeAction(
  ventaId: string,
  adminId: string,
) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const venta = await tx.ventaUniforme.findUnique({
        where: { id: ventaId },
        include: { detalles: true },
      });

      if (!venta) throw new Error("Venta no encontrada");
      if (venta.estado !== "RESERVADO" && venta.estado !== "EN_PRUEBA") {
        throw new Error("La venta no está en un estado que permita aprobación");
      }

      let concepto = await tx.conceptoPago.findFirst({
        where: { nombre: "Uniforme Escolar" },
      });

      if (!concepto) {
        const estudiante = await tx.user.findUnique({
          where: { id: venta.estudianteId },
        });
        if (!estudiante?.institucionId)
          throw new Error("Estudiante sin institución");

        concepto = await tx.conceptoPago.create({
          data: {
            nombre: "Uniforme Escolar",
            montoSugerido: 0,
            institucionId: estudiante.institucionId,
          },
        });
      }

      const cronograma = await tx.cronogramaPago.create({
        data: {
          estudianteId: venta.estudianteId,
          conceptoId: concepto.id,
          monto: venta.total,
          fechaVencimiento: new Date(),
          pagado: false,
        },
      });

      const ventaActualizada = await tx.ventaUniforme.update({
        where: { id: ventaId },
        data: {
          estado: "APROBADO",
          aprobadoPorId: adminId,
          aprobadoEn: new Date(),
          cronogramaPagoId: cronograma.id,
        },
        include: {
          estudiante: {
            include: {
              nivelAcademico: {
                include: {
                  grado: true,
                  nivel: true,
                },
              },
            },
          },
          sede: true,
          detalles: {
            include: {
              variante: {
                include: { uniforme: true },
              },
            },
          },
        },
      });

      return { venta: ventaActualizada, cronograma };
    });

    revalidatePath("/uniformes");
    return { data: serialize(result) };
  } catch (error: any) {
    console.error("Error approving sale:", error);
    return { error: error.message || "No se pudo aprobar la venta" };
  }
}

export async function confirmarEntregaUniformeAction(ventaId: string) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const venta = await tx.ventaUniforme.findUnique({
        where: { id: ventaId },
        include: { detalles: true },
      });

      if (!venta) throw new Error("Venta no encontrada");
      if (venta.estado !== "APROBADO" && venta.estado !== "PAGADO") {
        throw new Error(
          "Solo se pueden entregar uniformes aprobados o pagados",
        );
      }

      for (const detalle of venta.detalles) {
        await tx.varianteUniforme.update({
          where: { id: detalle.varianteId },
          data: {
            stock: { decrement: detalle.cantidad },
          },
        });

        await tx.movimientoInventario.create({
          data: {
            varianteId: detalle.varianteId,
            tipo: "SALIDA",
            cantidad: detalle.cantidad,
            motivo: `Entrega de pedido ${venta.codigo}`,
            referencia: venta.id,
          },
        });
      }

      const ventaActualizada = await tx.ventaUniforme.update({
        where: { id: ventaId },
        data: {
          estado: "ENTREGADO",
          updatedAt: new Date(),
        },
        include: {
          estudiante: {
            include: {
              nivelAcademico: {
                include: {
                  grado: true,
                  nivel: true,
                },
              },
            },
          },
          sede: true,
          detalles: {
            include: {
              variante: {
                include: { uniforme: true },
              },
            },
          },
        },
      });

      return ventaActualizada;
    });

    revalidatePath("/uniformes");
    return { data: serialize(result) };
  } catch (error: any) {
    console.error("Error confirming delivery:", error);
    return { error: error.message || "No se pudo confirmar la entrega" };
  }
}

export async function actualizarEstadoVentaUniformeAction(
  ventaId: string,
  nuevoEstado:
    | "RESERVADO"
    | "EN_PRUEBA"
    | "APROBADO"
    | "PAGADO"
    | "ENTREGADO"
    | "CANCELADO",
) {
  try {
    const venta = await prisma.ventaUniforme.update({
      where: { id: ventaId },
      data: {
        estado: nuevoEstado,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/uniformes");
    return { data: serialize(venta) };
  } catch (error) {
    console.error("Error updating uniform sale status:", error);
    return { error: "No se pudo actualizar el estado de la venta" };
  }
}
