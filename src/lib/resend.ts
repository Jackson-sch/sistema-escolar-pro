import { Resend } from "resend";
import { getSystemVariable } from "@/lib/settings";

/**
 * Inicializa y retorna el cliente de Resend.
 * La API Key se obtiene dinámicamente desde la base de datos (VariableSistema).
 */
export async function getResendClient() {
  const apiKey = await getSystemVariable("RESEND_API_KEY");
  
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY no encontrada en la base de datos ni en el entorno.");
    return null;
  }

  return new Resend(apiKey);
}
