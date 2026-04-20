"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { auth } from "@/auth";

const REVALIDATE_PATH = "/evaluaciones";

// ==================== TIPOS DE EVALUACIÓN ====================

/**
 * Obtiene los tipos de evaluación
 */
export const getTiposEvaluacionAction = createSafeAction(
  z.object({}),
  async () => {
    try {
      const tipos = await prisma.tipoEvaluacion.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      });
      return { success: serialize(tipos) };
    } catch (error) {
      console.error("Error fetching tipos:", error);
      return { error: "No se pudieron obtener los tipos de evaluación" };
    }
  }
);

// ==================== PERIODOS ACADÉMICOS ====================

/**
 * Obtiene los periodos académicos
 */
export const getPeriodosAction = createSafeAction(
  z.object({ anioEscolar: z.number().optional() }).optional(),
  async (filters, session) => {
    try {
      const periodos = await prisma.periodoAcademico.findMany({
        where: {
          ...(filters?.anioEscolar ? { anioEscolar: filters.anioEscolar } : {}),
          activo: true,
          institucionId: session.user.institucionId || undefined,
        },
        orderBy: { fechaInicio: "asc" },
      });
      return { success: serialize(periodos) };
    } catch (error) {
      console.error("Error fetching periodos:", error);
      return { error: "No se pudieron obtener los periodos" };
    }
  }
);

/**
 * Crea o actualiza un periodo académico
 */
export const upsertPeriodoAction = createSafeAction(
  z.object({
    values: z.any(),
    id: z.string().optional()
  }),
  async ({ values, id }, session) => {
    try {
      const data = {
        ...values,
        fechaInicio: new Date(values.fechaInicio),
        fechaFin: new Date(values.fechaFin),
        numero: parseInt(values.numero),
        anioEscolar: parseInt(values.anioEscolar),
        institucionId: session.user.institucionId || values.institucionId
      };

      if (id) {
        // Validar pertenencia
        const existing = await prisma.periodoAcademico.findUnique({
          where: { id, institucionId: session.user.institucionId || undefined }
        });
        if (!existing) return { error: "Periodo no encontrado o sin permisos" };

        const periodo = await prisma.periodoAcademico.update({
          where: { id },
          data,
        });
        revalidatePath("/evaluaciones");
        return {
          success: "Periodo actualizado",
          data: serialize(periodo),
        };
      } else {
        const periodo = await prisma.periodoAcademico.create({ data });
        revalidatePath("/evaluaciones");
        return {
          success: "Periodo creado",
          data: serialize(periodo),
        };
      }
    } catch (error) {
      console.error("Error upserting periodo:", error);
      return { error: "No se pudo procesar el periodo" };
    }
  },
  { roles: ["administrativo"] }
);

// ==================== EVALUACIONES ====================

/**
 * Obtiene el detalle completo de una evaluación por ID (usado en la página de notas)
 */
export const getEvaluacionDetailAction = createSafeAction(
  z.object({ evaluacionId: z.string() }),
  async ({ evaluacionId }, session) => {
    try {
      const evaluacion = await prisma.evaluacion.findUnique({
        where: { id: evaluacionId },
        include: {
          tipoEvaluacion: true,
          curso: {
            include: {
              areaCurricular: true,
              nivelAcademico: {
                include: { grado: true },
              },
            },
          },
          periodo: true,
        },
      });

      if (!evaluacion) return { success: null };

      // Validar acceso institucional
      if (evaluacion.curso.nivelAcademico.institucionId !== session.user.institucionId) {
          return { error: "No tiene permiso para ver esta evaluación" };
      }

      return { success: serialize(evaluacion) };
    } catch (error) {
      console.error("Error fetching evaluacion detail:", error);
      return { error: "No se pudo obtener el detalle de la evaluación" };
    }
  }
);

/**
 * Obtiene las evaluaciones de un curso
 */
