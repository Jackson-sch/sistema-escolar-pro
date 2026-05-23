"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Obtiene la lista de matrículas con información de alumno y sección
 */
export async function getEnrollmentsAction() {
  try {
    const enrollments = await prisma.matricula.findMany({
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            dni: true,
            image: true,
          },
        },
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true,
            sede: true,
          },
        },
      },
      orderBy: {
        fechaMatricula: "desc",
      },
    });
    return { data: serialize(enrollments) };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return { error: "No se pudieron obtener las matrículas" };
  }
}

/**
 * Crea una nueva matrícula
 */
export async function createEnrollmentAction(values: any) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  try {
    // Validar si el alumno ya está matriculado en ese año
    const existingEnrollment = await prisma.matricula.findUnique({
      where: {
        estudianteId_anioAcademico: {
          estudianteId: values.estudianteId,
          anioAcademico: values.anioAcademico,
        },
      },
    });

    if (existingEnrollment) {
      return {
        error:
          "El estudiante ya cuenta con una matrícula para este año académico",
      };
    }

    // Validar que la sección pertenezca al mismo año de la matrícula
    const seccion = await prisma.nivelAcademico.findUnique({
      where: { id: values.nivelAcademicoId },
      select: { anioAcademico: true },
    });

    if (!seccion || seccion.anioAcademico !== values.anioAcademico) {
      return {
        error: `La sección seleccionada no corresponde al periodo académico ${values.anioAcademico}`,
      };
    }

    // Generar número de matrícula único (basado en el máximo actual para evitar colisiones por borrados)
    const year = values.anioAcademico.toString();
    const lastEnrollment = await prisma.matricula.findFirst({
      where: { anioAcademico: values.anioAcademico },
      orderBy: { numeroMatricula: "desc" },
      select: { numeroMatricula: true },
    });

    let nextNumber = 1;
    if (lastEnrollment) {
      const parts = lastEnrollment.numeroMatricula.split("-");
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    const numeroMatricula = `MAT-${year}-${String(nextNumber).padStart(5, "0")}`;

    // Crear la matrícula y la deuda en una sola transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro de matrícula
      const enrollment = await tx.matricula.create({
        data: {
          ...values,
          numeroMatricula,
        },
      });

      // 2. Actualizar el nivelAcademicoId en el modelo User
      await tx.user.update({
        where: { id: values.estudianteId },
        data: {
          nivelAcademicoId: values.nivelAcademicoId,
        },
      });

      // 3. Buscar el concepto de "Matrícula" para generar el pago automático
      // Buscamos algo que empiece por "Matric" para evitar problemas con tildes
      const conceptoMatricula = await tx.conceptoPago.findFirst({
        where: {
          nombre: { startsWith: "Matric", mode: "insensitive" },
          institucionId: session.user.institucionId || undefined,
          activo: true,
        },
      });

      if (conceptoMatricula) {
        // Calcular monto con descuento de beca si aplica
        const descuento = values.descuentoBeca || 0;
        const montoFinal = Math.max(
          0,
          conceptoMatricula.montoSugerido - descuento,
        );

        // Crear la deuda en el cronograma
        await tx.cronogramaPago.create({
          data: {
            estudianteId: values.estudianteId,
            conceptoId: conceptoMatricula.id,
            monto: montoFinal,
            fechaVencimiento: new Date(), // Vencimiento hoy por defecto para matrícula
            montoPagado: 0,
            pagado: false,
          },
        });
      }

      return enrollment;
    });

    revalidatePath("/gestion/matriculas");
    revalidatePath("/gestion/estudiantes");
    revalidatePath("/finanzas");

    return {
      success: "Matrícula realizada exitosamente y cobro generado",
      data: serialize(result),
    };
  } catch (error: any) {
    console.error("Error creating enrollment:", error);
    return {
      error:
        "No se pudo procesar la matrícula. Verifique que el estudiante no esté ya matriculado o intente nuevamente.",
    };
  }
}

/**
 * Elimina o retira una matrícula
 */
export async function deleteEnrollmentAction(id: string) {
  try {
    const enrollment = await prisma.matricula.findUnique({
      where: { id },
    });

    if (!enrollment) return { error: "Matrícula no encontrada" };

    await prisma.$transaction(async (tx) => {
      // 1. Eliminar inscripciones a cursos (cascada manual)
      await tx.matriculaCurso.deleteMany({
        where: { matriculaId: id },
      });

      // 2. Eliminar cronogramas del AÑO de esta matrícula que NO tengan pagos
      // Usamos el rango de fechas del año académico para ser precisos
      const startOfYear = new Date(enrollment.anioAcademico, 0, 1);
      const endOfYear = new Date(enrollment.anioAcademico, 11, 31, 23, 59, 59);

      await tx.cronogramaPago.deleteMany({
        where: {
          estudianteId: enrollment.estudianteId,
          pagado: false,
          montoPagado: 0,
          fechaVencimiento: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      });

      // 3. Eliminar la matrícula
      await tx.matricula.delete({
        where: { id },
      });
    });

    revalidatePath("/gestion/matriculas");
    revalidatePath("/finanzas");
    return { success: "Matrícula anulada y registros depurados correctamente" };
  } catch (error: any) {
    console.error("Error deleting enrollment:", error);
    return {
      error: `No se pudo eliminar la matrícula: ${error.message || "Error de integridad"}`,
    };
  }
}

/**
 * Obtiene estudiantes que aún no están matriculados en un año específico
 * para facilitar la búsqueda en el formulario de matrícula
 */
export async function getUnenrolledStudentsAction(anio: number) {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "estudiante",
        matriculas: {
          none: {
            anioAcademico: anio,
          },
        },
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        fechaNacimiento: true,
      },
    });
    return { data: serialize(students) };
  } catch (error) {
    console.error("Error al buscar estudiantes:", error);
    return { error: "Error al buscar estudiantes" };
  }
}

