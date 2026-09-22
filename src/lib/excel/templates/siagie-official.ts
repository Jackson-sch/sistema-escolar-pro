import ExcelJS from "exceljs";
import { COMMON_BORDERS } from "../excel-theme";
import { generateExcelBase64 } from "../excel-download";
import type {
  SiagieSectionData,
  SiagieExportResult,
} from "@/components/evaluaciones/siagie/siagie-types";

export function renderSiagieGradesSheet(
  ws: ExcelJS.Worksheet,
  data: SiagieSectionData,
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
    cursos,
    estudiantes,
  } = data;

  const totalCols = 7 + cursos.length * 2;

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
  c1.value = `SISTEMA DE INFORMACIÓN DE APOYO A LA GESTIÓN DE LA INSTITUCIÓN EDUCATIVA (SIAGIE) — ${institucionName.toUpperCase()}`;
  c1.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  c1.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(1, 1, 1, totalCols);

  // Fila 2: Metadatos con Sede Principal
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

  // Fila 4: Cabeceras fijas + Cursos
  const r4 = ws.getRow(4);
  r4.height = 26;

  const baseHeaders = [
    { text: "N°", width: 6 },
    { text: "CÓDIGO ESTUDIANTE", width: 18 },
    { text: "TIPO DOC.", width: 12 },
    { text: "N° DOCUMENTO", width: 15 },
    { text: "APELLIDO PATERNO", width: 20 },
    { text: "APELLIDO MATERNO", width: 20 },
    { text: "NOMBRES", width: 24 },
  ];

  baseHeaders.forEach((h, idx) => {
    const cell = ws.getCell(4, idx + 1);
    cell.value = h.text;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = COMMON_BORDERS.thin;
    ws.getColumn(idx + 1).width = h.width;
  });

  let curCol = 8;
  cursos.forEach((curso) => {
    // Columna de Nota
    const cellNota = ws.getCell(4, curCol);
    cellNota.value = `${curso.nombre.toUpperCase()} (CALIF.)`;
    cellNota.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    cellNota.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cellNota.alignment = { vertical: "middle", horizontal: "center" };
    cellNota.border = COMMON_BORDERS.thin;
    ws.getColumn(curCol).width = 18;

    // Columna de Conclusión Descriptiva
    const cellConc = ws.getCell(4, curCol + 1);
    cellConc.value = `CONCLUSIÓN DESCRIPTIVA (${curso.nombre.toUpperCase()})`;
    cellConc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
    cellConc.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cellConc.alignment = { vertical: "middle", horizontal: "center" };
    cellConc.border = COMMON_BORDERS.thin;
    ws.getColumn(curCol + 1).width = 35;

    curCol += 2;
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

    const baseValues = [
      e.index,
      e.codigoEstudiante,
      e.tipoDocumento,
      e.dni,
      e.apellidoPaterno,
      e.apellidoMaterno,
      e.nombres,
    ];

    baseValues.forEach((val, cIdx) => {
      const cell = ws.getCell(curRow, cIdx + 1);
      cell.value = val;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cell.border = COMMON_BORDERS.thin;
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: cIdx < 4 ? "center" : "left",
      };
    });

    let gradeCol = 8;
    cursos.forEach((curso) => {
      const gradeObj = e.grades[curso.id] || { nota: "-", conclusion: "" };

      // Nota
      const cellNota = ws.getCell(curRow, gradeCol);
      cellNota.value = gradeObj.nota;
      cellNota.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cellNota.border = COMMON_BORDERS.thin;
      cellNota.font = { name: "Calibri", size: 10, bold: true };
      cellNota.alignment = { vertical: "middle", horizontal: "center" };

      // Conclusión
      const cellConc = ws.getCell(curRow, gradeCol + 1);
      cellConc.value = gradeObj.conclusion || "";
      cellConc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cellConc.border = COMMON_BORDERS.thin;
      cellConc.font = { name: "Calibri", size: 9.5 };
      cellConc.alignment = { vertical: "middle", horizontal: "left" };

      gradeCol += 2;
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

export async function generateSiagieOfficialExcel(
  data: SiagieSectionData,
): Promise<SiagieExportResult> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SIAGIE - MINEDU / Sistema Escolar Pro";
  wb.lastModifiedBy = "Sistema Escolar Pro";

  const sheetName = `SIAGIE_${data.gradoNombre.substring(0, 3)}_${data.seccionNombre}`.substring(0, 31);
  const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: true }] });

  renderSiagieGradesSheet(ws, data);

  const base64 = await generateExcelBase64(wb);
  const cleanModular = (data.codigoModular || "IE").replace(/\s+/g, "_");
  const cleanGrado = data.gradoNombre.replace(/\s+/g, "_");
  const cleanSeccion = data.seccionNombre.replace(/\s+/g, "_");
  const cleanPeriodo = data.periodoNombre.replace(/\s+/g, "_");
  const fileName = `SIAGIE_${cleanModular}_${cleanGrado}_${cleanSeccion}_${cleanPeriodo}.xlsx`;

  return { success: true, fileName, base64 };
}

export async function generateSiagieBulkExcel(
  sections: SiagieSectionData[],
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
    renderSiagieGradesSheet(ws, sec);
  });

  const base64 = await generateExcelBase64(wb);
  const cleanPeriodo = (meta?.periodoNombre || "Periodo").replace(/\s+/g, "_");
  const fileName = `SIAGIE_CALIFICACIONES_CONSOLIDADO_TOTAL_${cleanPeriodo}.xlsx`;

  return { success: true, fileName, base64, totalSecciones: sections.length };
}