export const getEvaluacionesAction = createSafeAction(
  z.object({
    cursoId: z.string().optional(),
    periodoId: z.string().optional(),
    tipoEvaluacionId: z.string().optional(),
    profesorId: z.string().optional(),
  }).optional(),
  async (filters, session) => {
    try {
      const evaluaciones = await prisma.evaluacion.findMany({
        where: {
          cursoId: filters?.cursoId || undefined,
          periodoId: filters?.periodoId || undefined,
          tipoEvaluacionId: filters?.tipoEvaluacionId || undefined,
          activa: true,
          curso: {
            nivelAcademico: { institucionId: session.user.institucionId || undefined },
            ...(filters?.profesorId ? { profesorId: filters.profesorId } : {}),
          },
        },
        include: {
          tipoEvaluacion: true,
          curso: {
            include: {
              areaCurricular: true,
              nivelAcademico: {
                include: { grado: true },
              },
            },
          },
          periodo: true,
          capacidad: {
            include: {
              competencia: true,
            },
          },
          _count: { select: { notas: true } },
        },
        orderBy: { fecha: "desc" },
      });
      return { success: serialize(evaluaciones) };
    } catch (error) {
      console.error("Error fetching evaluaciones:", error);
      return { error: "No se pudieron obtener las evaluaciones" };
    }
  }
);

/**
 * Crea o actualiza una evaluación
 */
export const upsertEvaluacionAction = createSafeAction(
  z.object({
    values: z.any(),
    id: z.string().optional()
  }),
  async ({ values, id }, session) => {
    try {
      const data = {
        ...values,
        peso: parseFloat(values.peso),
        notaMinima: values.notaMinima ? parseFloat(values.notaMinima) : null,
        fecha: new Date(values.fecha),
        fechaLimite: values.fechaLimite ? new Date(values.fechaLimite) : null,
        capacidadId: values.capacidadId || null,
      };

      if (id) {
        // Validar pertenencia vía curso
        const existing = await prisma.evaluacion.findUnique({
          where: { id },
          include: { curso: { include: { nivelAcademico: true } } }
        });

        if (!existing || existing.curso.nivelAcademico.institucionId !== session.user.institucionId) {
            return { error: "Evaluación no encontrada o sin permisos" };
        }

        const evaluacion = await prisma.evaluacion.update({
          where: { id },
          data,
        });
        revalidatePath(REVALIDATE_PATH);
        return {
          success: "Evaluación actualizada",
          data: serialize(evaluacion),
        };
      } else {
        const evaluacion = await prisma.evaluacion.create({ data });
        revalidatePath(REVALIDATE_PATH);
        return {
          success: "Evaluación creada",
          data: serialize(evaluacion),
        };
      }
    } catch (error) {
      console.error("Error upserting evaluacion:", error);
      return { error: "No se pudo procesar la evaluación" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

/**
 * Obtiene las capacidades vinculadas a un curso (vía su área curricular)
 */
export const getCapacidadesByCursoAction = createSafeAction(
  z.object({ cursoId: z.string() }),
  async ({ cursoId }, session) => {
    try {
      const curso = await prisma.curso.findUnique({
        where: { id: cursoId, nivelAcademico: { institucionId: session.user.institucionId || undefined } },
        include: {
          areaCurricular: {
            include: {
              competencias: {
                include: { capacidades: true },
              },
            },
          },
        },
      });

      if (!curso?.areaCurricular) return { success: [] };

      const capacidades = curso.areaCurricular.competencias.flatMap((comp) =>
        comp.capacidades.map((cap) => ({
          ...cap,
          competenciaNombre: comp.nombre,
        })),
      );

      return { success: serialize(capacidades) };
    } catch (error) {
      console.error("Error fetching capacities by course:", error);
      return { error: "No se pudieron obtener las capacidades" };
    }
  }
);

/**
 * Elimina una evaluación (soft delete)
 */
export const deleteEvaluacionAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, session) => {
    try {
      const existing = await prisma.evaluacion.findUnique({
        where: { id },
        include: { curso: { include: { nivelAcademico: true } } }
      });

      if (!existing || existing.curso.nivelAcademico.institucionId !== session.user.institucionId) {
        return { error: "Evaluación no encontrada o sin permisos" };
      }

      // Verificar si tiene notas registradas
      const notas = await prisma.nota.count({ where: { evaluacionId: id } });
      if (notas > 0) {
        return {
          error: `No se puede eliminar: tiene ${notas} notas registradas`,
        };
      }

      await prisma.evaluacion.update({
        where: { id },
        data: { activa: false },
      });
      revalidatePath(REVALIDATE_PATH);
      return { success: "Evaluación eliminada" };
    } catch (error) {
      console.error("Error deleting evaluacion:", error);
      return { error: "No se pudo eliminar la evaluación" };
    }
  },
  { roles: ["administrativo"] }
);

// ==================== NOTAS ====================

/**
 * Obtiene las notas de una evaluación
 */
export async function getNotasEvaluacionAction(evaluacionId: string) {
  try {
    const notas = await prisma.nota.findMany({
      where: { evaluacionId },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true,
          },
        },
      },
      orderBy: { estudiante: { apellidoPaterno: "asc" } },
    });
    return { data: serialize(notas) };
  } catch (error) {
    console.error("Error fetching notas:", error);
    return { error: "No se pudieron obtener las notas" };
  }
}

