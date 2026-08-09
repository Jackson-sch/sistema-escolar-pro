"use client";

import * as z from "zod";
import type { Control } from "react-hook-form";

// Definimos los tipos de gestión y modalidad
export const TIPO_GESTION = ["PUBLICA", "PRIVADA", "PARROQUIAL", "CONVENIO"] as const;
export const MODALIDAD = ["PRESENCIAL", "DISTANCIA"] as const;

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
  provincia: z.string().min(1, "La provincia es requerida"),
  departamento: z.string().min(1, "El departamento es requerido"),
  telefono: z.string().optional().default(""),
  email: z.email("Email inválido").or(z.literal("")).optional().default(""),
  sitioWeb: z.url("URL inválida").or(z.literal("")).optional().default(""),
  cicloEscolarActual: z.coerce.number().min(2000).max(2100).default(2025),
  fechaInicioClases: z.string().min(1, "Fecha de inicio requerida"),
  fechaFinClases: z.string().min(1, "Fecha de fin requerida"),
  logo: z.string().optional(),
});

export type InstitucionFormValues = z.infer<typeof institucionFormSchema>;

export type InstitucionFormControl = Control<any>;

// Estilos compartidos estandarizados EduNova Pro (rounded-xl)
export const inputStyles = "bg-background border-border/40 rounded-xl text-xs h-9";
export const labelStyles = "text-xs font-medium text-foreground/80";
export const selectContentStyles = "bg-background border-border/40 rounded-xl";
