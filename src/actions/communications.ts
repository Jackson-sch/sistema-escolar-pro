"use server";

import prisma from "@/lib/prisma";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { serialize } from "@/lib/dto";
import { revalidatePath } from "next/cache";

/**
 * Obtiene los logs de notificaciones filtrados por la institución actual
 */
export const getNotificationLogsAction = createSafeAction(
  z.object({
    page: z.number().optional().default(1),
    pageSize: z.number().optional().default(50),
    tipo: z.enum(["EMAIL", "SMS", "WHATSAPP", "ALL"]).optional(),
    estado: z.string().optional(),
  }),
  async ({ page, pageSize, tipo, estado }, session) => {
    try {
      const institucionId = session.user.institucionId;

      const where: any = {
        institucionId,
      };

      if (tipo && tipo !== "ALL") {
        where.tipo = tipo;
      }

      if (estado && estado !== "ALL") {
        where.estado = estado;
      }

      const [logs, total] = await Promise.all([
        prisma.notificationLog.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                apellidoPaterno: true,
                role: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.notificationLog.count({ where })
      ]);

      return { 
        success: { 
          logs: serialize(logs), 
          total,
          page,
          totalPages: Math.ceil(total / pageSize)
        } 
      };
    } catch (error) {
      console.error("Error fetching notification logs:", error);
      return { error: "No se pudieron obtener los logs de comunicaciones" };
    }
  },
  { roles: ["administrativo", "super_admin", "director", "admin", "coordinador"] }
);

/**
 * Obtiene todos los anuncios de la institución
 */
