"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { serialize } from "@/lib/dto";

export interface SectionAuditSummary {
  id: string;
  nivelNombre: string;
  nivelId: string;
  gradoNombre: string;
  seccion: string;
  tutorNombre?: string;
  tutorTelefono?: string;
  totalEstudiantes: number;
  totalCursos: number;
  totalEvaluaciones: number;
  totalNotasEsperadas: number;
  totalNotasRegistradas: number;
  porcentajeCompletitud: number;
  notasC_SinConclusion: number;
  estado: "LISTO" | "OBSERVADO" | "INCOMPLETO";
}

export interface InconsistencyDetail {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteDni?: string;
  cursoId: string;
  cursoNombre: string;
  profesorNombre?: string;
  tipo: "NOTA_FALTANTE" | "CONCLUSION_FALTANTE" | "CODIGO_SIAGIE_FALTANTE";
  descripcion: string;
  gravedad: "ALTA" | "MEDIA" | "BAJA";
}

export interface SectionAuditDetail {
  seccion: {
    id: string;
    grado: string;
    seccion: string;
    nivel: string;
    tutor?: string;
    totalEstudiantes: number;
  };
  periodo: {
    id: string;
    nombre: string;
  };
  resumen: {
    porcentajeCompletitud: number;
    totalNotasRegistradas: number;
    totalNotasEsperadas: number;
    totalInconsistencias: number;
    estado: "LISTO" | "OBSERVADO" | "INCOMPLETO";
  };
  cursos: Array<{
    id: string;
    nombre: string;
    profesor?: string;
    evaluacionesCount: number;
    porcentajeLlenado: number;
    inconsistenciasCount: number;
  }>;
  inconsistencias: InconsistencyDetail[];
}

/**
 * Obtiene el resumen de auditoría SIAGIE de todas las aulas para el periodo seleccionado
 */
export async function getSiagieInstitutionalOverviewAction(periodoId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;

    // 1. Obtener periodo activo si no se especificó uno
    let selectedPeriodoId = periodoId;
    if (!selectedPeriodoId) {
      const periodoActivo = await prisma.periodoAcademico.findFirst({
        where: {
          institucionId: institucionId || undefined,
          activo: true,
        },
        orderBy: { numero: "asc" },
      });
      selectedPeriodoId = periodoActivo?.id;
    }

    if (!selectedPeriodoId) {
      const primerPeriodo = await prisma.periodoAcademico.findFirst({
        where: { institucionId: institucionId || undefined },
        orderBy: { numero: "asc" },
      });
      selectedPeriodoId = primerPeriodo?.id;
    }

    if (!selectedPeriodoId) {
      return { error: "No se encontraron periodos académicos configurados." };
    }

    const selectedPeriodo = await prisma.periodoAcademico.findUnique({
      where: { id: selectedPeriodoId },
      select: { id: true, nombre: true, anioEscolar: true },
    });

    if (!selectedPeriodo) {
      return { error: "Periodo académico no encontrado." };
    }

    const targetYear = selectedPeriodo.anioEscolar;

    // 2. Obtener todas las secciones del año escolar del periodo con sus alumnos, grado, nivel y tutor
    const secciones = await prisma.nivelAcademico.findMany({
      where: {
        institucionId: institucionId || undefined,
        anioAcademico: targetYear,
      },
      include: {
        grado: true,
        nivel: true,
        tutor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            telefono: true,
          },
        },
        matriculas: {
          where: { estado: "activo" },
          select: {
            estudiante: {
              select: { id: true, role: true },
            },
          },
        },
        students: {
          where: { role: "estudiante" },
          select: { id: true, dni: true, codigoSiagie: true },
        },
        cursos: {
          where: { activo: true },
          include: {
            evaluaciones: {
              where: { periodoId: selectedPeriodoId },
              include: {
                notas: true,
              },
            },
          },
        },
      },
      orderBy: [
        { nivel: { nombre: "asc" } },
        { grado: { orden: "asc" } },
        { seccion: "asc" },
      ],
    });

    const summaries: SectionAuditSummary[] = [];

    let granTotalEsperado = 0;
    let granTotalRegistrado = 0;
    let seccionesListasCount = 0;
    let seccionesObservadasCount = 0;
    let seccionesIncompletasCount = 0;

    for (const sec of secciones) {
      const studentIdSet = new Set<string>();
      if (sec.matriculas) {
        for (const m of sec.matriculas) {
          if (m.estudiante && m.estudiante.role === "estudiante") {
            studentIdSet.add(m.estudiante.id);
          }
        }
      }
      if (sec.students) {
        for (const s of sec.students) {
          studentIdSet.add(s.id);
        }
      }
      const totalEstudiantes = studentIdSet.size;
      const totalCursos = sec.cursos.length;

      let totalEvaluaciones = 0;
      let totalNotasRegistradas = 0;
      let notasC_SinConclusion = 0;

      for (const curso of sec.cursos) {
        totalEvaluaciones += curso.evaluaciones.length;
        for (const evalItem of curso.evaluaciones) {
          totalNotasRegistradas += evalItem.notas.length;

          // Verificar si hay notas C sin conclusión
          for (const nota of evalItem.notas) {
            const valorLiteral = (nota.valorLiteral || "").toUpperCase();
            if ((valorLiteral === "C" || valorLiteral === "B") && !nota.comentario?.trim()) {
              notasC_SinConclusion++;
            }
          }
        }
      }

      // Notas esperadas = Estudiantes * Total Evaluaciones
      const totalNotasEsperadas = totalEstudiantes * totalEvaluaciones;
      const porcentajeCompletitud = totalNotasEsperadas > 0
        ? Math.min(100, Math.round((totalNotasRegistradas / totalNotasEsperadas) * 100))
        : 0;

      let estado: "LISTO" | "OBSERVADO" | "INCOMPLETO" = "INCOMPLETO";
      if (porcentajeCompletitud === 100 && notasC_SinConclusion === 0 && totalNotasEsperadas > 0) {
        estado = "LISTO";
        seccionesListasCount++;
      } else if (porcentajeCompletitud >= 80) {
        estado = "OBSERVADO";
        seccionesObservadasCount++;
      } else {
        estado = "INCOMPLETO";
        seccionesIncompletasCount++;
      }

      granTotalEsperado += totalNotasEsperadas;
      granTotalRegistrado += totalNotasRegistradas;

      summaries.push({
        id: sec.id,
        nivelNombre: sec.nivel?.nombre || "General",
        nivelId: sec.nivelId || "",
        gradoNombre: sec.grado?.nombre || "Sin Grado",
        seccion: sec.seccion,
        tutorNombre: sec.tutor ? `${sec.tutor.name} ${sec.tutor.apellidoPaterno || ""}`.trim() : undefined,
        tutorTelefono: sec.tutor?.telefono || undefined,
        totalEstudiantes,
        totalCursos,
        totalEvaluaciones,
        totalNotasEsperadas,
        totalNotasRegistradas,
        porcentajeCompletitud,
        notasC_SinConclusion,
        estado,
      });
    }

    const porcentajeGlobal = granTotalEsperado > 0
      ? Math.round((granTotalRegistrado / granTotalEsperado) * 100)
      : 0;

    // Obtener lista de periodos para el selector
    const periodos = await prisma.periodoAcademico.findMany({
      where: { institucionId: institucionId || undefined },
      orderBy: [{ anioEscolar: "desc" }, { numero: "asc" }],
      select: { id: true, nombre: true, anioEscolar: true, activo: true },
    });

    return {
      success: true,
      data: serialize({
        periodoActualId: selectedPeriodoId,
        periodos,
        kpis: {
          porcentajeGlobal,
          totalSecciones: secciones.length,
          seccionesListasCount,
          seccionesObservadasCount,
          seccionesIncompletasCount,
          granTotalEsperado,
          granTotalRegistrado,
        },
        secciones: summaries,
      }),
    };
  } catch (error) {
    console.error("Error in getSiagieInstitutionalOverviewAction:", error);
    return { error: "Error al generar la auditoría de SIAGIE." };
  }
}

