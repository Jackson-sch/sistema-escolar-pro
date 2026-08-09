import { auth } from "@/auth";
import { z } from "zod";

export type ActionState<T> =
  | { success: T; error?: never; data?: any }
  | { error: string; success?: never; data?: any };

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
      const session = await auth();
      if (!session || !session.user) {
        return { error: "No autorizado. Por favor inicie sesión." };
      }

      // 2. Autorización por roles
      if (options?.roles && options.roles.length > 0) {
        const rawRole = (session.user.role || "").toString().toLowerCase().trim();
        if (!rawRole) {
          console.warn(`[SafeAction] Acceso denegado: Usuario sin rol definido '${session.user.email || session.user.id}'`);
          return { error: "No tienes un rol asignado para realizar esta acción." };
        }

        const allowedRoles = options.roles.map((r) => r.toLowerCase().trim());

        // Roles con permisos administrativos globales
        const isSuperOrAdmin =
          rawRole === "super_admin" ||
          rawRole === "admin" ||
          rawRole === "administrador" ||
          rawRole === "director";

        const isAllowed = isSuperOrAdmin || allowedRoles.includes(rawRole);

        if (!isAllowed) {
          console.warn(`[SafeAction] Acceso denegado para el usuario '${session.user.email || session.user.id}' con rol '${rawRole}'. Roles permitidos:`, options.roles);
          return { error: "No tienes permiso para realizar esta acción." };
        }
      }

      // 3. Validación de esquema Zod
      const validatedFields = schema.safeParse(data);
      if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors);
        return { error: "Campos inválidos. Verifique los datos enviados." };
      }

      // 4. Ejecución de la acción
      return await action(validatedFields.data, session);
    } catch (error) {
      console.error("Action error:", error);
      return { error: "Ocurrió un error inesperado al procesar la solicitud." };
    }
  };
}
