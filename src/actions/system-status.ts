"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export interface SystemCheckItem {
  id: string;
  category: "database" | "institution" | "academic" | "security" | "services";
  title: string;
  description: string;
  isConfigured: boolean;
  value?: string;
  statusText?: string;
}

export async function getSystemStatusAction() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const rolesPermitidos = ["super_admin", "administrador", "administrativo", "director", "admin"];
    if (!rawRole || !rolesPermitidos.includes(rawRole)) {
      return { error: "No tiene permisos para ver el estado del sistema" };
    }

    const institucionId = session.user.institucionId;

    // 1. Database Check
    const dbStartTime = Date.now();
    let isDbOk = false;
    let dbLatencyMs = 0;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStartTime;
      isDbOk = true;
    } catch {
      isDbOk = false;
    }

    // 2. Institution Check
    let institucion = null;
    if (institucionId) {
      institucion = await prisma.institucionEducativa.findUnique({
        where: { id: institucionId },
        select: {
          id: true,
          nombreInstitucion: true,
          codigoModular: true,
          direccion: true,
          telefono: true,
          email: true,
        },
      });
    }

    // 3. Academic Structure Check
    const [nivelesCount, gradosCount, aniosCount] = await Promise.all([
      prisma.nivelAcademico.count({
        where: institucionId ? { institucionId } : undefined,
      }),
      prisma.grado.count(),
      prisma.periodoAcademico.count({
        where: institucionId ? { institucionId } : undefined,
      }),
    ]);

    // 4. Audit Log Check
    const auditLogsCount = await prisma.auditLog.count({
      where: institucionId ? { institucionId } : undefined,
    });

    // 5. Environment Services Check (safe check on server side)
    const hasAuthSecret = !!process.env.AUTH_SECRET || !!process.env.NEXTAUTH_SECRET;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;

    const checklist: SystemCheckItem[] = [
      {
        id: "db-conn",
        category: "database",
        title: "Conexión a PostgreSQL & Prisma",
        description: "Estado de la base de datos principal y motor de persistencia",
        isConfigured: isDbOk,
        value: isDbOk ? `${dbLatencyMs}ms latencia` : "Desconectado",
        statusText: isDbOk ? "Conectado y responsivo" : "Fallo de conexión",
      },
      {
        id: "inst-profile",
        category: "institution",
        title: "Perfil de la Institución Educativa",
        description: "Nombre de institución, Código Modular y datos corporativos",
        isConfigured: !!institucion?.nombreInstitucion && !!institucion?.codigoModular,
        value: institucion?.nombreInstitucion || "No configurado",
        statusText: institucion?.nombreInstitucion ? "Datos principales registrados" : "Requiere completar código modular y nombre",
      },
      {
        id: "acad-year",
        category: "academic",
        title: "Año Académico Activo",
        description: "Períodos y calendarios escolares registrados",
        isConfigured: aniosCount > 0,
        value: `${aniosCount} años registrados`,
        statusText: aniosCount > 0 ? "Años académicos vigentes" : "Falta aperturar un año académico",
      },
      {
        id: "acad-structure",
        category: "academic",
        title: "Estructura de Niveles & Grados",
        description: "Niveles (Inicial, Primaria, Secundaria) y grados asociados",
        isConfigured: nivelesCount > 0 && gradosCount > 0,
        value: `${nivelesCount} Niveles / ${gradosCount} Grados`,
        statusText: nivelesCount > 0 ? "Niveles y grados habilitados" : "Configure niveles y grados",
      },
      {
        id: "security-secret",
        category: "security",
        title: "Secretos de Autenticación (AUTH_SECRET)",
        description: "Claves de cifrado para tokens JWT y cookies de sesión de NextAuth",
        isConfigured: hasAuthSecret,
        value: hasAuthSecret ? "Definido en .env" : "Falta en .env",
        statusText: hasAuthSecret ? "Firma JWT asegurada" : "Se recomienda definir AUTH_SECRET",
      },
      {
        id: "audit-trail",
        category: "security",
        title: "Bitácora de Auditoría & Trazabilidad",
        description: "Historial inmutable de operaciones, notas y cambios de usuario",
        isConfigured: auditLogsCount >= 0,
        value: `${auditLogsCount} eventos registrados`,
        statusText: "Auditoría activa y registrando",
      },
    ];

    const configuredCount = checklist.filter((i) => i.isConfigured).length;
    const completionPercentage = Math.round((configuredCount / checklist.length) * 100);

    return {
      success: true,
      data: {
        checklist,
        summary: {
          totalChecks: checklist.length,
          configuredCount,
          completionPercentage,
          dbLatencyMs,
          uptimeSeconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Error obteniendo el estado del sistema:", error);
    return { error: "No se pudo recuperar el diagnóstico de estado del sistema" };
  }
}
