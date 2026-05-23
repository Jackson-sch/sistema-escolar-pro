"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/dto";
import { auth } from "@/auth";

/**
 * Obtiene estadísticas de asistencia para un dashboard
 */
export async function getAsistenciaStatsAction(nivelAcademicoId?: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "No autorizado" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = await prisma.asistencia.count({
      where: {
        estudiante: { institucionId: session.user.institucionId || undefined },
        fecha: { gte: today },
        ...(nivelAcademicoId ? { curso: { nivelAcademicoId } } : {}),
      },
    });

    const presentes = await prisma.asistencia.count({
      where: {
        estudiante: { institucionId: session.user.institucionId || undefined },
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
 * Obtiene alumnos con alertas de inasistencia (falla mayor al 15%)
 */
export async function getAttendanceAlertsAction(
  anioAcademico: number,
  seccionId?: string,
  nivelId?: string,
  gradoId?: string,
) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "No autorizado" };
    
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
        institucionId: session.user.institucionId || undefined,
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

    return { data: serialize(alertas) };
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
      data: serialize(summary),
      stats: {
        current: currAgg,
        previous: prevAgg,
        deltaAsistencia: currAgg.perc - prevAgg.perc,
        deltaTardanza: currAgg.tasaTardanza - prevAgg.tasaTardanza,
      },
      trendData: serialize(trendData),
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
