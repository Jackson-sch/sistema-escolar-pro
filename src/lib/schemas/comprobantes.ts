import { z } from "zod"

export const ComprobanteSchema = z.object({
  cronogramaId: z.string(),
  archivoUrl: z.string().url("URL de archivo inválida"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  bancoOrigen: z.string().optional(),
  numeroOperacion: z.string().optional(),
  fechaOperacion: z.string().or(z.date()),
})

export const AprobarComprobanteSchema = z.object({
  id: z.string(),
})

export const RechazarComprobanteSchema = z.object({
  id: z.string(),
  motivo: z.string().min(3, "El motivo debe tener al menos 3 caracteres"),
})
