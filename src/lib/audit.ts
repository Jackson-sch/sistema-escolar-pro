import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export interface LogAuditParams {
  accion: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT" | "CHANGE_ROLE" | "CHANGE_GRADE";
  entidad: string;
  entidadId?: string;
  detalles?: Record<string, any>;
  institucionId?: string;
  usuarioId?: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
}

/**
 * Helper para registrar eventos en la bitácora de auditoría.
 * Se ejecuta de manera tolerante a fallos para no interrumpir la transacción principal.
 */
export async function logAuditEvent(params: LogAuditParams) {
  try {
    let {
      usuarioId,
      usuarioNombre,
      usuarioEmail,
      institucionId,
      accion,
      entidad,
      entidadId,
      detalles,
    } = params;

    // Si faltan datos del usuario o institución, intentamos resolver la sesión actual
    if (!usuarioId || !institucionId) {
      const session = await auth();
      if (session?.user) {
        usuarioId = usuarioId || session.user.id;
        usuarioNombre = usuarioNombre || session.user.name || undefined;
        usuarioEmail = usuarioEmail || session.user.email || undefined;
        institucionId = institucionId || session.user.institucionId || undefined;
      }
    }

    await prisma.auditLog.create({
      data: {
        accion,
        entidad,
        entidadId,
        detalles: detalles ? structuredClone(detalles) : undefined,
        usuarioId: usuarioId || null,
        usuarioNombre: usuarioNombre || null,
        usuarioEmail: usuarioEmail || null,
        institucionId: institucionId || null,
      },
    });
  } catch (error) {
    console.error("[AuditLog Error] Falló el registro de auditoría:", error);
  }
}
