import {
  buildProfessionalExcelReport,
  type ExcelColumnDef,
} from "./excel/excel-builder";
import { downloadExcelWorkbook } from "./excel/excel-download";

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) con diseño corporativo profesional
 * @param data Array de objetos con los datos a exportar
 * @param fileName Nombre del archivo (sin extensión)
 * @param sheetName Nombre de la hoja de cálculo
 */
export async function exportToExcel(
  data: any[],
  fileName: string,
  sheetName: string = "Datos",
  title?: string,
) {
  if (!data || data.length === 0) return;

  const sample = data[0];
  const columns: ExcelColumnDef[] = Object.keys(sample).map((key) => {
    const val = sample[key];
    const isNum = typeof val === "number";
    const isCurrency =
      typeof key === "string" &&
      (key.toLowerCase().includes("monto") ||
        key.toLowerCase().includes("total") ||
        key.toLowerCase().includes("pagado") ||
        key.toLowerCase().includes("saldo") ||
        key.toLowerCase().includes("precio"));

    const isDate =
      typeof key === "string" &&
      (key.toLowerCase().includes("fecha") ||
        key.toLowerCase().includes("vencimiento"));

    const isBadge =
      typeof key === "string" &&
      (key.toLowerCase().includes("estado") ||
        key.toLowerCase().includes("condicion"));

    return {
      key,
      header: key,
      type: isCurrency
        ? "currency"
        : isNum
          ? "number"
          : isDate
            ? "date"
            : isBadge
              ? "badge"
              : "text",
    };
  });

  const wb = buildProfessionalExcelReport({
    title: title || fileName.replace(/_/g, " "),
    sheetName,
    columns,
    data,
    paletteName: "navy",
  });

  await downloadExcelWorkbook(wb, fileName);
}

/**
 * Formatea los datos del cronograma para exportación Excel
 */
export function formatCronogramaForExcel(cronograma: any[]) {
  return cronograma.map((item) => ({
    Estudiante: `${item.estudiante.apellidoPaterno} ${item.estudiante.apellidoMaterno}, ${item.name}`,
    Concepto: item.concepto.nombre,
    Vencimiento: new Date(item.fechaVencimiento).toLocaleDateString(),
    "Monto Original": item.monto,
    "Mora Acumulada": item.moraAcumulada || 0,
    Total: Number(item.monto) + Number(item.moraAcumulada || 0),
    Pagado: item.montoPagado,
    Pendiente:
      Number(item.monto) +
      Number(item.moraAcumulada || 0) -
      Number(item.montoPagado),
    Estado: item.pagado
      ? "Pagado"
      : new Date(item.fechaVencimiento) < new Date()
        ? "Vencido"
        : "Pendiente",
  }));
}
