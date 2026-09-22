"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { getActiveSedeId } from "@/actions/active-sede";

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
    const uniqueMap = new Map<string, (typeof statuses)[0]>();
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
export async function getNivelesAcademicosAction(
  anio?: number,
  nivelId?: string,
) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    const userId = session?.user?.id;
    const institucionId = session?.user?.institucionId;

    let targetYear = anio;
    if (!targetYear) {
      const inst = await prisma.institucionEducativa.findFirst({
        where: institucionId ? { id: institucionId } : undefined,
        select: { cicloEscolarActual: true },
      });
      targetYear = inst?.cicloEscolarActual || new Date().getFullYear();
    }

    const where: any = {
      activo: true,
      anioAcademico: targetYear,
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
      },
    });

    if (!guardian) return { data: null };

    return { data: serialize(guardian) };
  } catch (error) {
    console.error("Error fetching guardian by DNI:", error);
    return { error: "Error al buscar el apoderado" };
  }
}
