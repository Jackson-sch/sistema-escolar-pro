import * as z from "zod"

export const EnrollmentSchema = z.object({
  estudianteId: z.string().min(1, "El estudiante es requerido"),
  nivelAcademicoId: z.string().min(1, "El grado/sección es requerido"),
  anioAcademico: z.number().int().min(2024).max(2100),
  esPrimeraVez: z.boolean(),
  esRepitente: z.boolean(),
  procedencia: z.string(),
  observaciones: z.string(),
  estado: z.string().min(1),
  tipoBeca: z.string().optional(),
  descuentoBeca: z.number().min(0).optional(),
})

export type EnrollmentValues = z.infer<typeof EnrollmentSchema>
