import ExcelJS from "exceljs";

export interface ParsedStudentRow {
  rowNumber: number;
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  genero?: string;
  fechaNacimiento?: string;
  codigoSiagie?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  nivel?: string;
  grado?: string;
  seccion?: string;
  dniApoderado?: string;
  apoderadoNombre?: string;
  telefonoApoderado?: string;
  parentesco?: string;
  status: "valid" | "warning" | "error";
  messages: string[];
}

export interface ParseResult {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: ParsedStudentRow[];
}

export async function parseStudentsExcelFile(
  file: File,
): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws) {
    throw new Error("El archivo no contiene hojas de cálculo.");
  }

  // Detectar la fila donde inician los encabezados (buscamos 'DNI')
  let headerRowNumber = 4;
  for (let r = 1; r <= 10; r++) {
    const row = ws.getRow(r);
    const cellVal = String(row.getCell(1).value || "").toLowerCase();
    if (cellVal.includes("dni")) {
      headerRowNumber = r;
      break;
    }
  }

  const startDataRow = headerRowNumber + 1;
  const parsedRows: ParsedStudentRow[] = [];
  const seenDnis = new Map<string, number>();

  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < startDataRow) return;

    const getVal = (col: number) => {
      const v = row.getCell(col).value;
      if (v === null || v === undefined) return "";
      if (typeof v === "object" && "text" in v) return String(v.text).trim();
      return String(v).trim();
    };

    const dni = getVal(1).replace(/\s+/g, "");
    const apellidoPaterno = getVal(2);
    const apellidoMaterno = getVal(3);
    const nombres = getVal(4);
    const genero = getVal(5).toUpperCase();
    const fechaNacimiento = getVal(6);
    const codigoSiagie = getVal(7);
    const telefono = getVal(8);
    const email = getVal(9);
    const direccion = getVal(10);
    const nivel = getVal(11);
    const grado = getVal(12);
    const seccion = getVal(13);
    const dniApoderado = getVal(14).replace(/\s+/g, "");
    const apoderadoNombre = getVal(15);
    const telefonoApoderado = getVal(16);
    const parentesco = getVal(17);

    // Ignorar filas totalmente vacías
    if (!dni && !apellidoPaterno && !nombres) return;

    const messages: string[] = [];
    let status: "valid" | "warning" | "error" = "valid";

    // Validaciones críticas (Errores)
    if (!dni) {
      status = "error";
      messages.push("DNI es obligatorio");
    } else if (dni.length < 8) {
      status = "error";
      messages.push(`DNI inválido (${dni.length} dígitos, mínimo 8)`);
    } else if (seenDnis.has(dni)) {
      status = "error";
      messages.push(`DNI duplicado (ya aparece en la fila ${seenDnis.get(dni)})`);
    } else {
      seenDnis.set(dni, rowNumber);
    }

    if (!apellidoPaterno) {
      status = "error";
      messages.push("Apellido paterno es obligatorio");
    }
    if (!apellidoMaterno) {
      status = "error";
      messages.push("Apellido materno es obligatorio");
    }
    if (!nombres) {
      status = "error";
      messages.push("Nombres es obligatorio");
    }

    // Validaciones secundarias (Advertencias)
    if (status !== "error") {
      if (!nivel || !grado) {
        status = "warning";
        messages.push("Sin grado/nivel (se registrará sin sección)");
      }
      if (dniApoderado && !apoderadoNombre) {
        status = "warning";
        messages.push("DNI apoderado sin nombre completo");
      }
      if (genero && !["M", "F", "MASCULINO", "FEMENINO"].includes(genero)) {
        status = "warning";
        messages.push("Género no reconocido (use M o F)");
      }
    }

    parsedRows.push({
      rowNumber,
      dni,
      apellidoPaterno,
      apellidoMaterno,
      nombres,
      genero,
      fechaNacimiento,
      codigoSiagie,
      telefono,
      email,
      direccion,
      nivel,
      grado,
      seccion,
      dniApoderado,
      apoderadoNombre,
      telefonoApoderado,
      parentesco,
      status,
      messages,
    });
  });

  const validCount = parsedRows.filter((r) => r.status === "valid").length;
  const warningCount = parsedRows.filter((r) => r.status === "warning").length;
  const errorCount = parsedRows.filter((r) => r.status === "error").length;

  return {
    totalRows: parsedRows.length,
    validCount,
    warningCount,
    errorCount,
    rows: parsedRows,
  };
}
