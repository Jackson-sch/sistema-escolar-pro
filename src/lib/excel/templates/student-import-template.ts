import ExcelJS from "exceljs";
import { COMMON_BORDERS } from "../excel-theme";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction } from "@/actions/institucion";

export async function downloadStudentImportTemplate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistema Escolar Pro";
  wb.created = new Date();

  const res = await getExcelHeaderInfoAction();
  const inst = res.data;
  const instName = inst?.nombreInstitucion || "Institución Educativa";
  const academicYear = inst?.academicYear || new Date().getFullYear();

  // ──────────────────────────────────────────────────────────
  // HOJA 1: PLANTILLA DE DATOS
  // ──────────────────────────────────────────────────────────
  const ws = wb.addWorksheet("Importar Estudiantes", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4, activeCell: "A5" }],
  });

  const totalCols = 17;

  // Fila 1: Banner Superior
  ws.addRow([]);
  ws.getRow(1).height = 28;
  for (let c = 1; c <= totalCols; c++) {
    ws.getCell(1, c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
  }
  const c1 = ws.getCell(1, 1);
  c1.value = `${instName.toUpperCase()} — PLANTILLA OFICIAL DE IMPORTACIÓN MASIVA DE ESTUDIANTES`;
  c1.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  c1.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(1, 1, 1, totalCols);

  // Fila 2: Subtítulo con Sede e Instrucciones
  ws.addRow([]);
  ws.getRow(2).height = 18;
  for (let c = 1; c <= totalCols; c++) {
    ws.getCell(2, c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" },
    };
  }
  const c2 = ws.getCell(2, 1);
  const sedeText = inst?.sedePrincipalNombre ? `Sede: ${inst.sedePrincipalNombre}  |  ` : "";
  c2.value = `${sedeText}Año Lectivo: ${academicYear}  |  Rellene los datos a partir de la fila 5. Los campos con (*) son obligatorios.`;
  c2.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FFE2E8F0" } };
  c2.alignment = { vertical: "middle", indent: 1 };
  ws.mergeCells(2, 1, 2, totalCols);

  // Fila 3: Espacio
  ws.addRow([]);
  ws.getRow(3).height = 6;

  // Fila 4: Cabeceras
  const r4 = ws.getRow(4);
  r4.height = 28;

  const columns = [
    { header: "DNI (*)", width: 14, group: "student", required: true },
    { header: "APELLIDO PATERNO (*)", width: 22, group: "student", required: true },
    { header: "APELLIDO MATERNO (*)", width: 22, group: "student", required: true },
    { header: "NOMBRES (*)", width: 24, group: "student", required: true },
    { header: "GÉNERO (M/F)", width: 14, group: "student", required: false },
    { header: "FECHA NACIMIENTO (DD/MM/AAAA)", width: 24, group: "student", required: false },
    { header: "CÓDIGO SIAGIE", width: 16, group: "student", required: false },
    { header: "TELÉFONO", width: 14, group: "student", required: false },
    { header: "EMAIL", width: 24, group: "student", required: false },
    { header: "DIRECCIÓN", width: 26, group: "student", required: false },
    { header: "NIVEL", width: 14, group: "academic", required: false },
    { header: "GRADO", width: 14, group: "academic", required: false },
    { header: "SECCIÓN", width: 12, group: "academic", required: false },
    { header: "DNI APODERADO", width: 16, group: "guardian", required: false },
    { header: "APODERADO NOMBRE COMPLETO", width: 28, group: "guardian", required: false },
    { header: "TELÉFONO APODERADO", width: 18, group: "guardian", required: false },
    { header: "PARENTESCO", width: 16, group: "guardian", required: false },
  ];

  columns.forEach((col, idx) => {
    const colIdx = idx + 1;
    const cell = ws.getCell(4, colIdx);
    cell.value = col.header;
    
    // Colores por grupo
    let bgColor = "FF1E293B"; // Slate 800 para alumno
    if (col.group === "academic") bgColor = "FF1E3A8A"; // Blue 900 para aula
    if (col.group === "guardian") bgColor = "FF064E3B"; // Emerald 900 para apoderado

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bgColor },
    };
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
    cell.border = COMMON_BORDERS.thin;
    ws.getColumn(colIdx).width = col.width;
  });

  // Habilitar AutoFilter
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: totalCols },
  };

  // Filas de Ejemplo
  const exampleRows = [
    [
      "74839201",
      "GÓMEZ",
      "RODRÍGUEZ",
      "MATEO ALEXANDER",
      "M",
      "15/04/2012",
      "SIAG-00192",
      "987654321",
      "mateo.gomez@gmail.com",
      "Av. Las Palmeras 450",
      "PRIMARIA",
      "6to",
      "A",
      "41238974",
      "GÓMEZ PÉREZ CARLOS",
      "998877665",
      "PADRE",
    ],
    [
      "78945612",
      "VARGAS",
      "SALAZAR",
      "VALERIA SOFÍA",
      "F",
      "22/08/2015",
      "SIAG-00193",
      "912345678",
      "valeria.vargas@gmail.com",
      "Jr. Los Álamos 120",
      "PRIMARIA",
      "3ro",
      "B",
      "43981204",
      "SALAZAR MORA ELENA",
      "911223344",
      "MADRE",
    ],
    [
      "76543210",
      "QUISPE",
      "MENDOZA",
      "JOAQUÍN DANIEL",
      "M",
      "10/11/2009",
      "SIAG-00194",
      "955443322",
      "joaquin.quispe@gmail.com",
      "Calle El Sol 340",
      "SECUNDARIA",
      "4to",
      "A",
      "10293847",
      "QUISPE HUAMÁN RAÚL",
      "944556677",
      "APODERADO",
    ],
  ];

  exampleRows.forEach((row, rIdx) => {
    const rowNum = 5 + rIdx;
    const r = ws.getRow(rowNum);
    r.height = 20;

    row.forEach((val, cIdx) => {
      const cell = ws.getCell(rowNum, cIdx + 1);
      cell.value = val;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rIdx % 2 === 1 ? "FFF8FAFC" : "FFFFFFFF" },
      };
      cell.border = COMMON_BORDERS.thin;
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: cIdx === 0 || cIdx === 4 || cIdx === 5 || cIdx === 12 || cIdx === 13 ? "center" : "left",
      };
    });
  });

  // ──────────────────────────────────────────────────────────
  // HOJA 2: GUÍA E INSTRUCCIONES
  // ──────────────────────────────────────────────────────────
  const wsGuia = wb.addWorksheet("Instrucciones de Llenado", {
    views: [{ showGridLines: true }],
  });

  wsGuia.getColumn(1).width = 24;
  wsGuia.getColumn(2).width = 16;
  wsGuia.getColumn(3).width = 50;

  const headerGuia = wsGuia.getRow(1);
  headerGuia.height = 26;
  ["CAMPO", "OBLIGATORIO", "DESCRIPCIÓN Y FORMATO RECOMENDADO"].forEach((h, idx) => {
    const cell = wsGuia.getCell(1, idx + 1);
    cell.value = h;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    cell.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = COMMON_BORDERS.thin;
  });

  const guiaRows = [
    ["DNI", "SÍ (*)", "8 dígitos numéricos sin espacios ni guiones (e.g. 74839201)."],
    ["APELLIDO PATERNO", "SÍ (*)", "Primer apellido del estudiante."],
    ["APELLIDO MATERNO", "SÍ (*)", "Segundo apellido del estudiante."],
    ["NOMBRES", "SÍ (*)", "Nombres completos del estudiante."],
    ["GÉNERO", "Opcional", "Indicar 'M' para Masculino o 'F' para Femenino."],
    ["FECHA NACIMIENTO", "Opcional", "Formato DD/MM/AAAA o AAAA-MM-DD (e.g. 15/04/2012)."],
    ["CÓDIGO SIAGIE", "Opcional", "Código del estudiante en SIAGIE MINEDU."],
    ["TELÉFONO", "Opcional", "Número de contacto celular (9 dígitos)."],
    ["EMAIL", "Opcional", "Correo electrónico válido para notificaciones."],
    ["DIRECCIÓN", "Opcional", "Domicilio de residencia del estudiante."],
    ["NIVEL", "Opcional", "INICIAL, PRIMARIA o SECUNDARIA."],
    ["GRADO", "Opcional", "Nombre del grado (e.g. 1ro, 2do, 3 años, etc.)."],
    ["SECCIÓN", "Opcional", "Letra de sección (e.g. A, B, C, Única)."],
    ["DNI APODERADO", "Opcional", "DNI del padre, madre o apoderado responsable."],
    ["APODERADO NOMBRE", "Opcional", "Nombres y apellidos completos del apoderado."],
    ["TEL. APODERADO", "Opcional", "Número telefónico del apoderado para avisos de WhatsApp."],
    ["PARENTESCO", "Opcional", "PADRE, MADRE, APODERADO o TUTOR."],
  ];

  guiaRows.forEach((r, idx) => {
    const rowNum = 2 + idx;
    const row = wsGuia.getRow(rowNum);
    row.height = 20;

    r.forEach((val, cIdx) => {
      const cell = wsGuia.getCell(rowNum, cIdx + 1);
      cell.value = val;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: idx % 2 === 1 ? "FFF8FAFC" : "FFFFFFFF" },
      };
      cell.border = COMMON_BORDERS.thin;
      cell.font = {
        name: "Calibri",
        size: 10,
        bold: cIdx === 0,
        color: { argb: cIdx === 1 && val.includes("SÍ") ? "FF166534" : "FF334155" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: cIdx === 1 ? "center" : "left",
      };
    });
  });

  const fileName = `Plantilla_Importar_Estudiantes_${academicYear}.xlsx`;
  await downloadExcelWorkbook(wb, fileName);
}
