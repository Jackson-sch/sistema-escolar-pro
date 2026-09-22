"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

/**
 * Busca estudiantes por nombre, apellidos o DNI
 */
export async function searchStudentsAction(query: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const role = session.user.role;
    const userId = session.user.id;
    const institucionId = session.user.institucionId;

    const institucion = await prisma.institucionEducativa.findFirst({
      where: institucionId ? { id: institucionId } : undefined,
      select: { cicloEscolarActual: true },
    });
    const currentYear =
      institucion?.cicloEscolarActual || new Date().getFullYear();

    const where: any = {
      role: "estudiante" as Role,
      institucionId: institucionId || undefined,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { apellidoPaterno: { contains: query, mode: "insensitive" } },
        { apellidoMaterno: { contains: query, mode: "insensitive" } },
        { dni: { contains: query, mode: "insensitive" } },
      ],
    };

    if (role === "profesor") {
      const teacherSections = await prisma.nivelAcademico.findMany({
        where: {
          OR: [
            { tutorId: userId },
            { cursos: { some: { profesorId: userId } } },
          ],
          anioAcademico: currentYear,
        },
        select: { id: true },
      });

      const sectionIds = teacherSections.map((s) => s.id);

      where.matriculas = {
        some: {
          nivelAcademicoId: { in: sectionIds },
          anioAcademico: currentYear,
          estado: "activo",
        },
      };
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        nivelAcademico: {
          include: {
            grado: true,
          },
        },
      },
      take: 10,
    });

    return { data: serialize(students) };
  } catch (error) {
    console.error("Error searching students:", error);
    return { error: "No se pudo realizar la búsqueda" };
  }
}

/**
 * Busca un estudiante por su ID
 */
export async function getStudentByIdAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const student = await prisma.user.findUnique({
      where: {
        id,
        role: "estudiante" as Role,
        institucionId: session.user.institucionId || undefined,
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        fechaNacimiento: true,
        direccion: true,
      },
    });

    if (!student) return { data: null };

    return { data: serialize(student) };
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    return { error: "Error al buscar el estudiante" };
  }
}

/**
 * Obtiene el expediente 360 completo del estudiante para su página dedicada
 */
export async function getStudentFullProfileDetailAction(studentId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: "estudiante" as Role,
        institucionId: session.user.institucionId || undefined,
      },
      include: {
        estado: true,
        institucion: {
          select: {
            id: true,
            nombreInstitucion: true,
            codigoModular: true,
            cicloEscolarActual: true,
          },
        },
        nivelAcademico: {
          include: {
            grado: true,
            nivel: true,
            sede: true,
            tutor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                telefono: true,
                email: true,
              },
            },
          },
        },
        matriculas: {
          orderBy: { anioAcademico: "desc" },
          include: {
            nivelAcademico: {
              include: {
                grado: true,
                nivel: true,
                sede: true,
              },
            },
          },
        },
        padresTutores: {
          include: {
            padreTutor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                dni: true,
                telefono: true,
                email: true,
                direccion: true,
                ocupacion: true,
              },
            },
          },
        },
        cronogramaPagos: {
          orderBy: { fechaVencimiento: "asc" },
          include: {
            concepto: true,
            pagos: true,
          },
        },
        notas: {
          include: {
            evaluacion: {
              include: {
                curso: true,
                periodo: true,
                tipoEvaluacion: true,
              },
            },
          },
        },
        asistencias: {
          orderBy: { fecha: "desc" },
          take: 30,
        },
        logros: {
          orderBy: { fecha: "desc" },
        },
        fichasEstudiante: {
          orderBy: { createdAt: "desc" },
          include: {
            especialista: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
              },
            },
          },
        },
        documentosEstudiante: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return { error: "Estudiante no encontrado" };
    }

    return { success: true, data: serialize(student) };
  } catch (error) {
    console.error("Error fetching full student profile:", error);
    return { error: "Error al cargar el expediente del estudiante" };
  }
}
