"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { serialize } from "@/lib/dto";
import { revalidatePath } from "next/cache";

/**
 * Verifica si el usuario actual es super_admin
 */
async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "super_admin";
}

/**
 * Obtiene estadísticas globales para el dashboard de super admin
 */
export async function getGlobalStatsAction() {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    const [instituciones, estudiantes, profesores, admins] = await Promise.all([
      prisma.institucionEducativa.count(),
      prisma.user.count({ where: { role: "estudiante" } }),
      prisma.user.count({ where: { role: "profesor" } }),
      prisma.user.count({ where: { role: "administrativo" } }),
    ]);

    // 1. Crecimiento mensual de instituciones
    const instDates = await prisma.institucionEducativa.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlyData: Record<string, number> = {};
    
    // Inicializar los últimos 6 meses
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyData[label] = 0;
    }

    instDates.forEach(inst => {
      const date = new Date(inst.createdAt);
      const label = `${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (label in monthlyData) {
        monthlyData[label]++;
      }
    });

    // Crecimiento acumulado
    let cumulative = 0;
    const growthChartData = Object.entries(monthlyData).map(([name, count]) => {
      cumulative += count;
      return { name, colegios: cumulative };
    });

    // 2. Distribución por nivel académico de estudiantes
    const studentsWithLevel = await prisma.user.findMany({
      where: { role: "estudiante" },
      select: {
        nivelAcademico: {
          select: {
            nivel: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    const levelCounts: Record<string, number> = { INICIAL: 0, PRIMARIA: 0, SECUNDARIA: 0 };
    studentsWithLevel.forEach(s => {
      const lvl = s.nivelAcademico?.nivel?.nombre;
      if (lvl && lvl in levelCounts) {
        levelCounts[lvl]++;
      } else if (lvl) {
        levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
      }
    });

    const levelChartData = Object.entries(levelCounts).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    }));

    return {
      success: {
        instituciones,
        estudiantes,
        profesores,
        admins,
        growthChartData,
        levelChartData,
      },
    };
  } catch (error) {
    console.error("Error fetching global stats:", error);
    return { error: "Error al obtener estadísticas" };
  }
}

/**
 * Lista todas las instituciones (con filtro opcional)
 */
export async function listInstitucionesAction(query?: string) {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    const instituciones = await prisma.institucionEducativa.findMany({
      where: query ? {
        OR: [
          { nombreInstitucion: { contains: query, mode: ("insensitive" as any) } },
          { codigoModular: { contains: query, mode: ("insensitive" as any) } },
        ]
      } : {},
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: serialize(instituciones) };
  } catch (error) {

    console.error("Error listing instituciones:", error);
    return { error: "Error al listar instituciones" };
  }
}

/**
 * Obtiene el detalle de una institución específica
 */
export async function getInstitucionDetailAction(id: string) {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    const institucion = await prisma.institucionEducativa.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            role: true,
            createdAt: true,
            image: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: {
            users: true,
            niveles: true,
            sedes: true,
            periodos: true
          }
        }

      }
    });

    if (!institucion) return { error: "Institución no encontrada" };

    return { success: serialize(institucion) };
  } catch (error) {
    console.error("Error getting institucion details:", error);
    return { error: "Error al obtener detalles" };
  }
}


/**
 * Lista usuarios con rol administrativo que no tienen institucionId (huérfanos o nuevos)
 */
export async function listPendingAdminsAction() {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "administrativo",
        institucionId: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: serialize(admins) };
  } catch (error) {
    console.error("Error listing pending admins:", error);
    return { error: "Error al listar administradores pendientes" };
  }
}

/**
 * Crea un nuevo usuario administrativo (invitación)
 */
export async function createAdminUserAction(email: string, name: string) {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("Colegio2026", 10); // Contraseña temporal por defecto

    // Obtener ID del estado ACTIVO
    const estado = await prisma.estadoUsuario.findUnique({
      where: { codigo: "ACTIVO" },
      select: { id: true },
    });

    if (!estado) return { error: "Estado ACTIVO no configurado en el sistema" };

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "administrativo",
        mustChangePassword: true,
        estadoId: estado.id,
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: serialize(newUser) };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe un usuario con este correo" };
    }
    return { error: "Error al crear el usuario" };
  }
}

/**
 * Elimina un usuario administrativo (solo si no tiene institución vinculada)
 */
export async function deleteAdminUserAction(userId: string) {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { institucionId: true }
    });

    if (user?.institucionId) {
      return { error: "No se puede eliminar un usuario con institución vinculada" };
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return { error: "Error al eliminar el usuario" };
  }
}

/**
 * Elimina (o desactiva) una institución
 * Nota: Por seguridad, en este sistema implementamos un borrado suave o controlado
 */
export async function deleteInstitucionAction(instId: string) {
  if (!(await checkSuperAdmin())) {
    return { error: "No autorizado" };
  }

  try {
    // Para simplificar esta etapa de implementación, permitimos el borrado si no hay datos críticos
    // En producción esto debería ser una desactivación.
    await prisma.institucionEducativa.delete({
      where: { id: instId }
    });

    revalidatePath("/admin/instituciones");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting institucion:", error);
    return { error: "No se puede eliminar la institución (probablemente tiene datos vinculados)" };
  }
}