export const getAnunciosAction = createSafeAction(
  z.void(),
  async (_, session) => {
    try {
      const institucionId = session.user.institucionId;
      const anuncios = await prisma.anuncio.findMany({
        where: {
          autor: {
            institucionId
          }
        },
        include: {
          autor: {
            select: { name: true, image: true, role: true, apellidoPaterno: true }
          },
          grados: true,
          niveles: true,
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return { success: serialize(anuncios) };
    } catch (error) {
      console.error("Error fetching anuncios:", error);
      return { error: "No se pudieron obtener los anuncios" };
    }
  }
);

/**
 * Obtiene todos los eventos de la institución
 */
export const getEventosAction = createSafeAction(
  z.void(),
  async (_, session) => {
    try {
      const institucionId = session.user.institucionId;
      const eventos = await prisma.evento.findMany({
        where: {
          organizador: {
            institucionId
          }
        },
        include: {
          organizador: {
            select: { name: true, image: true }
          },
          grados: true,
          niveles: true,
        },
        orderBy: {
          fechaInicio: "asc"
        }
      });

      return { success: serialize(eventos) };
    } catch (error) {
      console.error("Error fetching eventos:", error);
      return { error: "No se pudieron obtener los eventos" };
    }
  }
);

/**
 * Crea o actualiza un anuncio
 */
export const upsertAnuncioAction = createSafeAction(
  z.object({
    titulo: z.string(),
    contenido: z.string(),
    resumen: z.string().optional().nullable(),
    imagen: z.string().optional().nullable(),
    dirigidoA: z.string(),
    importante: z.boolean().optional(),
    urgente: z.boolean().optional(),
    fijado: z.boolean().optional(),
    grados: z.array(z.string()).optional(),
    niveles: z.array(z.string()).optional(),
    id: z.string().optional(),
  }),
  async (values, session) => {
    try {
      const { id, grados, niveles, ...data } = values;
      const autorId = session.user.id;

      let anuncio;
      if (id) {
        anuncio = await prisma.anuncio.update({
          where: { id },
          data: {
            ...data,
            grados: grados ? { set: grados.map(id => ({ id })) } : undefined,
            niveles: niveles ? { set: niveles.map(id => ({ id })) } : undefined,
          }
        });
      } else {
        anuncio = await prisma.anuncio.create({
          data: {
            ...data,
            autorId,
            grados: grados ? { connect: grados.map(id => ({ id })) } : undefined,
            niveles: niveles ? { connect: niveles.map(id => ({ id })) } : undefined,
          }
        });
      }

      revalidatePath("/comunicaciones");
      revalidatePath("/portal/comunicaciones");

      return { success: id ? "Anuncio actualizado" : "Anuncio publicado", data: serialize(anuncio) };
    } catch (error) {
      console.error("Error upserting anuncio:", error);
      return { error: "No se pudo procesar el anuncio" };
    }
  }
);

/**
 * Crea o actualiza un evento (y publica anuncio automático)
 */
export const upsertEventoAction = createSafeAction(
  z.object({
    titulo: z.string(),
    descripcion: z.string().optional().nullable(),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    horaInicio: z.string().optional().nullable(),
    horaFin: z.string().optional().nullable(),
    ubicacion: z.string().optional().nullable(),
    tipo: z.string(),
    modalidad: z.string().optional().nullable(),
    publico: z.boolean().optional(),
    id: z.string().optional(),
  }),
  async (values, session) => {
    try {
      const { id, ...data } = values;
      const organizadorId = session.user.id;

      let evento;
      if (id) {
        evento = await prisma.evento.update({
          where: { id },
          data
        });
      } else {
        evento = await prisma.evento.create({
          data: {
            ...data,
            organizadorId
          }
        });

        // Al crear un evento nuevo, generar automáticamente un Anuncio para la lista de Anuncios
        const fechaFormateada = data.fechaInicio.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        await prisma.anuncio.create({
          data: {
            titulo: `Evento: ${data.titulo}`,
            contenido: data.descripcion || `Se ha programado el evento "${data.titulo}" para el ${fechaFormateada}${data.ubicacion ? ` en ${data.ubicacion}` : ''}.`,
            resumen: `Fecha: ${fechaFormateada} | Hora: ${data.horaInicio || '08:00'} | Lugar: ${data.ubicacion || 'Por definir'}`,
            dirigidoA: "TODOS",
            autorId: organizadorId,
            importante: false,
          }
        });
      }

      revalidatePath("/comunicaciones");
      revalidatePath("/portal/comunicaciones");

      return { success: id ? "Evento actualizado" : "Evento programado y publicado en Anuncios", data: serialize(evento) };
    } catch (error) {
      console.error("Error upserting evento:", error);
      return { error: "No se pudo procesar el evento" };
    }
  }
);

/**
 * Elimina un anuncio por su ID
 */
export const deleteAnuncioAction = createSafeAction(
  z.object({
    id: z.string(),
  }),
  async ({ id }) => {
    try {
      await prisma.anuncio.delete({
        where: { id },
      });

      revalidatePath("/comunicaciones");
      revalidatePath("/portal/comunicaciones");

      return { success: "Anuncio eliminado correctamente" };
    } catch (error) {
      console.error("Error deleting anuncio:", error);
      return { error: "No se pudo eliminar el anuncio" };
    }
  }
);

/**
 * Elimina un evento por su ID
 */
export const deleteEventoAction = createSafeAction(
  z.object({
    id: z.string(),
  }),
  async ({ id }) => {
    try {
      await prisma.evento.delete({
        where: { id },
      });

      revalidatePath("/comunicaciones");
      revalidatePath("/portal/comunicaciones");

      return { success: "Evento eliminado correctamente" };
    } catch (error) {
      console.error("Error deleting evento:", error);
      return { error: "No se pudo eliminar el evento" };
    }
  }
);

/**
 * Obtiene el detalle de un anuncio por ID
 */
export const getAnuncioByIdAction = createSafeAction(
  z.object({
    id: z.string(),
  }),
  async ({ id }) => {
    try {
      const anuncio = await prisma.anuncio.findUnique({
        where: { id },
        include: {
          autor: {
            select: {
              name: true,
              image: true,
              role: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            },
          },
          grados: true,
          niveles: true,
        },
      });

      if (!anuncio) {
        return { error: "Comunicado no encontrado" };
      }

      return { success: serialize(anuncio) };
    } catch (error) {
      console.error("Error fetching anuncio by ID:", error);
      return { error: "No se pudo obtener el detalle del comunicado" };
    }
  }
);


