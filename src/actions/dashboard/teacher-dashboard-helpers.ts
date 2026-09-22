import prisma from "@/lib/prisma";

export interface TeacherStudentMetrics {
  studentCountMap: Map<string, number>;
  totalUniqueStudents: number;
}

/**
 * Calcula el número de estudiantes por sección y el total de estudiantes únicos
 * asignados a las secciones del docente.
 */
export async function getTeacherStudentMetrics(
  nivelAcademicoIds: string[],
): Promise<TeacherStudentMetrics> {
  const studentCountMap = new Map<string, number>();
  let totalUniqueStudents = 0;

  if (nivelAcademicoIds.length === 0) {
    return { studentCountMap, totalUniqueStudents };
  }

  // Contar matrículas activas en cada sección
  const counts = await prisma.matricula.groupBy({
    by: ["nivelAcademicoId"],
    where: {
      nivelAcademicoId: { in: nivelAcademicoIds },
      estado: "activo",
    },
    _count: {
      _all: true,
    },
  });

  counts.forEach((c) => {
    if (c.nivelAcademicoId) {
      studentCountMap.set(c.nivelAcademicoId, c._count._all);
    }
  });

  // Fallback con User.nivelAcademicoId si el conteo fuera mayor
  const userCounts = await prisma.user.groupBy({
    by: ["nivelAcademicoId"],
    where: {
      nivelAcademicoId: { in: nivelAcademicoIds },
      role: "estudiante",
    },
    _count: {
      _all: true,
    },
  });

  userCounts.forEach((c) => {
    if (c.nivelAcademicoId) {
      const current = studentCountMap.get(c.nivelAcademicoId) || 0;
      if (c._count._all > current) {
        studentCountMap.set(c.nivelAcademicoId, c._count._all);
      }
    }
  });

  // Contar total de estudiantes ÚNICOS
  const uniqueMatriculas = await prisma.matricula.groupBy({
    by: ["estudianteId"],
    where: {
      nivelAcademicoId: { in: nivelAcademicoIds },
      estado: "activo",
    },
  });
  totalUniqueStudents = uniqueMatriculas.length;

  if (totalUniqueStudents === 0) {
    const uniqueUsers = await prisma.user.groupBy({
      by: ["id"],
      where: {
        nivelAcademicoId: { in: nivelAcademicoIds },
        role: "estudiante",
      },
    });
    totalUniqueStudents = uniqueUsers.length;
  }

  return { studentCountMap, totalUniqueStudents };
}
