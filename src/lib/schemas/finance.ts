import { z } from "zod"

export const ConceptoSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  montoSugerido: z.number().min(0, "El monto debe ser 0 o superior"),
  moneda: z.string().default("PEN"),
  moraDiaria: z.number().default(0),
  activo: z.boolean().default(true),
})

export const CronogramaFilterSchema = z.object({
  estudianteId: z.string().optional(),
  conceptoId: z.string().optional(),
  pagado: z.boolean().optional(),
}).optional()

export const CreateCronogramaMasivoSchema = z.object({
  conceptoId: z.string().min(1, "Debe seleccionar un concepto"),
  monto: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  fechaVencimiento: z.union([z.date(), z.string()]),
  nivelAcademicoId: z.string().optional(),
})
