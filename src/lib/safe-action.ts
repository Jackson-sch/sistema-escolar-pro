import { auth } from "@/auth"
import { z } from "zod"

export type ActionState<T> =
  | { success: T; error?: never }
  | { error: string; success?: never }

/**
 * Crea una acción segura con validación de esquema, autenticación y autorización opcional.
 * También inyecta el ID de la institución de la sesión para asegurar la multi-tenencia.
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  action: (data: TInput, session: any) => Promise<ActionState<TOutput>>,
  options?: { roles?: string[] }
) {
  return async (data: TInput): Promise<ActionState<TOutput>> => {
    try {
      // 1. Autenticación
      const session = await auth()
      if (!session || !session.user) {
        return { error: "No autorizado. Por favor inicie sesión." }
      }

      // 2. Autorización (Opcional por roles)
      if (options?.roles && !options.roles.includes(session.user.role || "")) {
        return { error: "No tienes permiso para realizar esta acción." }
      }

      // 3. Validación de esquema
      const validatedFields = schema.safeParse(data)
      if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors)
        return { error: "Campos inválidos. Verifique los datos enviados." }
      }

      // 4. Ejecución del core de la acción
      return await action(validatedFields.data, session)
    } catch (error) {
      console.error("Action error:", error)
      return { error: "Ocurrió un error inesperado al procesar la solicitud." }
    }
  }
}