/**
 * Obtiene los estudiantes de un curso para registro de notas
 */
export async function getEstudiantesCursoAction(cursoId: string) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        nivelAcademico: true,
      },
    });

    if (!curso?.nivelAcademicoId) {
      return { error: "El curso no tiene sección asignada" };
    }

    const estudiantes = await prisma.user.findMany({
      where: {
        role: "estudiante",
        nivelAcademicoId: curso.nivelAcademicoId,
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        codigoEstudiante: true,
      },
      orderBy: { apellidoPaterno: "asc" },
    });

    return { data: serialize(estudiantes) };
  } catch (error) {
    console.error("Error fetching estudiantes:", error);
    return { error: "No se pudieron obtener los estudiantes" };
  }
}

/**
 * Registra o actualiza una nota
 */
export const upsertNotaAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    evaluacionId: z.string(),
    cursoId: z.string(),
    valor: z.number(),
    valorLiteral: z.string().optional(),
    comentario: z.string().optional(),
  }),
  async (values, session) => {
    try {
      // SEGURIDAD: Validar que el profesor tiene acceso
      if (session.user.role === "profesor") {
        const evaluacion = await prisma.evaluacion.findUnique({
          where: { id: values.evaluacionId },
          include: { curso: true }
        });
        
        if (!evaluacion || evaluacion.cursoId !== values.cursoId) {
            return { error: "Inconsistencia en datos de evaluación" };
        }

        const asignacion = await prisma.curso.findFirst({
          where: {
            id: values.cursoId,
            profesorId: session.user.id,
          }
        });

        if (!asignacion) {
          return { error: "No tiene permiso para registrar notas en este curso" };
        }
      } else if (session.user.role !== "administrativo") {
        return { error: "No autorizado" };
      }

      let valorFinal = values.valor;
      if (values.valorLiteral) {
        const mapping: Record<string, number> = {
          AD: 20,
          A: 17,
          B: 13,
          C: 10,
        };
        if (mapping[values.valorLiteral]) {
          valorFinal = mapping[values.valorLiteral];
        }
      }

      const nota = await prisma.nota.upsert({
        where: {
          estudianteId_evaluacionId: {
            estudianteId: values.estudianteId,
            evaluacionId: values.evaluacionId,
          },
        },
        update: {
          valor: valorFinal,
          valorLiteral: values.valorLiteral,
          comentario: values.comentario,
        },
        create: {
          estudianteId: values.estudianteId,
          evaluacionId: values.evaluacionId,
          cursoId: values.cursoId,
          valor: valorFinal,
          valorLiteral: values.valorLiteral,
          comentario: values.comentario,
        },
      });

      revalidatePath(REVALIDATE_PATH);
      return {
        success: "Nota registrada",
        data: serialize(nota),
      };
    } catch (error) {
      console.error("Error upserting nota:", error);
      return { error: "No se pudo registrar la nota" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

/**
 * Registra notas masivamente para una evaluación
 */
export const registrarNotasMasivasAction = createSafeAction(
  z.object({
    evaluacionId: z.string(),
    cursoId: z.string(),
    notas: z.array(z.object({
      estudianteId: z.string(),
      valor: z.number(),
      valorLiteral: z.string().optional(),
      comentario: z.string().optional(),
    })),
  }),
  async ({ evaluacionId, cursoId, notas }, session) => {
    try {
      // SEGURIDAD: Validar acceso
      if (session.user.role === "profesor") {
          const asignacion = await prisma.curso.findFirst({
            where: {
              id: cursoId,
              profesorId: session.user.id,
            }
          });
          if (!asignacion) return { error: "No tiene permiso para este curso" };
      }

      const operations = notas.map((nota) => {
        let valorFinal = nota.valor;
        if (nota.valorLiteral) {
          const mapping: Record<string, number> = {
            AD: 20, A: 17, B: 13, C: 10,
          };
          if (mapping[nota.valorLiteral]) {
            valorFinal = mapping[nota.valorLiteral];
          }
        }

        return prisma.nota.upsert({
          where: {
            estudianteId_evaluacionId: {
              estudianteId: nota.estudianteId,
              evaluacionId,
            },
          },
          update: {
            valor: valorFinal,
            valorLiteral: nota.valorLiteral,
            comentario: nota.comentario,
          },
          create: {
            estudianteId: nota.estudianteId,
            evaluacionId,
            cursoId,
            valor: valorFinal,
            valorLiteral: nota.valorLiteral,
            comentario: nota.comentario,
          },
        });
      });

      const results = await prisma.$transaction(operations);
      revalidatePath(REVALIDATE_PATH);
      return { success: `${results.length} notas registradas correctamente` };
    } catch (error) {
      console.error("Error registrando notas masivas:", error);
      return { error: "Error al registrar las notas" };
    }
  },
  { roles: ["administrativo", "profesor"] }
);

/**
 * Obtiene el resumen de notas de un estudiante
 */
export const getResumenNotasEstudianteAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    periodoId: z.string().optional(),
  }),
  async ({ estudianteId, periodoId }, session) => {
    try {
      // SEGURIDAD: Validar acceso (Admin, Profesor o Padre)
      const esAdminProfesor = ["administrativo", "profesor"].includes(session.user.role || "");
      const esPadre = await prisma.relacionFamiliar.findFirst({
        where: { padreTutorId: session.user.id, hijoId: estudianteId }
      });

      if (!esAdminProfesor && !esPadre && session.user.id !== estudianteId) {
        return { error: "No tiene permiso para ver estas notas" };
      }

      const notas = await prisma.nota.findMany({
        where: {
          estudianteId,
          evaluacion: periodoId ? { periodoId } : undefined,
          estudiante: { institucionId: session.user.institucionId || undefined },
        },
        include: {
          evaluacion: {
            include: {
              tipoEvaluacion: true,
              periodo: true,
            },
          },
          curso: {
            include: { areaCurricular: true },
          },
        },
        orderBy: { fechaRegistro: "desc" },
      });

      // Agrupar por curso
      const notasPorCurso = notas.reduce((acc: any, nota) => {
        const cursoId = nota.cursoId;
        if (!acc[cursoId]) {
          acc[cursoId] = {
            curso: nota.curso,
            notas: [],
            promedio: 0,
          };
        }
        acc[cursoId].notas.push(nota);
        return acc;
      }, {});

      // Calcular promedios
      Object.values(notasPorCurso).forEach((grupo: any) => {
        const sum = grupo.notas.reduce((acc: number, n: any) => acc + n.valor, 0);
        grupo.promedio = grupo.notas.length > 0 ? sum / grupo.notas.length : 0;
      });

      return { success: serialize(notasPorCurso) };
    } catch (error) {
      console.error("Error fetching resumen:", error);
      return { error: "No se pudo obtener el resumen de notas" };
    }
  }
);