/**
 * Obtiene la auditoría detallada de una sección específica (alumnos e inconsistencias)
 */
export async function auditSectionDetailSiagieAction(nivelAcademicoId: string, periodoId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const [seccion, periodo] = await Promise.all([
      prisma.nivelAcademico.findUnique({
        where: { id: nivelAcademicoId },
        include: {
          grado: true,
          nivel: true,
          tutor: { select: { name: true, apellidoPaterno: true } },
          matriculas: {
            where: { estado: "activo" },
            include: { estudiante: true },
          },
          students: {
            where: { role: "estudiante" },
            orderBy: [{ apellidoPaterno: "asc" }, { name: "asc" }],
          },
          cursos: {
            where: { activo: true },
            include: {
              profesor: { select: { id: true, name: true, apellidoPaterno: true } },
              evaluaciones: {
                where: { periodoId },
                include: {
                  notas: true,
                },
              },
            },
          },
        },
      }),
      prisma.periodoAcademico.findUnique({
        where: { id: periodoId },
        select: { id: true, nombre: true },
      }),
    ]);

    if (!seccion || !periodo) {
      return { error: "Sección o periodo no encontrado." };
    }

    const studentMap = new Map<string, (typeof seccion.students)[0]>();
    if (seccion.matriculas) {
      for (const m of seccion.matriculas) {
        if (m.estudiante && m.estudiante.role === "estudiante") {
          studentMap.set(m.estudiante.id, m.estudiante);
        }
      }
    }
    if (seccion.students) {
      for (const s of seccion.students) {
        studentMap.set(s.id, s);
      }
    }
    const allStudents = Array.from(studentMap.values()).sort((a, b) => {
      const apeA = `${a.apellidoPaterno || ""} ${a.apellidoMaterno || ""}`.trim();
      const apeB = `${b.apellidoPaterno || ""} ${b.apellidoMaterno || ""}`.trim();
      return apeA.localeCompare(apeB);
    });

    const inconsistencias: InconsistencyDetail[] = [];
    const studentIds = allStudents.map((s) => s.id);
    const totalEstudiantes = allStudents.length;

    let totalNotasEsperadas = 0;
    let totalNotasRegistradas = 0;

    const cursosSummary = seccion.cursos.map((curso) => {
      const evalCount = curso.evaluaciones.length;
      const esperadasCurso = totalEstudiantes * evalCount;
      let registradasCurso = 0;
      let inconsistenciasCurso = 0;

      // Evaluar notas de cada evaluación y alumno
      for (const evalItem of curso.evaluaciones) {
        const notasEstudiantesMap = new Map(evalItem.notas.map((n) => [n.estudianteId, n]));

        for (const student of allStudents) {
          const nota = notasEstudiantesMap.get(student.id);

          // Inconsistencia: Falta código SIAGIE ni código institucional de matrícula
          const codigoIdentificador = student.codigoSiagie || student.codigoEstudiante;
          if (!codigoIdentificador && !inconsistencias.some((i) => i.estudianteId === student.id && i.tipo === "CODIGO_SIAGIE_FALTANTE")) {
            inconsistencias.push({
              id: `siagie-code-${student.id}`,
              estudianteId: student.id,
              estudianteNombre: `${student.name} ${student.apellidoPaterno || ""}`.trim(),
              estudianteDni: student.dni || undefined,
              cursoId: curso.id,
              cursoNombre: "Ficha del Estudiante",
              tipo: "CODIGO_SIAGIE_FALTANTE",
              descripcion: "El estudiante no cuenta con Código SIAGIE oficial ni código de matrícula asignado.",
              gravedad: "BAJA",
            });
          }

          if (!nota) {
            inconsistenciasCurso++;
            inconsistencias.push({
              id: `missing-${curso.id}-${evalItem.id}-${student.id}`,
              estudianteId: student.id,
              estudianteNombre: `${student.name} ${student.apellidoPaterno || ""}`.trim(),
              estudianteDni: student.dni || undefined,
              cursoId: curso.id,
              cursoNombre: curso.nombre,
              profesorNombre: curso.profesor ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno || ""}`.trim() : undefined,
              tipo: "NOTA_FALTANTE",
              descripcion: `Falta nota en la evaluación "${evalItem.nombre}".`,
              gravedad: "ALTA",
            });
          } else {
            registradasCurso++;
            const valorLiteral = (nota.valorLiteral || "").toUpperCase();

            // Inconsistencia: Calificación C requiere conclusión descriptiva
            if (valorLiteral === "C" && !nota.comentario?.trim()) {
              inconsistenciasCurso++;
              inconsistencias.push({
                id: `concl-${nota.id}`,
                estudianteId: student.id,
                estudianteNombre: `${student.name} ${student.apellidoPaterno || ""}`.trim(),
                estudianteDni: student.dni || undefined,
                cursoId: curso.id,
                cursoNombre: curso.nombre,
                profesorNombre: curso.profesor ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno || ""}`.trim() : undefined,
                tipo: "CONCLUSION_FALTANTE",
                descripcion: `Calificación "C" requiere conclusión descriptiva obligatoria (RVM 094-2020).`,
                gravedad: "MEDIA",
              });
            }
          }
        }
      }

      totalNotasEsperadas += esperadasCurso;
      totalNotasRegistradas += registradasCurso;

      const porcentajeLlenado = esperadasCurso > 0
        ? Math.min(100, Math.round((registradasCurso / esperadasCurso) * 100))
        : 0;

      return {
        id: curso.id,
        nombre: curso.nombre,
        profesor: curso.profesor ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno || ""}`.trim() : "No asignado",
        evaluacionesCount: evalCount,
        porcentajeLlenado,
        inconsistenciasCount: inconsistenciasCurso,
      };
    });

    const porcentajeCompletitud = totalNotasEsperadas > 0
      ? Math.min(100, Math.round((totalNotasRegistradas / totalNotasEsperadas) * 100))
      : 0;

    let estado: "LISTO" | "OBSERVADO" | "INCOMPLETO" = "INCOMPLETO";
    if (porcentajeCompletitud === 100 && inconsistencias.length === 0 && totalNotasEsperadas > 0) {
      estado = "LISTO";
    } else if (porcentajeCompletitud >= 80) {
      estado = "OBSERVADO";
    }

    const detail: SectionAuditDetail = {
      seccion: {
        id: seccion.id,
        grado: seccion.grado?.nombre || "",
        seccion: seccion.seccion,
        nivel: seccion.nivel?.nombre || "",
        tutor: seccion.tutor ? `${seccion.tutor.name} ${seccion.tutor.apellidoPaterno || ""}`.trim() : undefined,
        totalEstudiantes,
      },
      periodo: {
        id: periodo.id,
        nombre: periodo.nombre,
      },
      resumen: {
        porcentajeCompletitud,
        totalNotasRegistradas,
        totalNotasEsperadas,
        totalInconsistencias: inconsistencias.length,
        estado,
      },
      cursos: cursosSummary,
      inconsistencias,
    };

    return { success: true, data: serialize(detail) };
  } catch (error) {
    console.error("Error in auditSectionDetailSiagieAction:", error);
    return { error: "Error al auditar el detalle de la sección." };
  }
}
