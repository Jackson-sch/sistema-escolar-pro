"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { sendMultichannelNotificationAction } from "@/actions/notifications";

const REVALIDATE_PATH = "/gestion/estudiantes";

/**
 * Obtener categorías de incidentes/seguimiento
 */
export const getIncidentCategoriesAction = createSafeAction(
  z.object({}),
  async () => {
    try {
      const categories = await prisma.categoriaIncidente.findMany({
        orderBy: { nombre: "asc" },
      });
      return { success: categories };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { error: "No se pudieron cargar las categorías" };
    }
  }
);

/**
 * Crear una nueva categoría de incidente
 */
export const createIncidentCategoryAction = createSafeAction(
  z.object({
    nombre: z.string(),
    descripcion: z.string().optional(),
  }),
  async (values) => {
    try {
      const { nombre, descripcion } = values;

      const existing = await prisma.categoriaIncidente.findUnique({
        where: { nombre },
      });

      if (existing) {
        return { error: "La categoría ya existe" };
      }

      const category = await prisma.categoriaIncidente.create({
        data: {
          nombre,
          descripcion,
        },
      });

      revalidatePath(REVALIDATE_PATH);
      return { success: "Categoría creada correctamente", data: category };
    } catch (error) {
      console.error("Error creating incident category:", error);
      return { error: "No se pudo crear la categoría" };
    }
  },
  { roles: ["administrativo"] }
);

/**
 * Crear o Actualizar una Ficha Psicopedagógica / Registro Disciplinario
 */
export const upsertPsychopedagogicalAction = createSafeAction(
  z.object({
    values: z.any(),
    id: z.string().optional()
  }),
  async ({ values, id }, session) => {
    try {
      const {
        estudianteId,
        categoriaId,
        motivo,
        descripcion,
        recomendaciones,
        fecha,
        visibleParaPadres,
      } = values;

      // Validación de Seguridad: Verificar que el estudiante pertenece a la institución del usuario
      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId, institucionId: session.user.institucionId || undefined }
      });

      if (!estudiante) {
        return { error: "Estudiante no encontrado o fuera de su alcance institucional" };
      }

      const commonData = {
        motivo,
        descripcion,
        recomendaciones,
        visibleParaPadres: !!visibleParaPadres,
      };

      if (id) {
        await prisma.fichaPsicopedagogica.update({
          where: { id },
          data: {
            ...commonData,
            fecha: fecha ? new Date(fecha) : undefined,
            categoria: { connect: { id: categoriaId } },
          },
        });
      } else {
        await prisma.fichaPsicopedagogica.create({
          data: {
            ...commonData,
            fecha: fecha ? new Date(fecha) : new Date(),
            estudiante: { connect: { id: estudianteId } },
            especialista: { connect: { id: session.user.id } },
            categoria: { connect: { id: categoriaId } },
          },
        });

        // Alerta automática multicanal a los padres si el registro es visible para ellos
        if (visibleParaPadres) {
          const cat = await prisma.categoriaIncidente.findUnique({
            where: { id: categoriaId },
            select: { nombre: true },
          });
          const categoriaNombre = cat?.nombre || "Seguimiento Psicopedagógico";

          const subject = `Nuevo reporte psicopedagógico - ${estudiante.name}`;
          const message = `Estimado padre/tutor: Se ha ingresado un nuevo reporte psicopedagógico de tipo "${categoriaNombre}" para su menor hijo/a ${estudiante.name} ${estudiante.apellidoPaterno || ""}. Motivo: ${motivo}. Le sugerimos ingresar al portal escolar para revisar el detalle y las recomendaciones del especialista.`;

          sendMultichannelNotificationAction({
            studentId: estudianteId,
            subject,
            message,
            channels: ["EMAIL", "WHATSAPP"], // Canales preferentes por defecto
          }).catch((err) =>
            console.error("❌ Error en envío de alerta automática de conducta:", err)
          );
        }
      }

      revalidatePath(REVALIDATE_PATH);
      return { success: "Registro guardado correctamente" };
    } catch (error: any) {
      console.error("DEBUG: Error upserting psych record:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { error: `Error: ${errorMessage}` };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

/**
 * Eliminar un registro
 */
export const deletePsychopedagogicalAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, session) => {
    try {
      // Validar pertenencia vía estudiante e institución
      const record = await prisma.fichaPsicopedagogica.findUnique({
        where: { id },
        include: { estudiante: true }
      });

      if (!record || record.estudiante.institucionId !== session.user.institucionId) {
        return { error: "Registro no encontrado o sin permisos" };
      }

      await prisma.fichaPsicopedagogica.delete({
        where: { id },
      });
      revalidatePath(REVALIDATE_PATH);
      return { success: "Registro eliminado" };
    } catch (error) {
      console.error("Error deleting psych record:", error);
      return { error: "No se pudo eliminar el registro" };
    }
  },
  { roles: ["administrativo"] }
);

/**
 * Obtener el historial de un estudiante
 */
export const getStudentPsychHistoryAction = createSafeAction(
  z.object({ studentId: z.string() }),
  async ({ studentId }, session) => {
    try {
      // Validación de Seguridad: Solo personal autorizado o el padre del niño
      const esAdminProfesor = ["administrativo", "profesor"].includes(session.user.role || "");
      
      const esHijo = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: session.user.id, hijoId: studentId }
      });

      if (!esAdminProfesor && !esHijo) {
        return { error: "No tiene permiso para ver el historial de este estudiante" };
      }

      const history = await prisma.fichaPsicopedagogica.findMany({
        where: { 
          estudianteId: studentId,
          estudiante: { institucionId: session.user.institucionId || undefined },
          ...(esHijo ? { visibleParaPadres: true } : {})
        },
        include: {
          categoria: true,
          especialista: {
            select: {
              name: true,
              apellidoPaterno: true,
              image: true,
            },
          },
        },
        orderBy: { fecha: "desc" },
      });
      return { success: history };
    } catch (error) {
      console.error("Error fetching student psych history:", error);
      return { error: "No se pudo cargar el historial" };
    }
  }
);

/**
 * Obtener los registros disciplinarios visibles para los padres
 */
export const getStudentDisciplineRecordsForParentAction = createSafeAction(
  z.object({ studentId: z.string() }),
  async ({ studentId }, session) => {
    try {
      // Verificar que el estudiante pertenece al padre
      const esHijo = await prisma.relacionFamiliar.findFirst({
        where: {
          padreTutorId: session.user.id,
          hijoId: studentId,
        },
      });

      if (!esHijo) {
        return { error: "No autorizado para ver este estudiante" };
      }

      const records = await prisma.fichaPsicopedagogica.findMany({
        where: {
          estudianteId: studentId,
          visibleParaPadres: true,
        },
        include: {
          categoria: true,
          especialista: {
            select: {
              name: true,
              apellidoPaterno: true,
            },
          },
        },
        orderBy: { fecha: "desc" },
      });

      return { success: records };
    } catch (error) {
      console.error("Error fetching discipline records for parent:", error);
      return { error: "No se pudieron cargar los registros" };
    }
  }
);
