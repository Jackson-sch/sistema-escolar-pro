import { buildProfessionalExcelReport, ExcelColumnDef } from "../excel-builder";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction, InstitutionHeaderInfo } from "@/actions/institucion";

const MATRICULA_COLUMNS: ExcelColumnDef[] = [
  { key: "index", header: "N°", type: "number", width: 6, align: "center" },
  { key: "codigoMatricula", header: "Cód. Matrícula", type: "center", width: 16 },
  { key: "fecha", header: "Fecha Matrícula", type: "date", width: 14 },
  { key: "dni", header: "DNI Estudiante", type: "center", width: 14 },
  { key: "estudianteNombre", header: "Estudiante", type: "text", width: 28 },
  { key: "nivel", header: "Nivel", type: "text", width: 14 },
  { key: "grado", header: "Grado", type: "text", width: 14 },
  { key: "seccion", header: "Sección", type: "center", width: 10 },
  { key: "sede", header: "Sede", type: "text", width: 16 },
  { key: "tipoMatricula", header: "Tipo", type: "badge", width: 14 },
  { key: "montoMatricula", header: "Costo Matrícula", type: "currency", width: 16 },
  { key: "estado", header: "Estado", type: "badge", width: 14 },
];

export async function exportMatriculasConsolidadoExcel(
  matriculas: any[],
  customHeaderInfo?: InstitutionHeaderInfo,
) {
  let headerInfo = customHeaderInfo;
  if (!headerInfo) {
    const res = await getExcelHeaderInfoAction();
    if (res.data) headerInfo = res.data;
  }

  const academicYear = headerInfo?.academicYear || new Date().getFullYear();

  const mappedData = matriculas.map((m, idx) => ({
    index: idx + 1,
    codigoMatricula:
      m.codigoMatricula || m.codigo || `MAT-${String(idx + 1).padStart(5, "0")}`,
    fecha: m.fechaMatricula ? new Date(m.fechaMatricula) : new Date(),
    dni: m.estudiante?.dni || "-",
    estudianteNombre: m.estudiante
      ? `${m.estudiante.apellidoPaterno || ""} ${m.estudiante.apellidoMaterno || ""}, ${m.estudiante.name || ""}`.trim()
      : "-",
    nivel: m.nivelAcademico?.nivel?.nombre || "-",
    grado: m.nivelAcademico?.grado?.nombre || "-",
    seccion: m.nivelAcademico?.seccion || "-",
    sede: m.nivelAcademico?.sede?.nombre || "Principal",
    tipoMatricula: m.esPrimeraVez ? "Ingresante" : "Continuidad",
    montoMatricula: Number(m.montoMatricula || m.costo || 0),
    estado: m.estado || "Activo",
  }));

  const totalRecaudado = mappedData.reduce(
    (acc, m) => acc + m.montoMatricula,
    0,
  );
  const totalIngresantes = mappedData.filter(
    (m) => m.tipoMatricula === "Ingresante",
  ).length;

  const wb = buildProfessionalExcelReport({
    title: "Consolidado Oficial de Matrículas",
    subtitle: `Reporte de Matrículas y Asignación de Vacantes — Año Escolar ${academicYear}`,
    institutionInfo: headerInfo,
    academicYear,
    sheetName: "Matrículas",
    paletteName: "indigo",
    kpiCards: [
      { label: "Total Matriculados", value: mappedData.length },
      { label: "Nuevos Ingresantes", value: totalIngresantes },
      { label: "Continuidad", value: mappedData.length - totalIngresantes },
      {
        label: "Recaudación Matrículas",
        value: `S/ ${totalRecaudado.toFixed(2)}`,
      },
    ],
    columns: MATRICULA_COLUMNS,
    data: mappedData,
    summaryRow: {
      labelColKey: "estudianteNombre",
      label: "Totales Generales",
      calculations: {
        index: "count",
        montoMatricula: "sum",
      },
    },
  });

  const fileName = `Consolidado_Matriculas_${academicYear}_${new Date().toISOString().split("T")[0]}`;
  await downloadExcelWorkbook(wb, fileName);
}
