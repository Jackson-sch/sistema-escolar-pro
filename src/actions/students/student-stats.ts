"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

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
    const currentYear =
      institucion?.cicloEscolarActual || new Date().getFullYear();

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

    const [totalStudents, activeEnrollments, newEnrollments] =
      await Promise.all([
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
