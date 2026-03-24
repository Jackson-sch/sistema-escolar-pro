"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/storage";

// --- CATEGORÍAS ---

export async function getCategoriasUniformesAction() {
  try {
    const categorias = await prisma.categoriaUniforme.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return { data: JSON.parse(JSON.stringify(categorias)) };
  } catch (error) {
    console.error("Error fetching uniform categories:", error);
    return { error: "No se pudieron obtener las categorías" };
  }
}

// --- UNIFORMES ---

export async function getUniformesAction(categoriaId?: string) {
  try {
    const uniforms = await prisma.uniforme.findMany({
      where: {
        activo: true,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: {
        categoria: true,
        variantes: {
          include: {
            sede: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });
    return { data: JSON.parse(JSON.stringify(uniforms)) };
  } catch (error) {
    console.error("Error fetching uniforms:", error);
    return { error: "No se pudieron obtener los uniformes" };
  }
}

export async function upsertUniformeAction(data: any) {
  try {
    const { id, variantes, ...rest } = data;
    let uniforme;

    if (id) {
      uniforme = await prisma.uniforme.update({
        where: { id },
        data: rest,
      });
    } else {
      uniforme = await prisma.uniforme.create({
        data: {
          ...rest,
          variantes: {
            create:
              variantes?.map((v: any) => ({
                talla: v.talla,
                precio: v.precio,
                stock: v.stock,
                sedeId: v.sedeId,
              })) || [],
          },
        },
      });
    }

    if (id && variantes) {
      // 1. Obtener variantes actuales
      const currentVariantes = await prisma.varianteUniforme.findMany({
        where: { uniformeId: id },
      });

      // 2. Determinar cuáles eliminar (las que no vienen en el nuevo array)
      const incomingIds = variantes.map((v: any) => v.id).filter(Boolean);
      const toDelete = currentVariantes.filter(
        (cv) => !incomingIds.includes(cv.id),
      );

      if (toDelete.length > 0) {
        await prisma.varianteUniforme.deleteMany({
          where: { id: { in: toDelete.map((d) => d.id) } },
        });
      }

      // 3. Upsert de las que vienen
      for (const v of variantes) {
        if (v.id) {
          // Si tiene ID, actualizamos directamente por ID para mayor seguridad
          await prisma.varianteUniforme.update({
            where: { id: v.id },
            data: {
              talla: v.talla,
              precio: v.precio,
              stock: v.stock,
              sedeId: v.sedeId,
            },
          });
        } else {
          // Si no tiene ID, es nueva o intentamos por clave única
          await prisma.varianteUniforme.upsert({
            where: {
              uniformeId_talla_sedeId: {
                uniformeId: id,
                talla: v.talla,
                sedeId: v.sedeId,
              },
            },
            update: {
              precio: v.precio,
              stock: v.stock,
            },
            create: {
              uniformeId: id,
              talla: v.talla,
              precio: v.precio,
              stock: v.stock,
              sedeId: v.sedeId,
            },
          });
        }
      }
    }

    revalidatePath("/uniformes");
    return { data: JSON.parse(JSON.stringify(uniforme)) };
  } catch (error) {
    console.error("Error upserting uniform:", error);
    return { error: "No se pudo guardar el uniforme" };
  }
}

// --- VARIANTES E INVENTARIO ---

export async function getVariantesUniformeAction(
  uniformeId: string,
  sedeId?: string,
) {
  try {
    const variantes = await prisma.varianteUniforme.findMany({
      where: {
        uniformeId,
        ...(sedeId ? { sedeId } : {}),
      },
      include: {
        sede: true,
        uniforme: true,
      },
    });
    return { data: JSON.parse(JSON.stringify(variantes)) };
  } catch (error) {
    console.error("Error fetching variants:", error);
    return { error: "No se pudieron obtener las variantes" };
  }
}

export async function getTodasLasVariantesAction(filters?: {
  sedeId?: string;
  categoriaId?: string;
}) {
  try {
    const variantes = await prisma.varianteUniforme.findMany({
      where: {
        ...(filters?.sedeId ? { sedeId: filters.sedeId } : {}),
        ...(filters?.categoriaId
          ? { uniforme: { categoriaId: filters.categoriaId } }
          : {}),
      },
      include: {
        sede: true,
        uniforme: {
          include: {
            categoria: true,
          },
        },
      },
      orderBy: [{ uniforme: { nombre: "asc" } }, { talla: "asc" }],
    });
    return { data: JSON.parse(JSON.stringify(variantes)) };
  } catch (error) {
    console.error("Error fetching all variants:", error);
    return { error: "No se pudieron obtener las variantes de inventario" };
  }
}

export async function upsertVarianteUniformeAction(data: any) {
  try {
    const { id, ...rest } = data;
    let variante;

    if (id) {
      variante = await prisma.varianteUniforme.update({
        where: { id },
        data: rest,
      });
    } else {
      variante = await prisma.varianteUniforme.create({
        data: rest,
      });
    }

    revalidatePath("/uniformes");
    return { data: JSON.parse(JSON.stringify(variante)) };
  } catch (error) {
    console.error("Error upserting variant:", error);
    return { error: "No se pudo guardar la variante" };
  }
}

export async function registrarMovimientoInventarioAction(data: {
  varianteId: string;
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
  cantidad: number;
  motivo?: string;
  referencia?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Registrar movimiento
      const movimiento = await tx.movimientoInventario.create({
        data,
      });

      // Actualizar stock en la variante
      const factor = data.tipo === "ENTRADA" ? 1 : -1;
      const variante = await tx.varianteUniforme.update({
        where: { id: data.varianteId },
        data: {
          stock: {
            increment: data.cantidad * (data.tipo === "AJUSTE" ? 0 : factor),
            ...(data.tipo === "AJUSTE" ? { set: data.cantidad } : {}),
          },
        },
      });

      return { movimiento, variante };
    });

    revalidatePath("/uniformes");
    return { data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error("Error recording inventory movement:", error);
    return { error: "No se pudo registrar el movimiento de inventario" };
  }
}

// --- VENTAS Y RESERVAS ---

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
    return { data: JSON.parse(JSON.stringify(ventas)) };
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

    // Generar código único básico
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
    return { data: JSON.parse(JSON.stringify(venta)) };
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

      // 1. Buscar o crear concepto de pago
      let concepto = await tx.conceptoPago.findFirst({
        where: { nombre: "Uniforme Escolar" },
      });

      if (!concepto) {
        // Necesitamos una institución para el concepto. Usamos la del estudiante.
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

      // 2. Crear CronogramaPago
      const cronograma = await tx.cronogramaPago.create({
        data: {
          estudianteId: venta.estudianteId,
          conceptoId: concepto.id,
          monto: venta.total,
          fechaVencimiento: new Date(), // Vence hoy al aprobarse
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
    return { data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("Error approving sale:", error);
    return { error: error.message || "No se pudo aprobar la venta" };
  }
}

// --- PORTAL DE PADRES ---

export async function getPortalUniformesDataAction(padreId: string) {
  try {
    const [uniforms, categorias, sedes, relaciones] = await Promise.all([
      prisma.uniforme.findMany({
        where: { activo: true },
        include: {
          categoria: true,
          variantes: {
            include: { sede: true },
          },
          favoritos: {
            where: { userId: padreId },
            select: { id: true },
          },
          _count: {
            select: { favoritos: true },
          },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.categoriaUniforme.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.sede.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.relacionFamiliar.findMany({
        where: { padreTutorId: padreId },
        include: {
          hijo: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              image: true,
              nivelAcademico: {
                include: {
                  nivel: true,
                  grado: true,
                  sede: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const ventas = await prisma.ventaUniforme.findMany({
      where: { padreId },
      include: {
        estudiante: true,
        sede: true,
        detalles: {
          include: {
            variante: {
              include: { uniforme: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hijos = relaciones.map((r) => JSON.parse(JSON.stringify(r.hijo)));

    return {
      data: {
        uniforms: JSON.parse(JSON.stringify(uniforms)),
        categorias: JSON.parse(JSON.stringify(categorias)),
        sedes: JSON.parse(JSON.stringify(sedes)),
        hijos,
        ventas: JSON.parse(JSON.stringify(ventas)),
      },
    };
  } catch (error) {
    console.error("Error fetching portal uniform data:", error);
    return { error: "No se pudo cargar la información de uniformes" };
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

      // 1. Descontar stock para cada variante
      for (const detalle of venta.detalles) {
        await tx.varianteUniforme.update({
          where: { id: detalle.varianteId },
          data: {
            stock: { decrement: detalle.cantidad },
          },
        });

        // Registrar movimiento de inventario
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
    return { data: JSON.parse(JSON.stringify(result)) };
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
    return { data: JSON.parse(JSON.stringify(venta)) };
  } catch (error) {
    console.error("Error updating uniform sale status:", error);
    return { error: "No se pudo actualizar el estado de la venta" };
  }
}
export async function toggleFavoritoUniformeAction(
  userId: string,
  uniformeId: string,
) {
  try {
    const existing = await prisma.favoritoUniforme.findUnique({
      where: {
        userId_uniformeId: {
          userId,
          uniformeId,
        },
      },
    });

    if (existing) {
      await prisma.favoritoUniforme.delete({
        where: { id: existing.id },
      });
      revalidatePath("/portal/uniformes");
      return { data: { active: false } };
    } else {
      await prisma.favoritoUniforme.create({
        data: {
          userId,
          uniformeId,
        },
      });
      revalidatePath("/portal/uniformes");
      return { data: { active: true } };
    }
  } catch (error) {
    console.error("Error toggling uniform favorite:", error);
    return { error: "No se pudo actualizar favoritos" };
  }
}
export async function deleteUniformeAction(id: string) {
  try {
    const uniforme = await prisma.uniforme.findUnique({
      where: { id },
      select: { imagen: true },
    });

    if (!uniforme) {
      return { error: "Uniforme no encontrado" };
    }

    // 1. Eliminar de la base de datos
    await prisma.uniforme.delete({
      where: { id },
    });

    // 2. Eliminar imagen física (si existe)
    if (uniforme.imagen) {
      await deleteFile(uniforme.imagen);
    }

    revalidatePath("/uniformes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting uniform:", error);
    return {
      error:
        "No se pudo eliminar el uniforme. Verifique que no tenga pedidos asociados.",
    };
  }
}
