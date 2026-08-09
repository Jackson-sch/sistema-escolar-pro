"use server";

import { getSystemVariable } from "@/lib/settings";
import { auth } from "@/auth";

// Claves que los usuarios autenticados normales pueden solicitar
const ALLOWED_SETTING_KEYS = [
  "NOMBRE_INSTITUCION",
  "LOGO_INSTITUCION",
  "CICLO_ESCOLAR_ACTUAL",
  "FORMATO_COMPROBANTE",
];

/**
 * Obtiene múltiples variables del sistema de forma segura desde el servidor.
 */
export async function getSystemSettingsAction(keys: string[]) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const isAdmin = ["super_admin", "admin", "administrador", "director"].includes(rawRole);

    // Filtrar claves no permitidas para usuarios no administradores
    const safeKeys = isAdmin
      ? keys
      : keys.filter((k) => ALLOWED_SETTING_KEYS.includes(k.toUpperCase()));

    const results = await Promise.all(
      safeKeys.map((key) => getSystemVariable(key)),
    );

    const settings: Record<string, string> = {};
    safeKeys.forEach((key, index) => {
      settings[key] = results[index];
    });

    return { data: settings };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return { error: "No se pudieron obtener las configuraciones" };
  }
}
