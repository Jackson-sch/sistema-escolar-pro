import * as z from "zod"

export const CurricularAreaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  descripcion: z.string(),
  orden: z.number().int(),
  color: z.string(),
  activa: z.boolean(),
  creditos: z.number().int().nullable(),
  nivelId: z.string(),
  institucionId: z.string().min(1, "La institución es requerida"),
})

export const CourseSchema = z.object({
  nombre: z.string().min(1, "El nombre del curso es requerido"),
  codigo: z.string().min(1, "El código del curso es requerido"),
  descripcion: z.string(),
  anioAcademico: z.number().int().min(2024).max(2100),
  horasSemanales: z.number().int().min(1, "Mínimo 1 hora semanal"),
  creditos: z.number().int(),
  areaCurricularId: z.string().min(1, "El área curricular es requerida"),
  nivelAcademicoId: z.string().min(1, "La sección es requerida"),
  profesorId: z.string().min(1, "El profesor es requerido"),
  activo: z.boolean(),
})

export type CurricularAreaValues = z.infer<typeof CurricularAreaSchema>
export type CourseValues = z.infer<typeof CourseSchema>
