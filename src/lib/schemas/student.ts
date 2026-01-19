import * as z from "zod"

export const StudentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
  email: z.string().optional().or(z.literal("")),
  fechaNacimiento: z.date({
    message: "La fecha de nacimiento es requerida",
  }),
  sexo: z.string().min(1, "El sexo es requerido"),
  nacionalidad: z.string().min(1, "Requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  departamento: z.string().min(1, "Requerido"),
  provincia: z.string().min(1, "Requerido"),
  distrito: z.string().min(1, "Requerido"),
  ubigeo: z.string().optional().or(z.literal("")),
  codigoEstudiante: z.string().optional().or(z.literal("")),
  codigoSiagie: z.string().optional().or(z.literal("")),
  tipoSangre: z.string().optional().or(z.literal("")),
  alergias: z.string().optional().or(z.literal("")),
  condicionesMedicas: z.string().optional().or(z.literal("")),
  estadoId: z.string().min(1, "El estado es requerido"),
  institucionId: z.string().min(1, "La institución es requerida"),

  // Datos del Apoderado (Opcionales para el registro rápido)
  nombreApoderado: z.string().optional().or(z.literal("")),
  dniApoderado: z.string().optional().or(z.literal("")),
  telefonoApoderado: z.string().optional().or(z.literal("")),
  parentescoApoderado: z.string().optional().or(z.literal("")),
})

export type StudentValues = z.infer<typeof StudentSchema>
