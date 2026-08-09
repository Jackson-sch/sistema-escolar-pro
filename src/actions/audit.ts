"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface GetAuditLogsParams {
  entidad?: string;
  accion?: string;
  usuarioId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Obtener la lista paginada de logs de auditoría para la institución actual
 */
export async function getAuditLogsAction(params: GetAuditLogsParams = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const rolesAutorizados = ["super_admin", "administrador", "administrativo", "director", "admin"];
    if (!rawRole || !rolesAutorizados.includes(rawRole)) {
      return { error: "No tiene permisos para ver la bitácora de auditoría" };
    }

    const {
      entidad,
      accion,
      usuarioId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = params;

    const where: any = {};

    // Multi-tenant check
    if (rawRole !== "super_admin") {
      if (!session.user.institucionId) {
        return { error: "Institución no especificada" };
      }
      where.institucionId = session.user.institucionId;
    }

    if (entidad && entidad !== "ALL") where.entidad = entidad;
    if (accion && accion !== "ALL") where.accion = accion;
    if (usuarioId && usuarioId !== "ALL") where.usuarioId = usuarioId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error al obtener los logs de auditoría:", error);
    return { error: "Error interno al recuperar los registros de auditoría" };
  }
}
