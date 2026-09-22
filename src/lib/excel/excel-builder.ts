import ExcelJS from "exceljs";
import {
  EXCEL_PALETTES,
  STATUS_BADGE_STYLES,
  COMMON_BORDERS,
} from "./excel-theme";
import { InstitutionHeaderInfo } from "@/actions/institucion/institucion-queries";

export type ColumnType =
  | "text"
  | "number"
  | "currency"
  | "percent"
  | "date"
  | "badge"
  | "center";

export interface ExcelColumnDef {
  key: string;
  header: string;
  type?: ColumnType;
  width?: number;
  format?: string;
  align?: "left" | "center" | "right";
}

export interface KpiCard {
  label: string;
  value: string | number;
  subtext?: string;
}

export interface ExcelReportOptions {
  title: string;
  subtitle?: string;
  institutionName?: string;
  institutionInfo?: InstitutionHeaderInfo;
  academicYear?: number | string;
  sheetName?: string;
  paletteName?: "navy" | "emerald" | "indigo" | "violet";
  kpiCards?: KpiCard[];
  columns: ExcelColumnDef[];
  data: any[];
  summaryRow?: {
    labelColKey: string;
    label: string;
    calculations?: Record<string, "sum" | "avg" | "count" | number | string>;
  };
}

export function buildProfessionalExcelReport(
  options: ExcelReportOptions,
): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistema Escolar Pro";
  wb.lastModifiedBy = "Sistema Escolar Pro";
  wb.created = new Date();
  wb.modified = new Date();

  const palette = EXCEL_PALETTES[options.paletteName || "navy"];
  const sheetName = (options.sheetName || "Reporte").substring(0, 31);
  const ws = wb.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  const totalCols = Math.max(options.columns.length, 6);
  const inst = options.institutionInfo;

  // ── 1. Fila de Espacio Superior ──
  ws.addRow([]);
  ws.getRow(1).height = 10;

  // ── 2. Banner Institucional Principal ──
  let currentRowNum = 2;
  const titleRow = ws.getRow(currentRowNum);
  titleRow.height = 30;

  for (let c = 1; c <= totalCols; c++) {
    const cell = ws.getCell(currentRowNum, c);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.primary },
    };
  }

  const instName =
    inst?.nombreInstitucion || options.institutionName || "Institución Educativa";
  const titleCell = ws.getCell(currentRowNum, 1);
  titleCell.value = `${instName.toUpperCase()} — ${options.title}`;
  titleCell.font = {
    name: "Calibri",
    size: 13,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(currentRowNum, 1, currentRowNum, totalCols);

  // ── 3. Fila de Datos de Sede Principal e Institución ──
  currentRowNum++;
  const sedeRow = ws.getRow(currentRowNum);
  sedeRow.height = 20;

  for (let c = 1; c <= totalCols; c++) {
    const cell = ws.getCell(currentRowNum, c);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.secondary },
    };
  }

  const sedeParts: string[] = [];
  if (inst?.sedePrincipalNombre) {
    sedeParts.push(`Sede Principal: ${inst.sedePrincipalNombre}`);
  }
  if (inst?.sedePrincipalDireccion) {
    sedeParts.push(`Dirección: ${inst.sedePrincipalDireccion}`);
  }
  if (inst?.codigoModular) {
    sedeParts.push(`Cód. Modular: ${inst.codigoModular}`);
  }
  if (inst?.ugel) {
    sedeParts.push(`UGEL: ${inst.ugel}`);
  }
  if (inst?.distrito) {
    sedeParts.push(
      `Ubicación: ${[inst.distrito, inst.departamento].filter(Boolean).join(", ")}`,
    );
  }
  if (inst?.sedeActivaNombre && inst.sedeActivaNombre !== "Todas las Sedes") {
    sedeParts.push(`[Filtro Sede: ${inst.sedeActivaNombre}]`);
  }

  const sedeCell = ws.getCell(currentRowNum, 1);
  sedeCell.value =
    sedeParts.length > 0
      ? sedeParts.join("  |  ")
      : `Sede Principal: Central  |  Cód. Modular: 1234567  |  UGEL: 02`;
  sedeCell.font = {
    name: "Calibri",
    size: 9.5,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  sedeCell.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(currentRowNum, 1, currentRowNum, totalCols);

  // ── 4. Subtítulo y Metadatos de Emisión ──
  currentRowNum++;
  const subRow = ws.getRow(currentRowNum);
  subRow.height = 20;

  for (let c = 1; c <= totalCols; c++) {
    const cell = ws.getCell(currentRowNum, c);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.secondary },
    };
  }

  const year = inst?.academicYear || options.academicYear || new Date().getFullYear();
  const metaParts: string[] = [];
  if (options.subtitle) metaParts.push(options.subtitle);
  metaParts.push(`Ciclo: ${year}`);
  metaParts.push(`Emitido: ${new Date().toLocaleString("es-PE")}`);
  metaParts.push(`Registros: ${options.data.length}`);

  const subCell = ws.getCell(currentRowNum, 1);
  subCell.value = metaParts.join("  |  ");
  subCell.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: "FFE2E8F0" },
  };
  subCell.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(currentRowNum, 1, currentRowNum, totalCols);

  // ── 5. Tarjetas KPI (si existen) ──
  if (options.kpiCards && options.kpiCards.length > 0) {
    currentRowNum++;
    ws.addRow([]);
    ws.getRow(currentRowNum).height = 8; // Spacer

    currentRowNum++;
    const kpiRow = ws.getRow(currentRowNum);
    kpiRow.height = 36;

    const cards = options.kpiCards.slice(0, 4);
    const colsPerCard = Math.max(1, Math.floor(totalCols / cards.length));

    cards.forEach((card, idx) => {
      const startCol = idx * colsPerCard + 1;
      const endCol =
        idx === cards.length - 1 ? totalCols : startCol + colsPerCard - 1;

      for (let c = startCol; c <= endCol; c++) {
        const cell = ws.getCell(currentRowNum, c);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: palette.kpiBg },
        };
        cell.border = COMMON_BORDERS.thin;
      }

      const kpiCell = ws.getCell(currentRowNum, startCol);
      kpiCell.value = `${card.label.toUpperCase()}\n${card.value}`;
      kpiCell.font = {
        name: "Calibri",
        size: 11,
        bold: true,
        color: { argb: palette.kpiText },
      };
      kpiCell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      if (endCol > startCol) {
        ws.mergeCells(currentRowNum, startCol, currentRowNum, endCol);
      }
    });
  }

  // ── 6. Espacio previo a la tabla ──
  currentRowNum++;
  ws.addRow([]);
  ws.getRow(currentRowNum).height = 10;

  // ── 7. Cabecera de Columnas de la Tabla ──
  currentRowNum++;
  const tableHeaderRowNum = currentRowNum;
  const headerRow = ws.getRow(tableHeaderRowNum);
  headerRow.height = 26;

  options.columns.forEach((col, idx) => {
    const colIdx = idx + 1;
    const cell = ws.getCell(tableHeaderRowNum, colIdx);
    cell.value = col.header.toUpperCase();
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: palette.headerText },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.headerFill },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal:
        col.align ||
        (col.type === "number" || col.type === "currency"
          ? "right"
          : col.type === "badge" ||
              col.type === "center" ||
              col.type === "date"
            ? "center"
            : "left"),
      wrapText: false,
    };
    cell.border = COMMON_BORDERS.thin;
  });

  // Habilitar AutoFilter en la cabecera
  ws.autoFilter = {
    from: { row: tableHeaderRowNum, column: 1 },
    to: { row: tableHeaderRowNum, column: options.columns.length },
  };

  // ── 8. Filas de Datos (con Zebra Striping y Formatos) ──
  const startDataRow = currentRowNum + 1;

  options.data.forEach((item, rowIdx) => {
    currentRowNum++;
    const row = ws.getRow(currentRowNum);
    row.height = 21;
    const isEven = rowIdx % 2 === 1;

    options.columns.forEach((col, colIdx) => {
      const cell = ws.getCell(currentRowNum, colIdx + 1);
      const rawVal = item[col.key];

      cell.border = COMMON_BORDERS.thin;

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? palette.zebraFill : "FFFFFFFF" },
      };

      switch (col.type) {
        case "currency":
          cell.value =
            typeof rawVal === "number" ? rawVal : Number(rawVal) || 0;
          cell.numFmt = '"S/ "#,##0.00;[Red]-"S/ "#,##0.00;"S/ "0.00';
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.font = { name: "Calibri", size: 10 };
          break;

        case "number":
          cell.value =
            typeof rawVal === "number" ? rawVal : Number(rawVal) || 0;
          cell.numFmt = col.format || "#,##0";
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.font = { name: "Calibri", size: 10 };
          break;

        case "percent":
          cell.value =
            typeof rawVal === "number"
              ? rawVal / 100
              : Number(rawVal) / 100 || 0;
          cell.numFmt = "0.0%";
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.font = { name: "Calibri", size: 10 };
          break;

        case "date":
          if (rawVal) {
            cell.value =
              rawVal instanceof Date ? rawVal : new Date(rawVal);
            cell.numFmt = col.format || "DD/MM/YYYY";
          } else {
            cell.value = "-";
          }
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.font = { name: "Calibri", size: 10 };
          break;

        case "badge": {
          const strVal = String(rawVal ?? "").trim();
          const normalized = strVal.toLowerCase();
          const badgeStyle = STATUS_BADGE_STYLES[normalized];

          cell.value = strVal || "-";
          cell.alignment = { vertical: "middle", horizontal: "center" };

          if (badgeStyle) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: badgeStyle.fill },
            };
            cell.font = {
              name: "Calibri",
              size: 9.5,
              bold: true,
              color: { argb: badgeStyle.text },
            };
          } else {
            cell.font = { name: "Calibri", size: 10 };
          }
          break;
        }

        case "center":
          cell.value = rawVal ?? "-";
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.font = { name: "Calibri", size: 10 };
          break;

        default:
          cell.value = rawVal ?? "";
          cell.alignment = {
            vertical: "middle",
            horizontal: col.align || "left",
          };
          cell.font = { name: "Calibri", size: 10 };
          break;
      }
    });
  });

  const endDataRow = currentRowNum;

  // ── 9. Fila de Resumen / Totales (Opcional) ──
  if (options.summaryRow && options.data.length > 0) {
    currentRowNum++;
    const sumRow = ws.getRow(currentRowNum);
    sumRow.height = 24;

    options.columns.forEach((col, colIdx) => {
      const cell = ws.getCell(currentRowNum, colIdx + 1);
      cell.border = COMMON_BORDERS.doubleBottom;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: palette.kpiBg },
      };

      if (col.key === options.summaryRow?.labelColKey) {
        cell.value = options.summaryRow.label.toUpperCase();
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: palette.primary },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      } else if (options.summaryRow?.calculations?.[col.key]) {
        const calc = options.summaryRow.calculations[col.key];
        const colLetter = ws.getColumn(colIdx + 1).letter;

        if (calc === "sum") {
          cell.value = {
            formula: `SUM(${colLetter}${startDataRow}:${colLetter}${endDataRow})`,
          };
          cell.numFmt = col.type === "currency" ? '"S/ "#,##0.00' : "#,##0";
        } else if (calc === "avg") {
          cell.value = {
            formula: `AVERAGE(${colLetter}${startDataRow}:${colLetter}${endDataRow})`,
          };
          cell.numFmt =
            col.type === "currency" ? '"S/ "#,##0.00' : "0.0";
        } else if (calc === "count") {
          cell.value = {
            formula: `COUNTA(${colLetter}${startDataRow}:${colLetter}${endDataRow})`,
          };
          cell.numFmt = "#,##0";
        } else {
          cell.value = calc;
        }

        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: palette.primary },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: col.align || "right",
        };
      }
    });
  }

  // ── 10. Cálculo Inteligente de Anchos de Columna ──
  options.columns.forEach((col, idx) => {
    const colIdx = idx + 1;
    let maxLen = col.header.length;

    options.data.forEach((row) => {
      const val = row[col.key];
      if (val !== undefined && val !== null) {
        const str = String(val);
        if (str.length > maxLen) maxLen = str.length;
      }
    });

    const targetWidth = col.width || Math.min(Math.max(maxLen + 4, 10), 45);
    ws.getColumn(colIdx).width = targetWidth;
  });

  // ── 11. Vista y Congelación de Paneles ──
  ws.views = [
    {
      state: "frozen",
      ySplit: tableHeaderRowNum,
      activeCell: `A${tableHeaderRowNum + 1}`,
      showGridLines: true,
    },
  ];

  return wb;
}