/**
 * Calcula el ranking de un estudiante dentro de su sección (nivel académico)
 */
export const getRankingEstudianteAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    periodoId: z.string().optional(),
    anioEscolar: z.number().optional()
  }),
  async ({ estudianteId, periodoId, anioEscolar }, session) => {
    try {
      const anio = anioEscolar || new Date().getFullYear();
      
      // SEGURIDAD: Validar acceso institutional
      const estudiante = await prisma.user.findUnique({
        where: { id: estudianteId, institucionId: session.user.institucionId || undefined },
        select: { nivelAcademicoId: true },
      });

      if (!estudiante?.nivelAcademicoId) {
        return { success: { posicion: 0, total: 0, promedioEstudiante: 0 } };
      }

      // 2. Obtener todos los estudiantes de la misma sección
      const compañeros = await prisma.user.findMany({
        where: {
          nivelAcademicoId: estudiante.nivelAcademicoId,
          role: "estudiante",
        },
        select: { id: true, name: true },
      });

      if (compañeros.length === 0) {
        return { success: { posicion: 1, total: 1, promedioEstudiante: 0 } };
      }

      // 3. Obtener todas las notas de todos los alumnos de la sección
      const promediosDb = await prisma.nota.groupBy({
        by: ["estudianteId"],
        where: {
          estudianteId: { in: compañeros.map((c) => c.id) },
          evaluacion: {
            periodo: {
              anioEscolar: anio,
              id: periodoId || undefined,
            },
          },
        },
        _avg: { valor: true },
      });

      // 4. Mapear promedios
      const promediosEstudiantes = compañeros.map((comp) => {
        const dbAvg = promediosDb.find((p) => p.estudianteId === comp.id);
        return { id: comp.id, promedio: dbAvg?._avg.valor || 0 };
      });

      // 5. Ordenar por promedio descendente
      const rankingOrdenado = promediosEstudiantes.sort(
        (a, b) => b.promedio - a.promedio,
      );

      // 6. Encontrar posición del estudiante actual
      const index = rankingOrdenado.findIndex((r) => r.id === estudianteId);
      const posicion = index !== -1 ? index + 1 : rankingOrdenado.length;

      return {
        success: {
          posicion,
          total: rankingOrdenado.length,
          promedioEstudiante: rankingOrdenado[index]?.promedio || 0,
        },
      };
    } catch (error) {
      console.error("Error calculando ranking:", error);
      return { error: "No se pudo calcular el ranking" };
    }
  }
);

