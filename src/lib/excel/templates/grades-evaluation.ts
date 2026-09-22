import { buildProfessionalExcelReport, ExcelColumnDef } from "../excel-builder";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction, InstitutionHeaderInfo } from "@/actions/institucion";

interface StudentGradeExportData {
  codigoEstudiante: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  nota: number | string;
  comentario?: string;
}

const GRADES_COLUMNS: ExcelColumnDef[] = [
  { key: "index", header: "N°", type: "number", width: 6, align: "center" },
  { key: "codigo", header: "Código", type: "center", width: 14 },
  { key: "estudiante", header: "Apellidos y Nombres", type: "text", width: 32 },
  { key: "nota", header: "Calificación", type: "number", width: 15, align: "center" },
  { key: "condicion", header: "Logro / Condición", type: "badge", width: 16 },
  { key: "observaciones", header: "Observaciones / Retroalimentación", type: "text", width: 35 },
];

export async function exportGradesEvaluationExcel({
  evaluacionNombre,
  cursoNombre,
  estudiantes,
  customHeaderInfo,
}: {
  evaluacionNombre: string;
  cursoNombre: string;
  estudiantes: StudentGradeExportData[];
  customHeaderInfo?: InstitutionHeaderInfo;
}) {
  let headerInfo = customHeaderInfo;
  if (!headerInfo) {
    const res = await getExcelHeaderInfoAction();
    if (res.data) headerInfo = res.data;
  }

  const academicYear = headerInfo?.academicYear || new Date().getFullYear();

  const mappedData = estudiantes.map((e, idx) => {
    const rawNota =
      typeof e.nota === "number" ? e.nota : parseFloat(String(e.nota)) || 0;
    const condicion =
      typeof e.nota === "string" &&
      ["AD", "A", "B", "C"].includes(e.nota.toUpperCase())
        ? e.nota.toUpperCase() === "AD" || e.nota.toUpperCase() === "A"
          ? "Aprobado"
          : "Pendiente"
        : rawNota >= 11
          ? "Aprobado"
          : "Desaprobado";

    return {
      index: idx + 1,
      codigo: e.codigoEstudiante || "-",
      estudiante: `${e.apellidoPaterno || ""} ${e.apellidoMaterno || ""}, ${e.nombre || ""}`.trim(),
      nota: e.nota,
      condicion,
      observaciones: e.comentario || "-",
    };
  });

  const aprobados = mappedData.filter(
    (d) => d.condicion === "Aprobado",
  ).length;
  const desaprobados = mappedData.length - aprobados;
  const tasaAprobacion =
    mappedData.length > 0 ? (aprobados / mappedData.length) * 100 : 0;

  const wb = buildProfessionalExcelReport({
    title: `Registro de Calificaciones: ${evaluacionNombre}`,
    subtitle: `Asignatura: ${cursoNombre} — Año Académico ${academicYear}`,
    institutionInfo: headerInfo,
    academicYear,
    sheetName: "Evaluación",
    paletteName: "violet",
    kpiCards: [
      { label: "Total Evaluados", value: mappedData.length },
      { label: "Aprobados", value: aprobados },
      { label: "Desaprobados", value: desaprobados },
      { label: "% Efectividad", value: `${tasaAprobacion.toFixed(1)}%` },
    ],
    columns: GRADES_COLUMNS,
    data: mappedData,
    summaryRow: {
      labelColKey: "estudiante",
      label: "Promedio del Aula",
      calculations: {
        index: "count",
        nota: "avg",
      },
    },
  });

  const fileName = `Notas_${cursoNombre.replace(/\s+/g, "_")}_${evaluacionNombre.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
  await downloadExcelWorkbook(wb, fileName);
}
