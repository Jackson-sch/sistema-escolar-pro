"use server";
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/storage";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { getActiveSedeId } from "@/actions/active-sede";

/**
 * Limpia los datos convirtiendo strings vacíos en undefined para campos que deben ser únicos o nulos.
 * Esto evita errores de restricción única en la base de datos (PostgreSQL trata "" como un valor).
 */
const sanitizeData = (data: any) => {
  const result = { ...data };
  const uniqueFields = [
    "email",
    "dni",
    "codigoEstudiante",
    "codigoSiagie",
    "codigoModular",
    "dniApoderado",
  ];

  uniqueFields.forEach((field) => {
    if (result[field] === "") {
      result[field] = null; // En la base de datos, múltiples NULL son permitidos en campos únicos, pero no múltiples ""
    }
  });

  return result;
};

/**
 * Obtiene la lista de estudiantes con paginación, búsqueda y filtros
 */
export async function getStudentsAction(params?: {
  page?: number;
  pageSize?: number;
  estado?: string;
  nivel?: string;
}) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    const userId = session?.user?.id;
    const institucionId = session?.user?.institucionId;
    const activeSedeId = await getActiveSedeId();

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 25;
    const estado = params?.estado || "";
    const nivel = params?.nivel || "";
    const skip = (page - 1) * pageSize;

    const institucion = await prisma.institucionEducativa.findFirst({
      where: institucionId ? { id: institucionId } : undefined,
      select: { cicloEscolarActual: true },
    });
    const currentYear =
      institucion?.cicloEscolarActual || new Date().getFullYear();

    const where: any = {
      role: "estudiante" as Role,
      institucionId: institucionId || undefined,
    };

    if (activeSedeId) {
      where.matriculas = {
        some: {
          anioAcademico: currentYear,
          nivelAcademico: { sedeId: activeSedeId },
        },
      };
    }

    if (estado && estado !== "ALL") {
      where.estado = { nombre: estado };
    }

    if (role === "profesor") {
      const teacherSections = await prisma.nivelAcademico.findMany({
        where: {
          OR: [
            { tutorId: userId },
            { cursos: { some: { profesorId: userId } } },
          ],
          anioAcademico: currentYear,
          institucionId: institucionId || undefined,
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

    if (nivel && nivel !== "ALL") {
      const matriculaFilter: any = {
        some: {
          anioAcademico: currentYear,
          nivelAcademico: { nivel: { nombre: nivel } },
        },
      };

      if (where.matriculas) {
        Object.assign(where.matriculas.some, matriculaFilter.some);
      } else {
        where.matriculas = matriculaFilter;
      }
    }

    const [students, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          estado: true,
          institucion: {
            select: { nombreInstitucion: true },
          },
          matriculas: {
            where: { anioAcademico: currentYear },
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
              padreTutor: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    const mappedStudents = students.map((s) => {
      const currentMatricula = s.matriculas[0];
      return {
        ...s,
        nivelAcademico: currentMatricula?.nivelAcademico || null,
        matriculadoEsteAnio: !!currentMatricula,
      };
    });

    return { data: serialize(mappedStudents), totalCount };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { error: "No se pudieron obtener los estudiantes" };
  }
}

/**
 * Obtiene los estados disponibles para usuarios
 */
export async function getUserStatusesAction() {
  try {
    const statuses = await prisma.estadoUsuario.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
    });
    const uniqueMap = new Map<string, typeof statuses[0]>();
    for (const status of statuses) {
      if (status.nombre && !uniqueMap.has(status.nombre)) {
        uniqueMap.set(status.nombre, status);
      }
    }
    return { data: serialize(Array.from(uniqueMap.values())) };
  } catch (error) {
    console.error("Error al cargar estados:", error);
    return { error: "Error al cargar estados" };
  }
}

/**
 * Obtiene las instituciones disponibles
 */
export async function getInstitucionesAction() {
  try {
    const instituciones = await prisma.institucionEducativa.findMany({
      select: { id: true, nombreInstitucion: true },
    });
    return { data: serialize(instituciones) };
  } catch (error) {
    console.error("Error al cargar instituciones:", error);
    return { error: "Error al cargar instituciones" };
  }
}

/**
 * Obtiene los niveles académicos (Grados/Secciones)
 */
export async function getNivelesAcademicosAction(anio?: number, nivelId?: string) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    const userId = session?.user?.id;
    const institucionId = session?.user?.institucionId;

    const where: any = {
      activo: true,
      anioAcademico: anio,
      nivelId: nivelId || undefined,
      institucionId: institucionId || undefined,
    };

    if (role === "profesor") {
      where.OR = [
        { tutorId: userId },
        { cursos: { some: { profesorId: userId } } },
      ];
    }

    const niveles = await prisma.nivelAcademico.findMany({
      where,
      include: {
        grado: true,
        nivel: true,
        sede: true,
        _count: {
          select: { matriculas: true },
        },
      },
      orderBy: [
        { nivel: { nombre: "asc" } },
        { grado: { orden: "asc" } },
        { seccion: "asc" },
      ],
    });
    return { data: serialize(niveles) };
  } catch {
    return { error: "Error al cargar niveles académicos" };
  }
}

