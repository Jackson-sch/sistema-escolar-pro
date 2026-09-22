"use server";

import prisma from "@/lib/prisma";
import { formatTitleCase } from "@/lib/formats";
import { auth } from "@/auth";

/**
 * Obtiene toda la información necesaria para generar una libreta de notas
 * de un estudiante en un periodo específico.
 */
export async function getGradeReportDataAction(
  studentId: string,
  anioAcademico: number,
) {
  const session = await auth();
  const role = session?.user.role;

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: {
            grado: {
              include: {
                nivel: true,
              },
            },
            institucion: {
              include: {
                director: {
                  select: {
                    name: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                  },
                },
              },
            },
            tutor: {
              select: {
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.nivelAcademicoId) {
      return { error: "Estudiante no encontrado o sin sección asignada" };
    }

    if (
      role !== "super_admin" &&
      student.institucionId !== session?.user.institucionId
    ) {
      return { error: "No tienes acceso a estudiantes de otra institución." };
    }

    const [allPeriodos, cursos, notas, asistencias] = await Promise.all([
      prisma.periodoAcademico.findMany({
        where: {
          anioEscolar: anioAcademico,
          institucionId: student.institucionId || undefined,
        },
        orderBy: { numero: "asc" },
      }),
      prisma.curso.findMany({
        where: {
          nivelAcademicoId: student.nivelAcademicoId,
          anioAcademico: anioAcademico,
          activo: true,
        },
        include: {
          areaCurricular: true,
          profesor: {
            select: {
              name: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            },
          },
        },
        orderBy: { areaCurricular: { orden: "asc" } },
      }),
      prisma.nota.findMany({
        where: {
          estudianteId: studentId,
          curso: {
            nivelAcademicoId: student.nivelAcademicoId,
            anioAcademico: anioAcademico,
          },
        },
        include: {
          evaluacion: {
            include: {
              tipoEvaluacion: true,
            },
          },
        },
      }),
      prisma.asistencia.findMany({
        where: {
          estudianteId: studentId,
        },
      }),
    ]);

    const getLiteral = (valor: number) => {
      if (valor >= 17) return "AD";
      if (valor >= 14) return "A";
      if (valor >= 11) return "B";
      return "C";
    };

    const reporteMap = cursos.map((curso) => {
      const notasDelCurso = notas.filter((n) => n.cursoId === curso.id);

      const promediosPorPeriodo = allPeriodos.map((periodo) => {
        const notasDelPeriodo = notasDelCurso.filter(
          (n) => n.evaluacion.periodoId === periodo.id,
        );

        let promedioNum = 0;
        if (notasDelPeriodo.length > 0) {
          const sumaPesos = notasDelPeriodo.reduce(
            (acc, n) => acc + (n.evaluacion.peso || 1),
            0,
          );
          const sumaNotas = notasDelPeriodo.reduce(
            (acc, n) => acc + n.valor * (n.evaluacion.peso || 1),
            0,
          );
          promedioNum = Math.round(sumaNotas / sumaPesos);
        }

        return {
          periodoId: periodo.id,
          periodoNombre: periodo.nombre,
          promedio: promedioNum,
          literal: promedioNum > 0 ? getLiteral(promedioNum) : "",
        };
      });

      const validPromedios = promediosPorPeriodo.filter(
        (p) => p.promedio > 0,
      );
      const sumPromedios = validPromedios.reduce(
        (acc, p) => acc + p.promedio,
        0,
      );
      const promedioFinal =
        validPromedios.length > 0
          ? Math.round(sumPromedios / validPromedios.length)
          : 0;

      return {
        cursoId: curso.id,
        cursoNombre: curso.nombre,
        areaNombre: curso.areaCurricular.nombre,
        profesor: curso.profesor
          ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno}`
          : "Sin asignar",
        periodos: promediosPorPeriodo,
        promedioFinal: promedioFinal,
        literalFinal: promedioFinal > 0 ? getLiteral(promedioFinal) : "",
      };
    });

    const tutorObj = student.nivelAcademico?.tutor;
    const tutorNombre = tutorObj
      ? formatTitleCase(
          `${tutorObj.name} ${tutorObj.apellidoPaterno || ""} ${tutorObj.apellidoMaterno || ""}`.trim(),
        )
      : undefined;

    const instObj = student.nivelAcademico?.institucion;
    const directorObj = instObj?.director;
    const directorNombre = directorObj
      ? formatTitleCase(
          `${directorObj.name} ${directorObj.apellidoPaterno || ""} ${directorObj.apellidoMaterno || ""}`.trim(),
        )
      : undefined;

    const asistenciasJustificadas = allPeriodos.map((periodo) => {
      const count = asistencias.filter(
        (a) =>
          !a.presente &&
          a.justificada &&
          a.fecha >= periodo.fechaInicio &&
          a.fecha <= periodo.fechaFin,
      ).length;
      return count > 0 ? count : "-";
    });

    const asistenciasInjustificadas = allPeriodos.map((periodo) => {
      const count = asistencias.filter(
        (a) =>
          !a.presente &&
          !a.justificada &&
          a.fecha >= periodo.fechaInicio &&
          a.fecha <= periodo.fechaFin,
      ).length;
      return count > 0 ? count : "-";
    });

    return {
      data: {
        estudiante: {
          id: student.id,
          nombreCompleto: formatTitleCase(
            `${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`,
          ),
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          nombres: student.name,
          dni: student.dni,
          codigo: student.codigoEstudiante,
          grado: student.nivelAcademico?.grado.nombre || "N/A",
          seccion: student.nivelAcademico?.seccion || "N/A",
          nivel: student.nivelAcademico?.grado.nivel.nombre || "N/A",
          tutor: tutorNombre,
          profesor: tutorNombre,
          institucion:
            student.nivelAcademico?.institucion.nombreInstitucion || "I.E.",
          institucionCompleta: {
            ...student.nivelAcademico?.institucion,
            director: directorNombre,
          },
          logo: student.nivelAcademico?.institucion.logo,
        },
        periodos: allPeriodos,
        cursos: reporteMap,
        anioAcademico: anioAcademico,
        asistenciasJustificadas,
        asistenciasInjustificadas,
        resumen: {
          puntajes: allPeriodos.map((p) => {
            const sum = reporteMap.reduce(
              (acc, c) =>
                acc +
                (c.periodos.find((per) => per.periodoId === p.id)?.promedio ||
                  0),
              0,
            );
            return sum;
          }),
          promedios: allPeriodos.map((p) => {
            const sum = reporteMap.reduce(
              (acc, c) =>
                acc +
                (c.periodos.find((per) => per.periodoId === p.id)?.promedio ||
                  0),
              0,
            );
            return sum > 0 ? Math.round(sum / (cursos.length || 1)) : 0;
          }),
        },
      },
    };
  } catch (error) {
    console.error("Error generating report data:", error);
    return { error: "Error al obtener los datos para el reporte" };
  }
}

/**
 * Obtiene datos para reporte cualitativo (Boleta de Notas por Competencias)
 */
export async function getQualitativeReportDataAction(
  studentId: string,
  periodoId: string,
) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: {
            grado: {
              include: {
                nivel: true,
              },
            },
            institucion: true,
          },
        },
      },
    });

    if (!student || !student.nivelAcademico)
      return { error: "Estudiante no encontrado o sin sección asignada" };

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id: periodoId },
    });

    if (!periodo) return { error: "Periodo no encontrado" };

    const notas = await prisma.nota.findMany({
      where: {
        estudianteId: studentId,
        evaluacion: { periodoId },
      },
      include: {
        evaluacion: {
          include: {
            curso: {
              include: {
                areaCurricular: true,
              },
            },
            capacidad: {
              include: {
                competencia: {
                  include: {
                    areaCurricular: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const processedGrades = notas.map((n) => ({
      area:
        n.evaluacion.capacidad?.competencia.areaCurricular.nombre ||
        n.evaluacion.curso?.areaCurricular.nombre ||
        "Sin Área",
      competencia:
        n.evaluacion.capacidad?.competencia.nombre || "Logro General",
      valor: n.valor,
      notaLiteral:
        n.valorLiteral ||
        (n.valor >= 17
          ? "AD"
          : n.valor >= 14
            ? "A"
            : n.valor >= 11
              ? "B"
              : "C"),
    }));

    return {
      data: {
        student: {
          name: formatTitleCase(student.name || ""),
          apellidoPaterno: formatTitleCase(student.apellidoPaterno || ""),
          apellidoMaterno: formatTitleCase(student.apellidoMaterno || ""),
          dni: student.dni,
          codigoEstudiante: student.codigoEstudiante,
          nivelAcademico: {
            seccion: student.nivelAcademico.seccion,
            grado: {
              nombre: student.nivelAcademico.grado.nombre,
              nivel: {
                nombre: student.nivelAcademico.grado.nivel.nombre,
              },
            },
          },
        },
        institucion: student.nivelAcademico.institucion,
        notas: processedGrades,
        periodoNombre: periodo.nombre,
        anioAcademico: periodo.anioEscolar,
      },
    };
  } catch (error) {
    console.error("Error fetching qualitative report data:", error);
    return { error: "Error al generar datos del reporte" };
  }
}
