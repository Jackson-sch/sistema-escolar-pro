import prisma from "@/lib/prisma"

/**
 * Obtiene el valor de una variable del sistema desde la base de datos.
 * Si no se encuentra en la DB, busca en las variables de entorno (process.env).
 * 
 * @param clave La clave de la variable (ej: GOOGLE_GENERATIVE_AI_API_KEY)
 * @param defaultValue Valor por defecto si no se encuentra en ningún lugar
 * @returns El valor de la variable
 */
export async function getSystemVariable(clave: string, defaultValue: string = ""): Promise<string> {
  try {
    // Intentar obtener desde la base de datos
    const variable = await prisma.variableSistema.findUnique({
      where: { clave }
    })

    if (variable && variable.activo) {
      return variable.valor
    }
  } catch (error) {
    // Si la DB falla (ej: durante el build o error de conexión), continuamos al fallback
    console.warn(`Error al consultar variable ${clave} en DB, usando fallback:`, error)
  }

  // Fallback a variables de entorno
  return process.env[clave] || defaultValue
}

/**
 * Versión síncrona para casos donde no se puede usar await (limitado a process.env)
 * NOTA: Esta versión NO consulta la base de datos.
 */
export function getEnvVariable(clave: string, defaultValue: string = ""): string {
  return process.env[clave] || defaultValue
}
