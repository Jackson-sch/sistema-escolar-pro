import * as z from "zod"

export const StaffSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
  email: z.string().email("Correo inválido").min(1, "El correo es requerido"),
  sexo: z.string().min(1, "El sexo es requerido"),
  telefono: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),

  // Datos Laborales
  role: z.enum(["profesor", "administrativo"]),
  cargoId: z.string().min(1, "El cargo es requerido"),
  area: z.string().min(1, "El área es requerida"),
  especialidad: z.string().optional().or(z.literal("")),
  titulo: z.string().optional().or(z.literal("")),
  numeroContrato: z.string().optional().or(z.literal("")),
  fechaIngreso: z.date({
    message: "La fecha de ingreso es requerida",
  }),
  estadoId: z.string().min(1, "El estado es requerido"),
  institucionId: z.string().min(1, "La institución es requerida"),

  // Profesional (Solo para docentes)
  colegioProfesor: z.string().optional().or(z.literal("")),
  escalaMagisterial: z.string().optional().or(z.literal("")),
})

export type StaffValues = z.infer<typeof StaffSchema>
