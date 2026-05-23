"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";

/**
 * Obtiene el reporte mensual de asistencia para una sección
 */
export async function getMonthlyAsistenciaReportAction(
  seccionId: string,
  mes: number,
  anio: number,
) {
  try {
    const startDate = new Date(anio, mes, 1);
    const endDate = new Date(anio, mes + 1, 0, 23, 59, 59, 999);

    // Obtener alumnos matriculados en esta sección
    const alumnos = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: seccionId,
        matriculas: {
          some: {
            estado: "activo",
          },
        },
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        asistencias: {
          where: {
            fecha: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            fecha: true,
            presente: true,
            tardanza: true,
            justificada: true,
          },
        },
      },
      orderBy: {
        apellidoPaterno: "asc",
      },
    });

    return {
      data: serialize(alumnos),
      meta: {
        totalDias: endDate.getDate(),
        mes,
        anio,
      },
    };
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return { error: "No se pudo obtener el reporte mensual" };
  }
}

/**
 * Obtiene el historial anual de un estudiante
 */
export async function getStudentAnnualAttendanceAction(
  estudianteId: string,
  anio: number,
) {
  try {
    const asistencias = await prisma.asistencia.findMany({
      where: {
        estudianteId,
        fecha: {
          gte: new Date(anio, 0, 1),
          lte: new Date(anio, 11, 31),
        },
      },
      orderBy: { fecha: "asc" },
    });

    // Agrupar por mes
    const summary = Array.from({ length: 12 }, (_, i) => {
      const mesAsis = asistencias.filter(
        (a) => new Date(a.fecha).getMonth() === i,
      );
      return {
        mes: i,
        presentes: mesAsis.filter(
          (a) => a.presente && !a.tardanza && !a.justificada,
        ).length,
        ausentes: mesAsis.filter((a) => !a.presente && !a.justificada).length,
        tardanzas: mesAsis.filter((a) => a.tardanza).length,
        justificadas: mesAsis.filter((a) => a.justificada).length,
      };
    });

    return { data: serialize(summary) };
  } catch (error) {
    console.error("Error student annual attendance:", error);
    return { error: "No se pudo obtener el historial anual" };
  }
}

/**
 * Obtiene la lista de justificaciones registradas
 */
export async function getJustificacionesAction(
  anio: number,
  seccionId?: string,
  nivelId?: string,
  gradoId?: string,
) {
  try {
    const justificaciones = await prisma.asistencia.findMany({
      where: {
        justificada: true,
        fecha: {
          gte: new Date(anio, 0, 1),
          lte: new Date(anio, 11, 31),
        },
        estudiante: {
          nivelAcademicoId: seccionId && seccionId !== "all" ? seccionId : undefined,
          nivelAcademico: (!seccionId || seccionId === "all") ? {
            nivelId: nivelId || undefined,
            gradoId: gradoId || undefined,
          } : undefined,
        },
      },
      include: {
        estudiante: {
          select: {
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            nivelAcademico: {
              include: {
                grado: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const data = justificaciones.map((j) => ({
      id: j.id,
      fecha: j.fecha,
      estudiante: `${j.estudiante.apellidoPaterno} ${j.estudiante.apellidoMaterno}, ${j.estudiante.name}`,
      seccion: `${j.estudiante.nivelAcademico?.grado.nombre} "${j.estudiante.nivelAcademico?.seccion}"`,
      justificacion: j.justificacion || "Sin detalle",
    }));

    return { data: serialize(data) };
  } catch (error) {
    console.error("Error fetching justifications:", error);
    return { error: "No se pudo obtener el reporte de justificaciones" };
  }
}
