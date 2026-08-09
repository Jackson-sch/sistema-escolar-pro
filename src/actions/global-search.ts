"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export interface GlobalSearchResult {
  id: string;
  type: "estudiante" | "personal" | "padre";
  label: string;
  sublabel: string;
  url: string;
}

export async function globalSearchAction(query: string): Promise<GlobalSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const cleanQuery = query.trim();
    const institucionId = session.user.institucionId;

    // Buscar usuarios (estudiantes, profesores, administrativos)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          institucionId ? { institucionId } : {},
          {
            OR: [
              { name: { contains: cleanQuery, mode: "insensitive" } },
              { apellidoPaterno: { contains: cleanQuery, mode: "insensitive" } },
              { apellidoMaterno: { contains: cleanQuery, mode: "insensitive" } },
              { dni: { contains: cleanQuery, mode: "insensitive" } },
              { codigoEstudiante: { contains: cleanQuery, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        role: true,
        codigoEstudiante: true,
        nivelAcademico: {
          select: {
            grado: { select: { nombre: true } },
            seccion: true,
          },
        },
      },
      take: 8,
    });

    return users.map((u) => {
      const fullName = `${u.name || ""} ${u.apellidoPaterno || ""} ${u.apellidoMaterno || ""}`.trim();
      const dniText = u.dni ? `DNI: ${u.dni}` : "";
      
      if (u.role === "estudiante") {
        const gradoSeccion = u.nivelAcademico
          ? `${u.nivelAcademico.grado?.nombre || ""} - Secc "${u.nivelAcademico.seccion}"`
          : "Sin Sección";
        return {
          id: u.id,
          type: "estudiante",
          label: fullName || "Estudiante",
          sublabel: `Estudiante · ${gradoSeccion} ${dniText ? `· ${dniText}` : ""}`,
          url: `/gestion/estudiantes?search=${encodeURIComponent(u.dni || u.codigoEstudiante || fullName)}`,
        };
      }

      if (u.role === "profesor" || u.role === "administrativo" || u.role === "super_admin") {
        return {
          id: u.id,
          type: "personal",
          label: fullName || "Personal",
          sublabel: `Personal (${String(u.role).toUpperCase()}) ${dniText ? `· ${dniText}` : ""}`,
          url: `/gestion/personal?search=${encodeURIComponent(u.dni || fullName)}`,
        };
      }

      return {
        id: u.id,
        type: "padre",
        label: fullName || "Padre/Apoderado",
        sublabel: `Apoderado ${dniText ? `· ${dniText}` : ""}`,
        url: `/gestion/estudiantes?search=${encodeURIComponent(fullName)}`,
      };
    });
  } catch (error) {
    console.error("Error in globalSearchAction:", error);
    return [];
  }
}
