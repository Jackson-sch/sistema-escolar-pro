import ExcelJS from "exceljs";

export interface ExcelColorPalette {
  primary: string; // e.g. "1E293B" (Hex without # for ExcelJS argb)
  secondary: string;
  headerText: string;
  headerFill: string;
  zebraFill: string;
  borderColor: string;
  kpiBg: string;
  kpiText: string;
  kpiLabel: string;
  accent: string;
}

export const EXCEL_PALETTES: Record<string, ExcelColorPalette> = {
  navy: {
    primary: "FF0F172A",
    secondary: "FF1E293B",
    headerText: "FFFFFFFF",
    headerFill: "FF1E293B", // Slate 800
    zebraFill: "FFF8FAFC", // Slate 50
    borderColor: "FFE2E8F0", // Slate 200
    kpiBg: "FFF1F5F9",
    kpiText: "FF0F172A",
    kpiLabel: "FF64748B",
    accent: "FF3B82F6",
  },
  emerald: {
    primary: "FF064E3B",
    secondary: "FF047857",
    headerText: "FFFFFFFF",
    headerFill: "FF047857", // Emerald 700
    zebraFill: "FFF0FDF4", // Emerald 50
    borderColor: "FFD1FAE5", // Emerald 100
    kpiBg: "FFECFDF5",
    kpiText: "FF064E3B",
    kpiLabel: "FF059669",
    accent: "FF10B981",
  },
  indigo: {
    primary: "FF1E1B4B",
    secondary: "FF4338CA",
    headerText: "FFFFFFFF",
    headerFill: "FF4338CA", // Indigo 700
    zebraFill: "FFEEF2FF", // Indigo 50
    borderColor: "FFE0E7FF", // Indigo 100
    kpiBg: "FFE0E7FF",
    kpiText: "FF1E1B4B",
    kpiLabel: "FF4F46E5",
    accent: "FF6366F1",
  },
  violet: {
    primary: "FF2E1065",
    secondary: "FF6D28D9",
    headerText: "FFFFFFFF",
    headerFill: "FF6D28D9", // Violet 700
    zebraFill: "FFF5F3FF", // Violet 50
    borderColor: "FFEDE9FE", // Violet 100
    kpiBg: "FFEDE9FE",
    kpiText: "FF2E1065",
    kpiLabel: "FF7C3AED",
    accent: "FF8B5CF6",
  },
};

export interface BadgeStyle {
  fill: string;
  text: string;
  border?: string;
}

export const STATUS_BADGE_STYLES: Record<string, BadgeStyle> = {
  // Positivos / Activos
  activo: { fill: "FFDCFCE7", text: "FF166534" }, // Green
  pagado: { fill: "FFDCFCE7", text: "FF166534" },
  admitido: { fill: "FFDCFCE7", text: "FF166534" },
  matriculado: { fill: "FFDCFCE7", text: "FF166534" },
  presente: { fill: "FFDCFCE7", text: "FF166534" },
  aprobado: { fill: "FFDCFCE7", text: "FF166534" },

  // Advertencias / Pendientes
  pendiente: { fill: "FFFEF3C7", text: "FF92400E" }, // Amber
  evaluando: { fill: "FFFEF3C7", text: "FF92400E" },
  tardanza: { fill: "FFFEF3C7", text: "FF92400E" },
  justificada: { fill: "FFDBEAFE", text: "FF1E40AF" }, // Blue

  // Negativos / Vencidos / Inactivos
  inactivo: { fill: "FFFEE2E2", text: "FF991B1B" }, // Rose / Red
  vencido: { fill: "FFFEE2E2", text: "FF991B1B" },
  rechazado: { fill: "FFFEE2E2", text: "FF991B1B" },
  falta: { fill: "FFFEE2E2", text: "FF991B1B" },
  retirado: { fill: "FFF3F4F6", text: "FF4B5563" }, // Gray
  desaprobado: { fill: "FFFEE2E2", text: "FF991B1B" },
};

export const COMMON_BORDERS: {
  thin: Partial<ExcelJS.Borders>;
  doubleBottom: Partial<ExcelJS.Borders>;
} = {
  thin: {
    top: { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  },
  doubleBottom: {
    top: { style: "thin", color: { argb: "FF94A3B8" } },
    bottom: { style: "double", color: { argb: "FF0F172A" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  },
};
