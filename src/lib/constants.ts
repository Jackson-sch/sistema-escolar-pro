/**
 * Constantes globales para opciones de selects y valores estáticos del sistema.
 */

import { IconBuildingBank, IconCash, IconCircleDot, IconCreditCard, IconQrcode } from "@tabler/icons-react";

export const SEXO_OPTIONS = [
  { label: "Masculino", value: "MASCULINO" },
  { label: "Femenino", value: "FEMENINO" },
] as const;

export const TURNO_OPTIONS = [
  { label: "Mañana", value: "MANANA" },
  { label: "Tarde", value: "TARDE" },
  { label: "Noche", value: "NOCHE" },
] as const;

export const STAFF_ROLE_OPTIONS = [
  { label: "Docente / Profesor", value: "profesor" },
  { label: "Administrativo / Directivo", value: "administrativo" },
] as const;

export const ESCALA_MAGISTERIAL_OPTIONS = [
  { label: "I Escala", value: "I" },
  { label: "II Escala", value: "II" },
  { label: "III Escala", value: "III" },
  { label: "IV Escala", value: "IV" },
  { label: "V Escala", value: "V" },
  { label: "VI Escala", value: "VI" },
  { label: "VII Escala", value: "VII" },
  { label: "VIII Escala", value: "VIII" },
] as const;

export const PARENTESCO_OPTIONS = [
  { label: "Padre", value: "PADRE" },
  { label: "Madre", value: "MADRE" },
  { label: "Abuelo/a", value: "ABUELO/A" },
  { label: "Tío/a", value: "TIO/A" },
  { label: "Otro", value: "OTRO" },
] as const;

export const ANIO_LECTIVO_OPTIONS = [
  { label: "Año 2024", value: "2024" },
  { label: "Año 2025", value: "2025" },
  { label: "Año 2026", value: "2026" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Pendiente", value: "PENDING" },
  { label: "Pagado", value: "PAID" },
  { label: "Pagado Parcial", value: "PARTIALLY_PAID" },
  { label: "Vencido", value: "EXPIRED" },
] as const;

export const MESES_OPTIONS = [
  { id: 0, nombre: "Enero" },
  { id: 1, nombre: "Febrero" },
  { id: 2, nombre: "Marzo" },
  { id: 3, nombre: "Abril" },
  { id: 4, nombre: "Mayo" },
  { id: 5, nombre: "Junio" },
  { id: 6, nombre: "Julio" },
  { id: 7, nombre: "Agosto" },
  { id: 8, nombre: "Septiembre" },
  { id: 9, nombre: "Octubre" },
  { id: 10, nombre: "Noviembre" },
  { id: 11, nombre: "Diciembre" },
] as const;

export const GENERO_OPTIONS = SEXO_OPTIONS; // Alias para compatibilidad

export const BLOQUES_HORARIO = [
  { inicio: "07:00", fin: "07:45", tipo: "clase" },
  { inicio: "07:45", fin: "08:30", tipo: "clase" },
  { inicio: "08:30", fin: "09:15", tipo: "clase" },
  { inicio: "09:15", fin: "10:00", tipo: "clase" },
  { inicio: "10:00", fin: "10:30", tipo: "receso" },
  { inicio: "10:30", fin: "11:15", tipo: "clase" },
  { inicio: "11:15", fin: "12:00", tipo: "clase" },
  { inicio: "12:00", fin: "12:45", tipo: "clase" },
];


export const DIAS = [
  { id: "1", label: "LUNES" },
  { id: "2", label: "MARTES" },
  { id: "3", label: "MIÉRCOLES" },
  { id: "4", label: "JUEVES" },
  { id: "5", label: "VIERNES" },
];

export const METODOS = [
    {
      id: "Efectivo",
      label: "EFECTIVO",
      icon: IconCash,
      activeClass:
        "bg-blue-600/10 border-blue-500/40 text-blue-400 ring-2 ring-blue-500/20",
    },
    {
      id: "Tarjeta",
      label: "TARJETA",
      icon: IconCreditCard,
      activeClass:
        "bg-blue-600/10 border-blue-500/40 text-blue-400 ring-2 ring-blue-500/20",
    },
    {
      id: "Transferencia",
      label: "TRANSF.",
      icon: IconBuildingBank,
      activeClass:
        "bg-blue-600/10 border-blue-500/40 text-blue-400 ring-2 ring-blue-500/20",
    },
    {
      id: "Yape",
      label: "YAPE",
      icon: IconQrcode,
      activeClass:
        "bg-[#742284]/10 border-[#742284] text-[#a855f7] ring-2 ring-[#742284]/20",
      hoverClass: "hover:border-[#742284]",
    },
    {
      id: "Plin",
      label: "PLIN",
      icon: IconCircleDot,
      activeClass:
        "bg-[#00d1ce]/10 border-[#00d1ce] text-[#2dd4bf] ring-2 ring-[#00d1ce]/20",
      hoverClass: "hover:border-[#00d1ce]",
    },
  ];

export const colors = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#d946ef", // Fuchsia
  ];