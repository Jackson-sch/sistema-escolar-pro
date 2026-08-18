"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { sendEmailAction } from "@/actions/email";
import { sendSmsAction } from "@/actions/sms";
import { auth } from "@/auth";
import { createSafeAction } from "@/lib/safe-action";


/**
 * Obtiene la asistencia de una sección para una fecha específica
 */
export const getAsistenciaAction = createSafeAction(
  z.object({
    nivelAcademicoId: z.string(),
    fecha: z.date(),
  }),
  async ({ nivelAcademicoId, fecha }: { nivelAcademicoId: string; fecha: Date }) => {
    try {
      // Normalizar fecha a inicio del día
      const startOfDay = new Date(fecha);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(fecha);
      endOfDay.setHours(23, 59, 59, 999);

      // Buscar si la sección tiene cursos asignados para obtener el cursoId
      const curso = await prisma.curso.findFirst({
        where: { nivelAcademicoId },
      });

      // Obtener alumnos matriculados en esta sección
      const alumnos = await prisma.user.findMany({
        where: {
          role: "estudiante",
          OR: [
            { nivelAcademicoId },
            {
              matriculas: {
                some: {
                  nivelAcademicoId,
                  estado: "activo",
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          image: true,
          asistencias: {
            where: {
              fecha: {
                gte: startOfDay,
                lte: endOfDay,
              },
              ...(curso?.id ? { cursoId: curso.id } : {}),
            },
          },
        },
        orderBy: {
          apellidoPaterno: "asc",
        },
      });

      return { success: { data: serialize(alumnos), cursoId: curso?.id } };
    } catch (error) {
      console.error("Error fetching asistencia:", error);
      return { error: "No se pudo obtener el registro de asistencia" };
    }
  }
);

/**
 * Registra o actualiza la asistencia masiva
 */
export const upsertAsistenciaAction = createSafeAction(
  z.array(z.object({
    estudianteId: z.string(),
    cursoId: z.string(),
    fecha: z.date(),
    presente: z.boolean(),
    tardanza: z.boolean(),
    justificada: z.boolean(),
    justificacion: z.string().optional(),
  })),
  async (asistencias: any[]) => {
    try {
      if (asistencias.length === 0) return { success: serialize([]) };

      // Establecer rango del día para la primera asistencia
      const baseDate = asistencias[0].fecha;
      const startOfDay = new Date(baseDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(baseDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Obtener los estudiantes IDs para filtrar
      const estudianteIds = asistencias.map((a: any) => a.estudianteId);
      
      // Buscar los existentes en bloque
      const existentes = await prisma.asistencia.findMany({
        where: {
          estudianteId: { in: estudianteIds },
          fecha: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const operaciones = asistencias.map((asist: any) => {
        const existing = existentes.find(
          e => e.estudianteId === asist.estudianteId && e.cursoId === asist.cursoId
        );

        if (existing) {
          return prisma.asistencia.update({
            where: { id: existing.id },
            data: {
              presente: asist.presente,
              tardanza: asist.tardanza,
              justificada: asist.justificada,
              justificacion: asist.justificacion,
              horaLlegada: (asist.presente && !existing.horaLlegada) 
                ? new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" }) 
                : existing.horaLlegada,
            },
          });
        } else {
          return prisma.asistencia.create({
            data: {
              estudianteId: asist.estudianteId,
              cursoId: asist.cursoId,
              fecha: startOfDay,
              presente: asist.presente,
              tardanza: asist.tardanza,
              justificada: asist.justificada,
              justificacion: asist.justificacion,
              horaLlegada: asist.presente 
                ? new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" }) 
                : null,
            },
          });
        }
      });

      // Ejecutar todas las creaciones/actualizaciones en una transacción atómica
      const results = await prisma.$transaction(operaciones);

      revalidatePath("/asistencia");

      // Notificaciones asíncronas... (sin cambios en la lógica interna)
      const inasistenciasInjustificadas = asistencias.filter((a: any) => !a.presente && !a.justificada);
      if (inasistenciasInjustificadas.length > 0) {
        Promise.allSettled(
          inasistenciasInjustificadas.map(async (asist: any) => {
            const studentInfo = await prisma.user.findUnique({
              where: { id: asist.estudianteId },
              include: { padresTutores: { include: { padreTutor: true } } }
            });
            if (studentInfo) {
              const padre = studentInfo.padresTutores[0]?.padreTutor;
              if (padre?.email) {
                await sendEmailAction({
                  to: padre.email,
                  subject: "Alerta de Inasistencia",
                  nombre: `${padre.name} ${padre.apellidoPaterno || ''}`.trim(),
                  mensaje: `Informamos que ${studentInfo.name} ha faltado a clase el día de hoy.`,
                  accionLabel: "Ver Portal",
                  accionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal`
                });
              }
            }
          })
        ).catch(console.error);
      }

      return {
        success: serialize(results),
      };
    } catch (error) {
      console.error("Error upserting asistencia:", error);
      return { error: "No se pudo guardar la asistencia" };
    }
  }
);
