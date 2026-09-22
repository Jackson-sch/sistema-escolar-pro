"use server";

import prisma from "@/lib/prisma";

/**
 * Obtiene datos para Constancia de Estudios
 */
export async function getConstanciaDataAction(studentId: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: {
            grado: { include: { nivel: true } },
            institucion: true,
          },
        },
      },
    });

    if (!student || !student.nivelAcademico)
      return { error: "Estudiante no encontrado" };

    return {
      data: structuredClone({
        student: {
          id: student.id,
          name: student.name,
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          dni: student.dni,
          nivelAcademico: {
            seccion: student.nivelAcademico.seccion,
            grado: { nombre: student.nivelAcademico.grado.nombre },
            nivel: { nombre: student.nivelAcademico.grado.nivel.nombre },
          },
        },
        institucion: student.nivelAcademico.institucion,
        anioAcademico: student.nivelAcademico.anioAcademico,
      }),
    };
  } catch (error) {
    console.error("Error fetching constancia data:", error);
    return { error: "Error al generar datos de la constancia" };
  }
}

/**
 * Obtiene datos para Constancia de Matrícula
 */
export async function getEnrollmentDataAction(studentId: string) {
  try {
    const enrollment = await prisma.matricula.findFirst({
      where: {
        estudianteId: studentId,
        estado: "activo",
      },
      orderBy: { fechaMatricula: "desc" },
      include: {
        estudiante: true,
        nivelAcademico: {
          include: {
            grado: { include: { nivel: true } },
            institucion: true,
          },
        },
      },
    });

    if (!enrollment) return { error: "Matrícula no encontrada" };

    const matriculaDoc = enrollment as any;

    return {
      data: structuredClone({
        enrollment: {
          id: matriculaDoc.id,
          anioAcademico: matriculaDoc.anioAcademico,
          estudiante: matriculaDoc.estudiante,
          nivelAcademico: matriculaDoc.nivelAcademico
            ? {
                seccion: matriculaDoc.nivelAcademico.seccion,
                grado: { nombre: matriculaDoc.nivelAcademico.grado.nombre },
                nivel: {
                  nombre: matriculaDoc.nivelAcademico.grado.nivel.nombre,
                },
              }
            : null,
        },
        institucion: matriculaDoc.nivelAcademico?.institucion,
      }),
    };
  } catch (error) {
    console.error("Error fetching enrollment data:", error);
    return { error: "Error al generar datos de la matrícula" };
  }
}

/**
 * Obtiene datos para el Carnet del Estudiante
 */
export async function getStudentCardDataAction(studentId: string) {
  try {
    const estudiante = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        nivelAcademico: {
          include: { grado: true, nivel: true, sede: true },
        },
        institucion: true,
      },
    });

    if (!estudiante || !estudiante.institucion) {
      return { error: "Estudiante o institución no encontrada" };
    }

    const dni = estudiante.dni || "S/D";
    const QRCode = (await import("qrcode")).default;
    const qrCode = await QRCode.toDataURL(dni, {
      margin: 1,
      width: 200,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return {
      data: {
        student: {
          name: estudiante.name || "",
          apellidoPaterno: estudiante.apellidoPaterno || "",
          apellidoMaterno: estudiante.apellidoMaterno || "",
          dni,
          image: estudiante.image,
          nivelAcademico: estudiante.nivelAcademico
            ? {
                seccion: estudiante.nivelAcademico.seccion,
                grado: { nombre: estudiante.nivelAcademico.grado.nombre },
                nivel: { nombre: estudiante.nivelAcademico.nivel.nombre },
                sede: estudiante.nivelAcademico.sede
                  ? { nombre: estudiante.nivelAcademico.sede.nombre }
                  : null,
              }
            : null,
        },
        institucion: {
          nombreInstitucion: estudiante.institucion.nombreInstitucion,
          lema: "Excelencia Educativa",
          codigoModular: estudiante.institucion.codigoModular,
          logo: estudiante.institucion.logo,
        },
        qrCode,
      },
    };
  } catch (error) {
    console.error("Error fetching student card data:", error);
    return { error: "Error al obtener los datos para el carnet" };
  }
}