/**
 * Intenta dividir un nombre completo en nombre, paterno y materno.
 */
const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], paterno: "", materno: "" };
  if (parts.length === 2)
    return { name: parts[0], paterno: parts[1], materno: "" };
  if (parts.length === 3)
    return { name: parts[0], paterno: parts[1], materno: parts[2] };

  // Para 4 o más partes, asumimos que las dos primeras son nombres o el primero es nombre y los dos últimos apellidos
  // Usualmente en Perú: [Nombres...] [Paterno] [Materno]
  // Una regla simple: el último es materno, el penúltimo es paterno, el resto es nombre
  const materno = parts.pop() || "";
  const paterno = parts.pop() || "";
  const name = parts.join(" ");

  return { name, paterno, materno };
};

/**
 * Crea un nuevo estudiante
 */
export async function createStudentAction(values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "administrativo"];
    if (!allowedRoles.includes(rawRole)) {
      return { error: "No tienes permiso para registrar estudiantes." };
    }

    const institucionId = session.user.institucionId;

    const {
      nombreApoderado,
      dniApoderado,
      telefonoApoderado,
      parentescoApoderado,
      ...studentData
    } = values;

    const hashedPassword = await bcrypt.hash(studentData.dni, 10);

    // Crear el estudiante
    const student = await prisma.user.create({
      data: {
        ...sanitizeData(studentData),
        institucionId: institucionId || studentData.institucionId,
        fechaNacimiento: studentData.fechaNacimiento
          ? new Date(studentData.fechaNacimiento)
          : null,
        role: "estudiante" as Role,
        password: hashedPassword,
      },
    });

    // Si hay datos de apoderado, vincular o crear
    if (dniApoderado && nombreApoderado) {
      let apoderado = await prisma.user.findUnique({
        where: { dni: dniApoderado },
      });

      if (apoderado && apoderado.role !== "padre") {
        const roleText =
          apoderado.role === "estudiante" ? "Estudiante" : "Personal";
        return {
          error: `El DNI del apoderado ${dniApoderado} ya está registrado como ${roleText} y no puede ser usado aquí.`,
        };
      }

      if (!apoderado) {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        apoderado = await prisma.user.create({
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            dni: dniApoderado,
            telefono: telefonoApoderado,
            role: "padre" as Role,
            estadoId: studentData.estadoId, // Mismo estado por defecto
            institucionId: studentData.institucionId,
          },
        });
      }

      await prisma.relacionFamiliar.create({
        data: {
          hijoId: student.id,
          padreTutorId: apoderado.id,
          parentesco: parentescoApoderado || "APODERADO",
          contactoPrimario: true,
        },
      });
    }

    revalidatePath("/gestion/estudiantes");
    return {
      success: "Estudiante registrado con éxito",
      data: serialize(student),
    };
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === "P2002") {
      return { error: "El DNI o correo ya se encuentra registrado" };
    }
    return { error: "Error al registrar el estudiante" };
  }
}

/**
 * Actualiza un estudiante existente
 */
