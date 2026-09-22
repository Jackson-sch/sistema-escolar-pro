"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { generateSiagieOfficialExcel, generateSiagieBulkExcel } from "@/lib/excel";
import type {
  SiagieExportParams,
  SiagieExportResult,
  SiagieSectionData,
} from "@/components/evaluaciones/siagie/siagie-types";

async function fetchSectionGradesData(
  nivelAcademicoId: string,
  periodoId: string,
  cursoId?: string,
): Promise<SiagieSectionData | null> {
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

  const cursos = await prisma.curso.findMany({
    where: {
      nivelAcademicoId,
      activo: true,
      ...(cursoId ? { id: cursoId } : {}),
    },
    include: {
      areaCurricular: { include: { competencias: true } },
    },
    orderBy: { areaCurricular: { orden: "asc" } },
  });

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
  const notas = await prisma.nota.findMany({
    where: {
      estudianteId: { in: studentIds },
      evaluacion: {
        periodoId,
        cursoId: { in: cursos.map((c) => c.id) },
      },
    },
    include: { evaluacion: true },
  });

  const notasMap: Record<string, Record<string, { valor: string; comentario?: string }>> = {};
  for (const nota of notas) {
    if (!notasMap[nota.estudianteId]) notasMap[nota.estudianteId] = {};
    const val = nota.valorLiteral || (nota.valor !== null ? String(nota.valor) : "-");
    notasMap[nota.estudianteId][nota.evaluacion.cursoId] = {
      valor: val,
      comentario: nota.comentario || "",
    };
  }

  const estudiantes = allStudents.map((estudiante, index) => {
    const grades: Record<string, { nota: string | number; conclusion: string }> = {};
    for (const curso of cursos) {
      const notaInfo = notasMap[estudiante.id]?.[curso.id];
      grades[curso.id] = {
        nota: notaInfo?.valor || "",
        conclusion: notaInfo?.comentario || "",
      };
    }

    return {
      index: index + 1,
      codigoEstudiante:
        estudiante.codigoSiagie || estudiante.codigoEstudiante || estudiante.dni || "",
      tipoDocumento: "DNI",
      dni: estudiante.dni || "",
      apellidoPaterno: estudiante.apellidoPaterno || "",
      apellidoMaterno: estudiante.apellidoMaterno || "",
      nombres: estudiante.name || "",
      grades,
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
    cursos: cursos.map((c) => ({ id: c.id, nombre: c.nombre })),
    estudiantes,
  };
}

export async function getSiagieExportDataAction(
  params: SiagieExportParams,
): Promise<SiagieExportResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autorizado" };

    const data = await fetchSectionGradesData(
      params.nivelAcademicoId,
      params.periodoId,
      params.cursoId,
    );
    if (!data) return { error: "Sección o periodo no encontrado" };

    return await generateSiagieOfficialExcel(data);
  } catch (error) {
    console.error("Error al exportar plantilla SIAGIE:", error);
    return { error: "Error al generar la plantilla SIAGIE" };
  }
}

export async function getSiagieBulkExportDataAction(params: {
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

    const sectionsData: SiagieSectionData[] = [];
    for (const sec of secciones) {
      const secData = await fetchSectionGradesData(sec.id, params.periodoId);
      if (secData && secData.estudiantes.length > 0) {
        sectionsData.push(secData);
      }
    }

    if (sectionsData.length === 0) {
      return { error: "Las secciones seleccionadas no tienen estudiantes matriculados." };
    }

    return await generateSiagieBulkExcel(sectionsData, {
      periodoNombre: periodo.nombre,
    });
  } catch (error) {
    console.error("Error en exportación masiva SIAGIE:", error);
    return { error: "Error al procesar la exportación masiva de SIAGIE" };
  }
}
