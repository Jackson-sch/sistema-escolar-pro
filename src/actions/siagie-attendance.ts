"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  generateSiagieAttendanceExcel,
  generateSiagieBulkAttendanceExcel,
} from "@/lib/excel";
import type {
  SiagieAttendanceExportParams,
  SiagieAttendanceSectionData,
  SiagieExportResult,
} from "@/components/evaluaciones/siagie/siagie-types";

async function fetchSectionAttendanceData(
  nivelAcademicoId: string,
  periodoId: string,
): Promise<SiagieAttendanceSectionData | null> {
  const seccion = await prisma.nivelAcademico.findUnique({
    where: { id: nivelAcademicoId },
    include: {
      grado: { include: { nivel: true } },
      sede: true,
      institucion: { include: { sedes: { where: { activo: true } } } },
      matriculas: {
        where: { estado: "activo" },
        include: { estudiante: true },
      },
      students: {
        where: { role: "estudiante" },
        orderBy: [
          { apellidoPaterno: "asc" },
          { apellidoMaterno: "asc" },
          { name: "asc" },
        ],
      },
    },
  });

  if (!seccion) return null;

  const periodo = await prisma.periodoAcademico.findUnique({
    where: { id: periodoId },
  });
  if (!periodo) return null;

  const studentMap = new Map<string, (typeof seccion.students)[0]>();
  for (const m of seccion.matriculas) {
    if (m.estudiante && m.estudiante.role === "estudiante") {
      studentMap.set(m.estudiante.id, m.estudiante);
    }
  }
  for (const s of seccion.students) {
    studentMap.set(s.id, s);
  }

  const allStudents = Array.from(studentMap.values()).sort((a, b) => {
    const apeA = `${a.apellidoPaterno || ""} ${a.apellidoMaterno || ""}`.trim();
    const apeB = `${b.apellidoPaterno || ""} ${b.apellidoMaterno || ""}`.trim();
    return apeA.localeCompare(apeB);
  });

  const studentIds = allStudents.map((e) => e.id);
  const asistencias = await prisma.asistencia.findMany({
    where: {
      estudianteId: { in: studentIds },
      fecha: {
        gte: periodo.fechaInicio,
        lte: periodo.fechaFin,
      },
    },
  });

  const asistenciaMap: Record<
    string,
    { p: number; t: number; fj: number; fi: number }
  > = {};

  for (const a of asistencias) {
    if (!asistenciaMap[a.estudianteId]) {
      asistenciaMap[a.estudianteId] = { p: 0, t: 0, fj: 0, fi: 0 };
    }
    const rec = asistenciaMap[a.estudianteId];
    if (a.tardanza) {
      rec.t++;
    } else if (a.presente) {
      rec.p++;
    } else if (a.justificada) {
      rec.fj++;
    } else {
      rec.fi++;
    }
  }

  const estudiantes = allStudents.map((estudiante, index) => {
    const stats = asistenciaMap[estudiante.id] || { p: 0, t: 0, fj: 0, fi: 0 };
    const totalDias = stats.p + stats.t + stats.fj + stats.fi;
    const rate =
      totalDias > 0
        ? Math.min(100, Math.max(0, ((stats.p + stats.t * 0.5) / totalDias) * 100))
        : 100;

    return {
      index: index + 1,
      codigoEstudiante:
        estudiante.codigoSiagie || estudiante.codigoEstudiante || estudiante.dni || "",
      tipoDocumento: "DNI",
      dni: estudiante.dni || "",
      apellidoPaterno: estudiante.apellidoPaterno || "",
      apellidoMaterno: estudiante.apellidoMaterno || "",
      nombres: estudiante.name || "",
      asistencias: stats.p,
      tardanzas: stats.t,
      faltasJustificadas: stats.fj,
      faltasInjustificadas: stats.fi,
      totalDias,
      porcentajeAsistencia: rate,
    };
  });

  const sedePrincipal =
    seccion.sede?.nombre ||
    seccion.institucion?.sedes?.find((s) => s.esPrincipal)?.nombre ||
    "Sede Principal";

  return {
    institucionName: seccion.institucion?.nombreInstitucion || "COLEGIO PRO",
    codigoModular: seccion.institucion?.codigoModular || "N/A",
    sedeNombre: sedePrincipal,
    nivelNombre: seccion.grado.nivel.nombre,
    gradoNombre: seccion.grado.nombre,
    seccionNombre: seccion.seccion,
    periodoNombre: periodo.nombre,
    anioEscolar: periodo.anioEscolar,
    estudiantes,
  };
}

export async function getSiagieAttendanceExportDataAction(
  params: SiagieAttendanceExportParams,
): Promise<SiagieExportResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const data = await fetchSectionAttendanceData(
      params.nivelAcademicoId,
      params.periodoId,
    );
    if (!data) return { error: "Sección o periodo no encontrado" };

    return await generateSiagieAttendanceExcel(data);
  } catch (error) {
    console.error("Error al exportar asistencia SIAGIE:", error);
    return { error: "Error al generar la plantilla de asistencia SIAGIE" };
  }
}

export async function getSiagieBulkAttendanceExportDataAction(params: {
  periodoId: string;
  nivelNombre?: string;
  seccionNombre?: string;
}): Promise<SiagieExportResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id: params.periodoId },
    });
    if (!periodo) return { error: "Periodo no encontrado" };

    const institucionId = session.user.institucionId;
    const secciones = await prisma.nivelAcademico.findMany({
      where: {
        ...(institucionId ? { institucionId } : {}),
        anioAcademico: periodo.anioEscolar,
        ...(params.nivelNombre && params.nivelNombre !== "TODOS"
          ? { grado: { nivel: { nombre: params.nivelNombre } } }
          : {}),
        ...(params.seccionNombre && params.seccionNombre !== "TODOS"
          ? { seccion: params.seccionNombre }
          : {}),
      },
      include: { grado: { include: { nivel: true } } },
      orderBy: [
        { grado: { nivel: { nombre: "asc" } } },
        { grado: { orden: "asc" } },
        { seccion: "asc" },
      ],
    });

    if (secciones.length === 0) {
      return { error: "No hay secciones disponibles para este periodo y filtro." };
    }

    const sectionsData: SiagieAttendanceSectionData[] = [];
    for (const sec of secciones) {
      const secData = await fetchSectionAttendanceData(sec.id, params.periodoId);
      if (secData && secData.estudiantes.length > 0) {
        sectionsData.push(secData);
      }
    }

    if (sectionsData.length === 0) {
      return { error: "Las secciones seleccionadas no tienen estudiantes matriculados." };
    }

    return await generateSiagieBulkAttendanceExcel(sectionsData, {
      periodoNombre: periodo.nombre,
    });
  } catch (error) {
    console.error("Error en exportación masiva de asistencia SIAGIE:", error);
    return { error: "Error al procesar la exportación masiva de asistencia SIAGIE" };
  }
}
