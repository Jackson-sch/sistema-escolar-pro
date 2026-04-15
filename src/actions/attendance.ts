"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Obtiene la asistencia de una sección para una fecha específica
 */
export async function getAsistenciaAction(
  nivelAcademicoId: string,
  fecha: Date,
) {
  try {
    // Normalizar fecha a inicio del día
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar si la sección tiene cursos asignados para obtener el cursoId
    // Nota: El esquema requiere un cursoId, así que usaremos el primero que encontremos
    const curso = await prisma.curso.findFirst({
      where: { nivelAcademicoId },
    });

    // Obtener alumnos matriculados en esta sección
    const alumnos = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId,
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

    return { data: JSON.parse(JSON.stringify(alumnos)), cursoId: curso?.id };
  } catch (error) {
    console.error("Error fetching asistencia:", error);
    return { error: "No se pudo obtener el registro de asistencia" };
  }
}

/**
 * Registra o actualiza la asistencia masiva
 */
export async function upsertAsistenciaAction(
  asistencias: {
    estudianteId: string;
    cursoId: string;
    fecha: Date;
    presente: boolean;
    tardanza: boolean;
    justificada: boolean;
    justificacion?: string;
  }[],
) {
  try {
    const results = await Promise.all(
      asistencias.map(async (asist) => {
        const startOfDay = new Date(asist.fecha);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(asist.fecha);
        endOfDay.setHours(23, 59, 59, 999);

        // Buscar si ya existe para ese día y curso
        const existing = await prisma.asistencia.findFirst({
          where: {
            estudianteId: asist.estudianteId,
            cursoId: asist.cursoId,
            fecha: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        if (existing) {
          return prisma.asistencia.update({
            where: { id: existing.id },
            data: {
              presente: asist.presente,
              tardanza: asist.tardanza,
              justificada: asist.justificada,
              justificacion: asist.justificacion,
            },
          });
        } else {
          return prisma.asistencia.create({
            data: {
              estudianteId: asist.estudianteId,
              cursoId: asist.cursoId,
              fecha: asist.fecha,
              presente: asist.presente,
              tardanza: asist.tardanza,
              justificada: asist.justificada,
              justificacion: asist.justificacion,
            },
          });
        }
      }),
    );

    revalidatePath("/asistencia");
    return {
      success: "Asistencia guardada correctamente",
      data: JSON.parse(JSON.stringify(results)),
    };
  } catch (error) {
    console.error("Error upserting asistencia:", error);
    return {
      error:
        "No se pudo guardar la asistencia (verifique si la sección tiene cursos asignados)",
    };
  }
}

/**
 * Obtiene estadísticas de asistencia para un dashboard
 */
export async function getAsistenciaStatsAction(nivelAcademicoId?: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = await prisma.asistencia.count({
      where: {
        fecha: { gte: today },
        ...(nivelAcademicoId ? { curso: { nivelAcademicoId } } : {}),
      },
    });

    const presentes = await prisma.asistencia.count({
      where: {
        presente: true,
        fecha: { gte: today },
        ...(nivelAcademicoId ? { curso: { nivelAcademicoId } } : {}),
      },
    });

    return { data: { total, presentes, ausentes: total - presentes } };
  } catch (error) {
    return { error: "Fallo al obtener estadísticas" };
  }
}

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
      data: JSON.parse(JSON.stringify(alumnos)),
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
 * Obtiene alumnos con alertas de inasistencia (falla mayor al 15%)
 */
export async function getAttendanceAlertsAction(
  anioAcademico: number,
  seccionId?: string,
  nivelId?: string,
  gradoId?: string,
) {
  try {
    const threshold = 0.15; // 15% de inasistencia

    // Obtener total de días lectivos registrados hasta hoy en el año
    const totalDiasRes = await prisma.asistencia.groupBy({
      by: ["fecha"],
      where: {
        fecha: {
          gte: new Date(anioAcademico, 0, 1),
          lte: new Date(anioAcademico + 1, 0, 0),
        },
      },
    });
    const totalDiasYear = totalDiasRes.length;

    if (totalDiasYear === 0) return { data: [], meta: { totalDias: 0 } };

    const alumnos = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: seccionId && seccionId !== "all" ? seccionId : undefined,
        nivelAcademico: (!seccionId || seccionId === "all") ? {
          nivelId: nivelId || undefined,
          gradoId: gradoId || undefined,
        } : undefined,
        matriculas: {
          some: {
            anioAcademico,
            estado: "activo",
          },
        },
      },
      include: {
        nivelAcademico: {
          include: {
            grado: true,
          },
        },
        asistencias: {
          where: {
            fecha: {
              gte: new Date(anioAcademico, 0, 1),
              lte: new Date(),
            },
          },
        },
      },
    });

    const alertas = alumnos
      .map((alumno) => {
        const faltas = alumno.asistencias.filter(
          (a: any) => !a.presente && !a.justificada,
        ).length;
        const porcentajeFaltas =
          totalDiasYear > 0 ? (faltas / totalDiasYear) * 100 : 0;

        return {
          id: alumno.id,
          nombre: `${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`,
          seccion: `${alumno.nivelAcademico?.grado.nombre} "${alumno.nivelAcademico?.seccion}"`,
          faltas,
          totalDias: totalDiasYear,
          porcentaje: Number(porcentajeFaltas.toFixed(2)),
        };
      })
      .filter((a) => a.porcentaje >= threshold * 100)
      .sort((a, b) => b.porcentaje - a.porcentaje);

    return { data: JSON.parse(JSON.stringify(alertas)) };
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return { error: "Fallo al obtener alertas" };
  }
}

