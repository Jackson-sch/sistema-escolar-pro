import ExcelJS from "exceljs";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction } from "@/actions/institucion";

export async function downloadConciliacionTemplate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistema Escolar Pro";
  wb.created = new Date();

  const res = await getExcelHeaderInfoAction();
  const inst = res.data;
  const instName = inst?.nombreInstitucion || "Institución Educativa";
  const academicYear = inst?.academicYear || new Date().getFullYear();

  const ws = wb.addWorksheet("Conciliación Bancaria", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4, activeCell: "A5" }],
  });

  const totalCols = 6;

  // Fila 1: Banner Superior
  ws.addRow([]);
  ws.getRow(1).height = 30;
  for (let c = 1; c <= totalCols; c++) {
    ws.getCell(1, c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0C4A6E" }, // Sky 900
    };
  }
  const c1 = ws.getCell(1, 1);
  c1.value = `${instName.toUpperCase()} — PLANTILLA OFICIAL DE CONCILIACIÓN BANCARIA`;
  c1.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  c1.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(1, 1, 1, totalCols);

  // Fila 2: Subtítulo con Instrucciones
  ws.addRow([]);
  ws.getRow(2).height = 20;
  for (let c = 1; c <= totalCols; c++) {
    ws.getCell(2, c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF075985" }, // Sky 800
    };
  }
  const c2 = ws.getCell(2, 1);
  c2.value = `Periodo Lectivo: ${academicYear}  |  Rellene los pagos bancarios a partir de la fila 5. Los campos con (*) son obligatorios.`;
  c2.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FFE0F2FE" } };
  c2.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(2, 1, 2, totalCols);

  // Fila 3: Espaciador
  ws.addRow([]);
  ws.getRow(3).height = 8;

  // Fila 4: Cabeceras
  const r4 = ws.getRow(4);
  r4.height = 28;

  const columns = [
    { header: "DNI / CÓDIGO (*)", width: 18, bg: "FF0284C7", align: "center" as const },
    { header: "MONTO (S/) (*)", width: 16, bg: "FF059669", align: "right" as const },
    { header: "N° OPERACIÓN (*)", width: 22, bg: "FF0284C7", align: "center" as const },
    { header: "BANCO / CANAL", width: 20, bg: "FF334155", align: "left" as const },
    { header: "FECHA PAGO", width: 16, bg: "FF334155", align: "center" as const },
    { header: "OBSERVACIONES", width: 32, bg: "FF334155", align: "left" as const },
  ];

  columns.forEach((col, idx) => {
    const colIdx = idx + 1;
    const cell = ws.getCell(4, colIdx);
    cell.value = col.header;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: col.bg },
    };
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: col.align };
    cell.border = {
      top: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "medium", color: { argb: "FFFFFFFF" } },
      left: { style: "thin", color: { argb: "FF94A3B8" } },
      right: { style: "thin", color: { argb: "FF94A3B8" } },
    };
    ws.getColumn(colIdx).width = col.width;
  });

  // Filas 5 a 7: Ejemplos ilustrativos
  const sampleRows = [
    {
      dni: "74859632",
      monto: 350.0,
      op: "OP-84920193",
      banco: "BCP Agente",
      fecha: "20/09/2026",
      obs: "Pensión de Septiembre",
    },
    {
      dni: "61204938",
      monto: 350.0,
      op: "BBVA-994821",
      banco: "BBVA Web",
      fecha: "20/09/2026",
      obs: "Pensión de Septiembre",
    },
    {
      dni: "45812903",
      monto: 300.0,
      op: "INT-1029384",
      banco: "Interbank",
      fecha: "20/09/2026",
      obs: "Pensión de Septiembre",
    },
  ];

  sampleRows.forEach((item, idx) => {
    const rowIdx = 5 + idx;
    const r = ws.getRow(rowIdx);
    r.height = 22;

    const cells = [
      { val: item.dni, numFmt: "@", align: "center" as const },
      { val: item.monto, numFmt: '"S/ "#,##0.00', align: "right" as const },
      { val: item.op, numFmt: "@", align: "center" as const },
      { val: item.banco, numFmt: "@", align: "left" as const },
      { val: item.fecha, numFmt: "@", align: "center" as const },
      { val: item.obs, numFmt: "@", align: "left" as const },
    ];

    cells.forEach((c, cIdx) => {
      const cell = r.getCell(cIdx + 1);
      cell.value = c.val;
      cell.numFmt = c.numFmt;
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      cell.alignment = { vertical: "middle", horizontal: c.align };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: idx % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  // Validación de lista desplegable para la columna BANCO / CANAL (D) para 100 filas
  for (let r = 5; r <= 100; r++) {
    ws.getCell(`D${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"BCP,BBVA,Interbank,Scotiabank,Banco de la Nación,Yape,Plin,Caja Piura,Caja Trujillo,Otro"'],
      showErrorMessage: true,
      errorTitle: "Canal inválido",
      error: "Seleccione un banco o canal de la lista desplegable.",
    };
    ws.getCell(`B${r}`).numFmt = '"S/ "#,##0.00';
    ws.getCell(`A${r}`).numFmt = "@";
    ws.getCell(`C${r}`).numFmt = "@";
  }

  await downloadExcelWorkbook(wb, "Plantilla_Conciliacion_Bancaria.xlsx");
}
