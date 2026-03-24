"use server";

import { getSystemVariable } from "@/lib/settings";

/**
 * Obtiene múltiples variables del sistema de forma segura desde el servidor.
 * Útil para componentes de cliente que no pueden importar lib/settings directamente.
 */
export async function getSystemSettingsAction(keys: string[]) {
  try {
    const results = await Promise.all(
      keys.map((key) => getSystemVariable(key)),
    );

    // Mapear de vuelta a un objeto para facilidad de uso
    const settings: Record<string, string> = {};
    keys.forEach((key, index) => {
      settings[key] = results[index];
    });

    return { data: settings };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return { error: "No se pudieron obtener las configuraciones" };
  }
}
