"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Obtiene el perfil completo del padre/tutor para la página de perfil del portal
 */
export const getParentProfileAction = createSafeAction(
  z.object({ padreId: z.string().optional() }),
  async (_, session) => {
    try {
      const padreId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: padreId },
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          email: true,
          dni: true,
          telefono: true,
          telefonoEmergencia: true,
          direccion: true,
          distrito: true,
          provincia: true,
          departamento: true,
          fechaNacimiento: true,
          sexo: true,
          estadoCivil: true,
          nacionalidad: true,
          ocupacion: true,
          lugarTrabajo: true,
          gradoInstruccion: true,
          image: true,
          createdAt: true,
          hijosDeTutor: {
            include: {
              hijo: {
                select: {
                  id: true,
                  name: true,
                  apellidoPaterno: true,
                  apellidoMaterno: true,
                  image: true,
                  codigoEstudiante: true,
                  fechaNacimiento: true,
                  nivelAcademico: {
                    include: {
                      nivel: { select: { nombre: true } },
                      grado: { select: { nombre: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) return { error: "Usuario no encontrado" };

      return { success: serialize(user) };
    } catch (error) {
      console.error("Error fetching parent profile:", error);
      return { error: "No se pudo obtener el perfil" };
    }
  }
);

/**
 * Obtiene el perfil completo del docente para la página de perfil del portal
 */
export const getTeacherProfileAction = createSafeAction(
  z.object({ docenteId: z.string().optional() }),
  async (_, session) => {
    try {
      const docenteId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: docenteId },
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          email: true,
          dni: true,
          telefono: true,
          telefonoEmergencia: true,
          direccion: true,
          distrito: true,
          provincia: true,
          departamento: true,
          fechaNacimiento: true,
          sexo: true,
          nacionalidad: true,
          image: true,
          especialidad: true,
          titulo: true,
          colegioProfesor: true,
          fechaContratacion: true,
          tipoContrato: true,
          escalaMagisterial: true,
          gradoInstruccion: true,
          createdAt: true,
          role: true,
          cursosImpartidos: {
            where: { activo: true },
            include: {
              areaCurricular: { select: { nombre: true, color: true, icono: true } },
              nivelAcademico: {
                include: {
                  nivel: { select: { nombre: true } },
                  grado: { select: { nombre: true } },
                },
              },
            },
          },
        },
      });

      if (!user) return { error: "Docente no encontrado" };

      return { success: serialize(user) };
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      return { error: "No se pudo obtener el perfil del docente" };
    }
  }
);

/**
 * Actualiza el perfil del docente (solo campos permitidos)
 */
export const updateTeacherProfileAction = createSafeAction(
  z.object({
    telefono: z.string().nullable().optional(),
    telefonoEmergencia: z.string().nullable().optional(),
    direccion: z.string().nullable().optional(),
    distrito: z.string().nullable().optional(),
    provincia: z.string().nullable().optional(),
    departamento: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    especialidad: z.string().nullable().optional(),
    titulo: z.string().nullable().optional(),
    fechaNacimiento: z.date().nullable().optional(),
    sexo: z.string().nullable().optional(),
    estadoCivil: z.string().nullable().optional(),
    nacionalidad: z.string().nullable().optional(),
    contactoEmergencia: z.string().nullable().optional(),
    colegioProfesor: z.string().nullable().optional(),
    escalaMagisterial: z.string().nullable().optional(),
    tipoContrato: z.string().nullable().optional(),
    fechaContratacion: z.date().nullable().optional(),
    fechaIngreso: z.date().nullable().optional(),
    turno: z.string().nullable().optional(),
  }),
  async (values, session) => {
    try {
      const docenteId = session.user.id;

      const cleanData = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== undefined)
      );
      const user = await prisma.user.update({
        where: { id: docenteId },
        data: cleanData,
      });

      revalidatePath("/portal/perfil");
      return { success: serialize(user) };
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      return { error: "No se pudo actualizar el perfil" };
    }
  }
);

/**
 * Obtiene la información del usuario (padre) para el layout
 */
export const getParentUserAction = createSafeAction(
  z.object({ userId: z.string().optional() }),
  async (_, session) => {
    try {
      const userId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          mustChangePassword: true,
          role: true,
          name: true,
          email: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      });
      return { success: serialize(user) };
    } catch (error) {
      console.error("Error fetching parent user:", error);
      return { error: "No se pudo obtener la información del usuario" };
    }
  }
);
