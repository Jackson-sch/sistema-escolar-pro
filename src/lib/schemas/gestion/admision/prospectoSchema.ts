import * as z from "zod";

export const prospectoSchema = z.object({
  dni: z.string().min(8, "DNI inválido").max(8, "DNI inválido").optional(),
  nombre: z.string().min(2, "Nombre requerido"),
  apellidoPaterno: z.string().min(2, "Apellido paterno requerido"),
  apellidoMaterno: z.string().min(2, "Apellido materno requerido"),
  email: z.email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().min(7, "Teléfono inválido"),
  direccion: z.string().optional(),
  gradoInteresId: z.string().min(1, "Debe seleccionar un grado"),
  anioPostulacion: z.number().min(2024, "Año inválido"),
  institucionId: z.string().min(1, "Debe seleccionar una institución"),
});