export async function updateStudentAction(id: string, values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const {
      nombreApoderado,
      dniApoderado,
      telefonoApoderado,
      parentescoApoderado,
      ...studentData
    } = values;

    // Si se está actualizando la imagen, eliminar la anterior físicamente
    if (Object.prototype.hasOwnProperty.call(studentData, "image")) {
      const currentStudent = await prisma.user.findUnique({
        where: { id },
        select: { image: true },
      });

      if (currentStudent?.image && currentStudent.image !== studentData.image) {
        await deleteFile(currentStudent.image);
      }
    }

    // 1. Actualizar el estudiante
    const student = await prisma.user.update({
      where: { id },
      data: {
        ...sanitizeData(studentData),
        fechaNacimiento: studentData.fechaNacimiento
          ? new Date(studentData.fechaNacimiento)
          : undefined,
      },
    });

    // 2. Gestionar el Apoderado si se proporcionaron datos básicos
    if (dniApoderado && nombreApoderado) {
      // Buscar o crear el apoderado por DNI
      let apoderado = await prisma.user.findUnique({
        where: { dni: dniApoderado },
      });

      if (apoderado && apoderado.role !== "padre") {
        const roleText =
          apoderado.role === "estudiante" ? "Estudiante" : "Personal";
        return {
          error: `El DNI del apoderado ${dniApoderado} ya está registrado como ${roleText} y no puede ser usado aquí.`,
        };
      }

      if (!apoderado) {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        apoderado = await prisma.user.create({
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            dni: dniApoderado,
            telefono: telefonoApoderado,
            role: "padre" as Role,
            estadoId: studentData.estadoId,
            institucionId: studentData.institucionId,
          },
        });
      } else {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        // Si ya existe, actualizamos sus datos de contacto
        await prisma.user.update({
          where: { id: apoderado.id },
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            telefono: telefonoApoderado,
          },
        });
      }

      // Verificamos si ya existe la relación
      const relacionExistente = await prisma.relacionFamiliar.findFirst({
        where: {
          hijoId: id,
          padreTutorId: apoderado.id,
        },
      });

      if (!relacionExistente) {
        // Antes de crear una nueva primaria, quitamos la marca a las otras
        await prisma.relacionFamiliar.updateMany({
          where: { hijoId: id },
          data: { contactoPrimario: false },
        });

        await prisma.relacionFamiliar.create({
          data: {
            hijoId: id,
            padreTutorId: apoderado.id,
            parentesco: parentescoApoderado || "APODERADO",
            contactoPrimario: true,
          },
        });
      } else {
        // Si existe, actualizamos el parentesco
        await prisma.relacionFamiliar.update({
          where: { id: relacionExistente.id },
          data: {
            parentesco: parentescoApoderado || "APODERADO",
            contactoPrimario: true,
          },
        });
      }
    }

    revalidatePath("/gestion/estudiantes");
    return {
      success: "Estudiante actualizado correctamente",
      data: serialize(student),
    };
  } catch (error: any) {
    console.error("Error updating student:", error);
    return { error: "No se pudo actualizar la información del estudiante" };
  }
}

/**
 * Elimina un estudiante
 */
export async function deleteStudentAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    // Obtener imagen antes de eliminar para limpieza física
    const student = await prisma.user.findUnique({
      where: { id },
      select: { image: true },
    });

    // Eliminar imagen física antes de borrar al estudiante
    if (student?.image) {
      await deleteFile(student.image);
    }

    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/gestion/estudiantes");
    return { success: "Estudiante eliminado correctamente" };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { error: "No se pudo eliminar el estudiante" };
  }
}
/**
 * Busca un apoderado por su DNI
 */
export async function getGuardianByDniAction(dni: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const guardian = await prisma.user.findFirst({
      where: {
        dni,
        role: "padre" as Role,
        institucionId: session.user.institucionId || undefined,
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        telefono: true,
        email: true,
      }
    });

    if (!guardian) return { data: null };

    return { data: serialize(guardian) };
  } catch (error) {
    console.error("Error fetching guardian by DNI:", error);
    return { error: "Error al buscar el apoderado" };
  }
}

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
/**
 * Obtiene las estadísticas resumidas para el panel de gestión de estudiantes
 */
export async function getStudentDashboardStatsAction() {
  try {
    const session = await auth();
    const institucionId = session?.user?.institucionId;

    const institucion = await prisma.institucionEducativa.findFirst({
      where: institucionId ? { id: institucionId } : undefined,
      select: { cicloEscolarActual: true },
    });
    const currentYear = institucion?.cicloEscolarActual || new Date().getFullYear();

    const whereEstudiantes: any = {
      role: "estudiante" as Role,
      institucionId: institucionId || undefined,
    };

    const whereActiveMatricula: any = {
      anioAcademico: currentYear,
      estudiante: {
        institucionId: institucionId || undefined,
      },
    };

    const [totalStudents, activeEnrollments, newEnrollments] = await Promise.all([
      prisma.user.count({ where: whereEstudiantes }),
      prisma.matricula.count({ where: whereActiveMatricula }),
      prisma.matricula.count({
        where: {
          ...whereActiveMatricula,
          esPrimeraVez: true,
        },
      }),
    ]);

    return {
      data: {
        totalStudents,
        activeEnrollments,
        newEnrollments,
        currentYear,
      },
    };
  } catch (error) {
    console.error("Error fetching student dashboard stats:", error);
    return { error: "No se pudieron obtener las estadísticas de estudiantes" };
  }
}