/**
 * Calcula el porcentaje de asistencia de un estudiante
 */
export const getAsistenciaEstudianteAction = createSafeAction(
  z.object({
    estudianteId: z.string(),
    periodoId: z.string().optional(),
    anioEscolar: z.number().optional()
  }),
  async ({ estudianteId, periodoId, anioEscolar }, session) => {
    try {
      const anio = anioEscolar || new Date().getFullYear();
      let whereClause: any = {
        estudianteId,
        estudiante: { institucionId: session.user.institucionId || undefined }
      };

      if (periodoId) {
        const periodo = await prisma.periodoAcademico.findUnique({
          where: { id: periodoId },
          select: { fechaInicio: true, fechaFin: true },
        });

        if (periodo) {
          whereClause.fecha = {
            gte: periodo.fechaInicio,
            lte: periodo.fechaFin,
          };
        }
      } else {
        const fechaInicioAnio = new Date(anio, 0, 1);
        const fechaFinAnio = new Date(anio, 11, 31);
        whereClause.fecha = {
          gte: fechaInicioAnio,
          lte: fechaFinAnio,
        };
      }

      const asistencias = await prisma.asistencia.findMany({
        where: whereClause,
        select: { presente: true },
      });

      const totalDias = asistencias.length;
      const diasPresente = asistencias.filter((a) => a.presente).length;
      const porcentaje = totalDias > 0 ? (diasPresente / totalDias) * 100 : 0;

      return {
        success: {
          porcentaje: parseFloat(porcentaje.toFixed(1)),
          totalDias,
          diasPresente,
        },
      };
    } catch (error) {
      console.error("Error calculando asistencia:", error);
      return { error: "No se pudo calcular la asistencia" };
    }
  }
);
