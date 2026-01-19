"use client"

import * as z from "zod"
import type { Control } from "react-hook-form"

// Definimos los tipos de gestión y modalidad fuera para reusarlos
export const TIPO_GESTION = ["PUBLICA", "PRIVADA", "PARROQUIAL", "CONVENIO"] as const
export const MODALIDAD = ["PRESENCIAL", "DISTANCIA"] as const

// Schema simplificado y robusto
export const institucionFormSchema = z.object({
  nombreInstitucion: z.string().min(2, "Mínimo 2 caracteres"),
  nombreComercial: z.string().optional().default(""),
  codigoModular: z.string().min(7, "El código modular debe tener al menos 7 dígitos"),
  tipoGestion: z.enum(TIPO_GESTION),
  modalidad: z.enum(MODALIDAD),
  ugel: z.string().min(1, "La UGEL es requerida"),
  dre: z.string().min(1, "La DRE es requerida"),
  direccion: z.string().min(1, "La dirección es requerida"),
  distrito: z.string().min(1, "El distrito es requerido"),
  provincia: z.string().min(1, "La provincia es requerido"),
  departamento: z.string().min(1, "El departamento es requerido"),
  telefono: z.string().optional().default(""),
  email: z.string().email("Email inválido").or(z.literal("")).optional().default(""),
  sitioWeb: z.string().url("URL inválida").or(z.literal("")).optional().default(""),
  cicloEscolarActual: z.coerce.number().min(2000).max(2100).default(2025),
  fechaInicioClases: z.string().min(1, "Fecha de inicio requerida"),
  fechaFinClases: z.string().min(1, "Fecha de fin requerida"),
  logo: z.string().optional(),
})

export type InstitucionFormValues = z.infer<typeof institucionFormSchema>

// Usar any en el genérico de Control como último recurso si persiste el error de asignabilidad
export type InstitucionFormControl = Control<any>

// Estilos compartidos
export const inputStyles = "bg-muted/5 border-border/40 focus:ring-primary/20"
export const labelStyles = "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
export const selectContentStyles = "bg-background/95 backdrop-blur-xl border-border/40 w-full"
