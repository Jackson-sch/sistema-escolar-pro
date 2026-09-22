import ExcelJS from "exceljs";
import { COMMON_BORDERS } from "../excel-theme";
import { generateExcelBase64 } from "../excel-download";
import type {
  SiagieAttendanceSectionData,
  SiagieExportResult,
} from "@/components/evaluaciones/siagie/siagie-types";

export function renderSiagieAttendanceSheet(
  ws: ExcelJS.Worksheet,
  data: SiagieAttendanceSectionData,
) {
  const {
    institucionName,
    codigoModular,
    sedeNombre,
    nivelNombre,
    gradoNombre,
    seccionNombre,
    periodoNombre,
    anioEscolar,
    estudiantes,
  } = data;

  const totalCols = 13;

  // Fila 1: Encabezado Oficial SIAGIE MINEDU
  const headerFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF0F172A" },
  };

  const r1 = ws.getRow(1);
  r1.height = 28;
  for (let c = 1; c <= totalCols; c++) {
    ws.getCell(1, c).fill = headerFill;
  }
  const c1 = ws.getCell(1, 1);
  c1.value = `SIAGIE MINEDU — REPORTE OFICIAL DE ASISTENCIA Y PUNTUALIDAD — ${institucionName.toUpperCase()}`;
  c1.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  c1.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(1, 1, 1, totalCols);

  // Fila 2: Metadatos
  const metaFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF1E293B" },
  };
  const r2 = ws.getRow(2);
  r2.height = 20;
  for (let c = 1; c <= totalCols; c++) {
    ws.getCell(2, c).fill = metaFill;
  }
  const c2 = ws.getCell(2, 1);
  const sedeStr = sedeNombre ? `Sede: ${sedeNombre}  |  ` : "";
  c2.value = `${sedeStr}Cód. Modular: ${codigoModular}  |  Nivel: ${nivelNombre}  |  Grado: ${gradoNombre} "${seccionNombre}"  |  Periodo: ${periodoNombre}  |  Año: ${anioEscolar}`;
  c2.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FFE2E8F0" } };
  c2.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(2, 1, 2, totalCols);

  // Fila 3: Spacer
  ws.getRow(3).height = 8;

  // Fila 4: Cabeceras
  const r4 = ws.getRow(4);
  r4.height = 26;

  const headers = [
    { text: "N°", width: 6, bg: "FF1E3A8A" },
    { text: "CÓDIGO ESTUDIANTE", width: 18, bg: "FF1E3A8A" },
    { text: "TIPO DOC.", width: 12, bg: "FF1E3A8A" },
    { text: "N° DOCUMENTO", width: 15, bg: "FF1E3A8A" },
    { text: "APELLIDO PATERNO", width: 20, bg: "FF1E3A8A" },
    { text: "APELLIDO MATERNO", width: 20, bg: "FF1E3A8A" },
    { text: "NOMBRES", width: 24, bg: "FF1E3A8A" },
    { text: "ASISTENCIAS (P)", width: 16, bg: "FF065F46" },
    { text: "TARDANZAS (T)", width: 15, bg: "FF92400E" },
    { text: "FALTAS JUST. (FJ)", width: 18, bg: "FF1E40AF" },
    { text: "FALTAS INJUST. (FI)", width: 19, bg: "FF991B1B" },
    { text: "TOTAL DÍAS", width: 14, bg: "FF334155" },
    { text: "% ASISTENCIA", width: 15, bg: "FF0F766E" },
  ];

  headers.forEach((h, idx) => {
    const cell = ws.getCell(4, idx + 1);
    cell.value = h.text;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: h.bg } };
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = COMMON_BORDERS.thin;
    ws.getColumn(idx + 1).width = h.width;
  });

  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: totalCols },
  };

  // Filas de Estudiantes
  let curRow = 5;
  estudiantes.forEach((e, idx) => {
    const row = ws.getRow(curRow);
    row.height = 20;
    const isEven = idx % 2 === 1;
    const rowBg = isEven ? "FFF8FAFC" : "FFFFFFFF";

    const values = [
      e.index,
      e.codigoEstudiante || "-",
      e.tipoDocumento || "DNI",
      e.dni || "-",
      e.apellidoPaterno,
      e.apellidoMaterno,
      e.nombres,
      e.asistencias,
      e.tardanzas,
      e.faltasJustificadas,
      e.faltasInjustificadas,
      e.totalDias,
      `${e.porcentajeAsistencia.toFixed(1)}%`,
    ];

    values.forEach((val, cIdx) => {
      const cell = ws.getCell(curRow, cIdx + 1);
      cell.value = val;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cell.border = COMMON_BORDERS.thin;
      cell.font = {
        name: "Calibri",
        size: 10,
        bold: cIdx >= 7,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: cIdx < 4 || cIdx >= 7 ? "center" : "left",
      };
    });

    curRow++;
  });

  ws.views = [
    {
      state: "frozen",
      xSplit: 4,
      ySplit: 4,
      activeCell: "E5",
      showGridLines: true,
    },
  ];
}

export async function generateSiagieAttendanceExcel(
  data: SiagieAttendanceSectionData,
): Promise<SiagieExportResult> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SIAGIE - MINEDU / Sistema Escolar Pro";
  wb.lastModifiedBy = "Sistema Escolar Pro";

  const sheetName = `ASIST_${data.gradoNombre.substring(0, 3)}_${data.seccionNombre}`.substring(0, 31);
  const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: true }] });

  renderSiagieAttendanceSheet(ws, data);

  const base64 = await generateExcelBase64(wb);
  const cleanModular = (data.codigoModular || "IE").replace(/\s+/g, "_");
  const cleanGrado = data.gradoNombre.replace(/\s+/g, "_");
  const cleanSeccion = data.seccionNombre.replace(/\s+/g, "_");
  const cleanPeriodo = data.periodoNombre.replace(/\s+/g, "_");
  const fileName = `SIAGIE_ASISTENCIA_${cleanModular}_${cleanGrado}_${cleanSeccion}_${cleanPeriodo}.xlsx`;

  return { success: true, fileName, base64 };
}

export async function generateSiagieBulkAttendanceExcel(
  sections: SiagieAttendanceSectionData[],
  meta?: { periodoNombre?: string },
): Promise<SiagieExportResult> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SIAGIE - MINEDU / Sistema Escolar Pro";
  wb.lastModifiedBy = "Sistema Escolar Pro";

  const usedSheetNames = new Set<string>();

  sections.forEach((sec, idx) => {
    let name = `${sec.gradoNombre.substring(0, 2)}_${sec.seccionNombre}_${sec.nivelNombre.substring(0, 3)}`.toUpperCase();
    if (usedSheetNames.has(name) || name.length > 28) {
      name = `S${idx + 1}_${name}`.substring(0, 30);
    }
    usedSheetNames.add(name);

    const ws = wb.addWorksheet(name, { views: [{ showGridLines: true }] });
    renderSiagieAttendanceSheet(ws, sec);
  });

  const base64 = await generateExcelBase64(wb);
  const cleanPeriodo = (meta?.periodoNombre || "Periodo").replace(/\s+/g, "_");
  const fileName = `SIAGIE_ASISTENCIA_CONSOLIDADO_TOTAL_${cleanPeriodo}.xlsx`;

  return { success: true, fileName, base64, totalSecciones: sections.length };
}
