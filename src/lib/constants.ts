/**
 * Constantes globales para opciones de selects y valores estáticos del sistema.
 */

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