/**
 * Obtiene el resumen institucional de asistencia para una fecha o periodo específico
 */
export async function getInstitutionalSummaryAction(
  fecha: Date,
  nivelId?: string,
  gradoId?: string,
  mes?: number,
  anio?: number,
  scope: "today" | "month" | "year" = "today",
) {
  try {
    const now = new Date();
    let start, end, prevStart, prevEnd;

    if (scope === "year") {
      const year = anio || now.getFullYear();
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31, 23, 59, 59, 999);
      prevStart = new Date(year - 1, 0, 1);
      prevEnd = new Date(year - 1, 11, 31, 23, 59, 59, 999);
    } else if (scope === "month") {
      const year = anio || now.getFullYear();
      const month = mes ?? now.getMonth();
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      prevStart = new Date(year, month - 1, 1);
      prevEnd = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - 1);
    }

    // 1. Obtener secciones activas
    const sections = await prisma.nivelAcademico.findMany({
      where: {
        nivelId: nivelId || undefined,
        gradoId: gradoId || undefined,
        anioAcademico: anio || now.getFullYear(),
        activo: true,
      },
      include: {
        grado: true,
        nivel: true,
      },
    });

    const sectionIds = sections.map(s => s.id);

    // 2. Obtener asistencias del periodo actual y anterior en UNA sola consulta
    const allAsistencias = await prisma.asistencia.findMany({
      where: {
        estudiante: { nivelAcademicoId: { in: sectionIds } },
        fecha: { gte: prevStart, lte: end },
      },
      select: {
        id: true,
        fecha: true,
        presente: true,
        tardanza: true,
        estudiante: { select: { nivelAcademicoId: true } },
      },
    });

    // 3. Obtener matriculas actuales
    const matriculas = await prisma.matricula.findMany({
      where: {
        nivelAcademicoId: { in: sectionIds },
        estado: "activo",
        anioAcademico: anio || now.getFullYear(),
      },
      select: { nivelAcademicoId: true },
    });

    // Mapear matriculados por sección para acceso rápido
    const matriculadosMap = matriculas.reduce((acc, curr) => {
      acc[curr.nivelAcademicoId] = (acc[curr.nivelAcademicoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 4. Procesar el resumen por sección
    const summary = sections.map((section) => {
      const currentAsist = allAsistencias.filter(
        a => a.estudiante.nivelAcademicoId === section.id && a.fecha >= start && a.fecha <= end
      );

      const matriculados = matriculadosMap[section.id] || 0;
      const totalAsistencias = currentAsist.length;
      const presentes = currentAsist.filter(a => a.presente).length;
      const tardanzasCount = currentAsist.filter(a => a.tardanza).length;

      const uniqueDays = new Set(
        currentAsist.map(a => a.fecha.toISOString().split("T")[0])
      ).size;

      return {
        id: section.id,
        nombre: `${section.grado.nombre} "${section.seccion}"`,
        nivelNombre: section.nivel.nombre,
        presentes: uniqueDays > 1 ? Math.round(presentes / uniqueDays) : presentes,
        tardanzas: uniqueDays > 1 ? Math.round(tardanzasCount / uniqueDays) : tardanzasCount,
        ausentes: uniqueDays > 1 
          ? Math.max(0, matriculados - Math.round(presentes / uniqueDays)) 
          : matriculados - presentes,
        total: matriculados,
        perc: matriculados > 0 && totalAsistencias > 0 ? (presentes / totalAsistencias) * 100 : 0,
        isPeriod: uniqueDays > 1,
      };
    });

    // 5. Calcular métricas consolidadas (Actual vs Anterior)
    const currentConsolidated = allAsistencias.filter(a => a.fecha >= start && a.fecha <= end);
    const prevConsolidated = allAsistencias.filter(a => a.fecha >= prevStart && a.fecha <= prevEnd);

    const getAggregated = (recs: any[]) => {
      const presentes = recs.filter(a => a.presente).length;
      const total = recs.length;
      const tardanzas = recs.filter(a => a.tardanza).length;
      return {
        presentes,
        tardanzas,
        perc: total > 0 ? (presentes / total) * 100 : 0,
        tasaTardanza: total > 0 ? (tardanzas / total) * 100 : 0
      };
    };

    const currAgg = getAggregated(currentConsolidated);
    const prevAgg = getAggregated(prevConsolidated);

    // 6. Generar TrendData para Recharts
    // Si es 'today', mostramos los últimos 7 días para que la gráfica tenga sentido
    let trendStart = start;
    if (scope === "today") {
      trendStart = new Date(start);
      trendStart.setDate(trendStart.getDate() - 7);
    }

    const trendAsistencias = await prisma.asistencia.findMany({
      where: {
        estudiante: { nivelAcademicoId: { in: sectionIds } },
        fecha: { gte: trendStart, lte: end },
      },
      select: { fecha: true, presente: true, tardanza: true },
    });

    const trendMap = new Map<string, { label: string, asistencia: number, tardanza: number, count: number, sortKey: string }>();

    trendAsistencias.forEach(a => {
      let key, label, sortKey;
      if (scope === "year") {
        const monthNum = a.fecha.getMonth();
        key = monthNum.toString();
        label = new Intl.DateTimeFormat("es-PE", { month: "short" }).format(a.fecha);
        sortKey = monthNum.toString().padStart(2, '0');
      } else {
        key = a.fecha.toISOString().split("T")[0];
        label = a.fecha.getDate().toString();
        sortKey = key;
      }

      const existing = trendMap.get(key) || { label, asistencia: 0, tardanza: 0, count: 0, sortKey };
      if (a.presente) existing.asistencia++;
      if (a.tardanza) existing.tardanza++;
      existing.count++;
      trendMap.set(key, existing);
    });

    const trendData = Array.from(trendMap.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(t => {
        const percAsist = (t.asistencia / (t.count || 1)) * 100;
        const percTard = (t.tardanza / (t.count || 1)) * 100;
        const percAusent = 100 - percAsist;
        return {
          label: t.label,
          asistencia: parseFloat(percAsist.toFixed(1)),
          tardanza: parseFloat(percTard.toFixed(1)),
          ausencia: parseFloat(percAusent.toFixed(1)),
        };
      });

    return {
      data: JSON.parse(JSON.stringify(summary)),
      stats: {
        current: currAgg,
        previous: prevAgg,
        deltaAsistencia: currAgg.perc - prevAgg.perc,
        deltaTardanza: currAgg.tasaTardanza - prevAgg.tasaTardanza,
      },
      trendData: JSON.parse(JSON.stringify(trendData)),
      meta: {
        isToday: scope === "today",
        scope,
        periodLabel: mes !== undefined && anio !== undefined
          ? `Mes de ${new Intl.DateTimeFormat("es-PE", { month: "long" }).format(new Date(anio, mes))}`
          : scope === "year" ? `Año Académico ${anio}` : "Registro de Hoy",
      },
    };
  } catch (error) {
    console.error("Error institutional summary:", error);
    return { error: "Fallo al obtener resumen institucional" };
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

    return { data: JSON.parse(JSON.stringify(summary)) };
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

    return { data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    console.error("Error fetching justifications:", error);
    return { error: "No se pudo obtener el reporte de justificaciones" };
  }
}
/**
 * Registra asistencia mediante QR (Usado en el scanner de entrada)
 */
export async function registerQRAsistenciaAction(dni: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1. Buscar estudiante por DNI
    const student = await prisma.user.findFirst({
      where: {
        dni,
        role: "estudiante",
      },
      include: {
        matriculas: {
          where: { estado: "activo" },
          include: { nivelAcademico: true },
          orderBy: { anioAcademico: "desc" },
          take: 1,
        },
      },
    });

    if (!student) return { error: "Estudiante no encontrado" };
    if (student.matriculas.length === 0)
      return { error: "Estudiante no cuenta con matrícula activa" };

    const matricula = student.matriculas[0];

    // 2. Determinar si hay tardanza mediante Polticas de Asistencia
    // Buscamos políticas aplicables: 1. Nivel + Turno, 2. Nivel, 3. Turno, 4. Global
    const [hEntradaFallback, mEntradaFallback] = (
      (
        await prisma.variableSistema.findUnique({
          where: { clave: "HORA_ENTRADA" },
        })
      )?.valor || "08:00"
    )
      .split(":")
      .map(Number);

    const [hSalidaFallback, mSalidaFallback] = (
      (
        await prisma.variableSistema.findUnique({
          where: { clave: "HORA_SALIDA" },
        })
      )?.valor || "13:00"
    )
      .split(":")
      .map(Number);

    // Intentar encontrar política específica
    const politica = await prisma.politicaAsistencia.findFirst({
      where: {
        institucionId: student.institucionId || undefined,
        activo: true,
        OR: [
          {
            nivelId: matricula.nivelAcademico.nivelId,
            turno: matricula.nivelAcademico.turno,
          },
          { nivelId: matricula.nivelAcademico.nivelId, turno: null },
          { nivelId: null, turno: matricula.nivelAcademico.turno },
        ],
      },
      orderBy: [
        { nivelId: "desc" }, // Priorizar los que tienen nivelId
        { turno: "desc" }, // Priorizar los que tienen turno
      ],
    });

    const hEntrada = politica
      ? parseInt(politica.horaEntrada.split(":")[0])
      : hEntradaFallback;
    const mEntrada = politica
      ? parseInt(politica.horaEntrada.split(":")[1])
      : mEntradaFallback;
    const tolerancia = politica?.tolerancia || 0;

    const checkTime = new Date();
    const limitTime = new Date();
    limitTime.setHours(hEntrada, mEntrada, 0, 0);

    // Aplicar tolerancia: si la entrada es 08:00 y tolerancia 10, el límite es 08:10
    if (tolerancia > 0) {
      limitTime.setMinutes(limitTime.getMinutes() + tolerancia);
    }

    const isTardanza = checkTime > limitTime;
    const horaLlegada = checkTime.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 3. Buscar el primer curso disponible para registrar la asistencia académica
    // (En una implementación ideal, esto sería un registro de ingreso general)
    const curso = await prisma.curso.findFirst({
      where: { nivelAcademicoId: matricula.nivelAcademicoId },
    });

    if (!curso)
      return {
        error: "No se encontró curso asignado para registrar la asistencia",
      };

    // 4. Registrar o actualizar la asistencia
    const existing = await prisma.asistencia.findFirst({
      where: {
        estudianteId: student.id,
        cursoId: curso.id,
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let result;
    if (existing) {
      // Si ya marcó hoy, no permitir marcar de nuevo para evitar spam
      if (existing.presente) {
        return {
          error: "El estudiante ya registró su asistencia el día de hoy",
          alreadyMarked: true,
          data: {
            student: {
              name: student.name,
              apellidoPaterno: student.apellidoPaterno,
              apellidoMaterno: student.apellidoMaterno,
              image: student.image,
              dni: student.dni,
            },
          },
        };
      }

      // Si existía (quizás marcado como ausente por el sistema temprano), lo ponemos como presente
      result = await prisma.asistencia.update({
        where: { id: existing.id },
        data: {
          presente: true,
          tardanza: isTardanza,
          horaLlegada: existing.horaLlegada || horaLlegada,
        },
      });
    } else {
      result = await prisma.asistencia.create({
        data: {
          estudianteId: student.id,
          cursoId: curso.id,
          fecha: new Date(), // Usar hora exacta del servidor
          presente: true,
          tardanza: isTardanza,
          horaLlegada: horaLlegada,
        },
      });
    }

    revalidatePath("/asistencia");
    return {
      success: "Asistencia registrada correctamente",
      data: {
        ...JSON.parse(JSON.stringify(result)),
        student: {
          name: student.name,
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          image: student.image,
          dni: student.dni,
        },
      },
    };
  } catch (error) {
    console.error("Error in QR attendance:", error);
    return { error: "Error al procesar el ingreso por QR" };
  }
}

/**
 * Obtiene los registros de asistencia más recientes para el scanner
 */
export async function getRecentAttendanceLogsAction() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const logs = await prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
        presente: true,
      },
      include: {
        estudiante: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      studentName: `${log.estudiante.name} ${log.estudiante.apellidoPaterno} ${log.estudiante.apellidoMaterno}`,
      dni: log.estudiante.dni,
      time:
        log.horaLlegada ||
        new Date(log.fecha).toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      status: log.tardanza ? "late" : "success",
      image: log.estudiante.image || undefined,
    }));

    return { data: JSON.parse(JSON.stringify(formattedLogs)) };
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    return { error: "Fallo al obtener el historial reciente" };
  }
}
