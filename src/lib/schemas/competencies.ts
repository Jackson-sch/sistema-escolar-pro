import * as z from "zod"

export const CompetencySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  areaCurricularId: z.string().min(1, "El área curricular es requerida"),
})

export const CapacitySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  competenciaId: z.string().min(1, "La competencia es requerida"),
})

export type CompetencyValues = z.infer<typeof CompetencySchema>
export type CapacityValues = z.infer<typeof CapacitySchema>
