"use server";

import prisma from "@/lib/prisma";

/**
 * Obtiene el resumen de asistencia de un estudiante para un mes y año específicos
 */
export async function getStudentMonthAttendanceAction(estudianteId: string, mes: number, anio: number) {
  try {
    const startDate = new Date(anio, mes, 1);
    const endDate = new Date(anio, mes + 1, 0, 23, 59, 59, 999);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        estudianteId,
        fecha: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        curso: true,
      },
      orderBy: { fecha: "asc" },
    });

    return { data: JSON.parse(JSON.stringify(asistencias)) };
  } catch (error) {
    console.error("Error fetching student month attendance:", error);
    return { error: "No se pudo obtener la asistencia mensual" };
  }
}

/**
 * Obtiene los anuncios y eventos dirigidos a un estudiante específico (según su nivel y grado)
 */
export async function getPortalCommunicationsAction(estudianteId: string) {
  try {
    const estudiante = await prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        nivelAcademico: true,
      },
    });

    if (!estudiante) return { error: "Estudiante no encontrado" };

    const nivelId = estudiante.nivelAcademico?.nivelId;
    const gradoId = estudiante.nivelAcademico?.gradoId;

    const [anuncios, eventos] = await Promise.all([
      prisma.anuncio.findMany({
        where: {
          activo: true,
          OR: [
            { dirigidoA: "TODOS" },
            { niveles: { some: { id: nivelId } } },
            { grados: { some: { id: gradoId } } },
          ],
        },
        include: {
          autor: {
            select: { name: true, apellidoPaterno: true, image: true },
          },
        },
        orderBy: [{ fijado: "desc" }, { fechaPublicacion: "desc" }],
      }),
      prisma.evento.findMany({
        where: {
          estado: "programado",
          OR: [
            { publico: true },
            { niveles: { some: { id: nivelId } } },
            { grados: { some: { id: gradoId } } },
          ],
        },
        include: {
          organizador: {
            select: { name: true, image: true },
          },
        },
        orderBy: { fechaInicio: "asc" },
      }),
    ]);

    return {
      data: {
        anuncios: JSON.parse(JSON.stringify(anuncios)),
        eventos: JSON.parse(JSON.stringify(eventos)),
      },
    };
  } catch (error) {
    console.error("Error fetching portal communications:", error);
    return { error: "No se pudieron obtener las comunicaciones" };
  }
}

/**
 * Obtiene el horario semanal de un estudiante
 */
export async function getStudentScheduleAction(estudianteId: string) {
  try {
    const estudiante = await prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        nivelAcademico: true,
      },
    });

    if (!estudiante?.nivelAcademicoId) return { error: "Estudiante no tiene sección asignada" };

    const horarios = await prisma.horario.findMany({
      where: {
        curso: {
          nivelAcademicoId: estudiante.nivelAcademicoId,
        },
      },
      include: {
        curso: {
          include: {
            areaCurricular: true,
            profesor: {
              select: { name: true, apellidoPaterno: true },
            },
          },
        },
      },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    });

    return { data: JSON.parse(JSON.stringify(horarios)) };
  } catch (error) {
    console.error("Error fetching student schedule:", error);
    return { error: "No se pudo obtener el horario" };
  }
}