/**
 * Obtiene estadísticas generales de matrículas
 */
export async function getEnrollmentStatsAction() {
  try {
    const institucion = await prisma.institucionEducativa.findFirst({
      select: { cicloEscolarActual: true },
    });
    const currentYear =
      institucion?.cicloEscolarActual || new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEnrollments, totalCapacity, enrolledToday, regularEnrollments] =
      await Promise.all([
        prisma.matricula.count({
          where: { anioAcademico: currentYear },
        }),
        prisma.nivelAcademico.aggregate({
          where: { anioAcademico: currentYear },
          _sum: { capacidad: true },
        }),
        prisma.matricula.count({
          where: {
            anioAcademico: currentYear,
            fechaMatricula: { gte: today },
          },
        }),
        prisma.matricula.count({
          where: {
            anioAcademico: currentYear,
            esRepitente: false,
          },
        }),
      ]);

    const capacityValue = totalCapacity._sum.capacidad || 1; // Evitar división por cero
    const enrollmentGoal = Math.round((totalEnrollments / capacityValue) * 100);

    return {
      data: {
        metas: enrollmentGoal,
        matriculadosHoy: enrolledToday,
        situacionRegular: regularEnrollments,
        totalCapacity: capacityValue,
        totalEnrollments,
        anioAcademico: currentYear,
      },
    };
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    return { error: "No se pudieron obtener las estadísticas de matrícula" };
  }
}
/**
 * Promueve un grupo de estudiantes de una sección a otra de forma masiva
 */
export async function promoteStudentsAction(
  studentIds: string[],
  targetSeccionId: string,
  targetYear: number,
  isRepitente: boolean = false
) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  try {
    const results = await prisma.$transaction(async (tx) => {
      const processed = [];
      const errors = [];

      // Obtener el concepto de matrícula una sola vez para eficiencia
      const conceptoMatricula = await tx.conceptoPago.findFirst({
        where: {
          nombre: { startsWith: "Matric", mode: "insensitive" },
          institucionId: session.user.institucionId || undefined,
          activo: true,
        },
      });

      for (const studentId of studentIds) {
        try {
          // 1. Validar si ya está matriculado en el año destino
          const existing = await tx.matricula.findUnique({
            where: {
              estudianteId_anioAcademico: {
                estudianteId: studentId,
                anioAcademico: targetYear,
              },
            },
          });

          if (existing) {
            errors.push({ studentId, error: "Ya matriculado" });
            continue;
          }

          // 2. Generar número de matrícula
          const lastEnrollment = await tx.matricula.findFirst({
            where: { anioAcademico: targetYear },
            orderBy: { numeroMatricula: "desc" },
            select: { numeroMatricula: true },
          });

          let nextNumber = 1;
          if (lastEnrollment) {
            const parts = lastEnrollment.numeroMatricula.split("-");
            const lastNum = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastNum)) nextNumber = lastNum + 1;
          }
          const numeroMatricula = `MAT-${targetYear}-${String(nextNumber).padStart(5, "0")}`;

          // 3. Crear matrícula
          const enrollment = await tx.matricula.create({
            data: {
              numeroMatricula,
              estudianteId: studentId,
              nivelAcademicoId: targetSeccionId,
              anioAcademico: targetYear,
              esRepitente: isRepitente,
              estado: "activo",
            },
          });

          // 4. Actualizar usuario
          await tx.user.update({
            where: { id: studentId },
            data: { nivelAcademicoId: targetSeccionId },
          });

          // 5. Generar deuda de matrícula
          if (conceptoMatricula) {
            await tx.cronogramaPago.create({
              data: {
                estudianteId: studentId,
                conceptoId: conceptoMatricula.id,
                monto: conceptoMatricula.montoSugerido,
                fechaVencimiento: new Date(),
                montoPagado: 0,
                pagado: false,
              },
            });
          }

          processed.push(studentId);
        } catch (e: any) {
          errors.push({ studentId, error: e.message });
        }
      }

      return { processed, errors };
    });

    revalidatePath("/gestion/matriculas");
    revalidatePath("/gestion/estudiantes");
    
    return {
      success: `Proceso completado. ${results.processed.length} estudiantes promovidos. ${results.errors.length} errores.`,
      data: results,
    };
  } catch (error: any) {
    console.error("Error in promoteStudentsAction:", error);
    return { error: "No se pudo completar el proceso de promoción masiva" };
  }
}
