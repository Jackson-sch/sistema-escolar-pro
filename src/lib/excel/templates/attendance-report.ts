import { buildProfessionalExcelReport, ExcelColumnDef } from "../excel-builder";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction, InstitutionHeaderInfo } from "@/actions/institucion";

const ATTENDANCE_COLUMNS: ExcelColumnDef[] = [
  { key: "index", header: "N°", type: "number", width: 6, align: "center" },
  { key: "dni", header: "DNI", type: "center", width: 14 },
  { key: "estudiante", header: "Estudiante", type: "text", width: 28 },
  { key: "aula", header: "Aula / Grado", type: "text", width: 18 },
  { key: "presentes", header: "Asistencias (P)", type: "number", width: 15 },
  { key: "tardanzas", header: "Tardanzas (T)", type: "number", width: 15 },
  { key: "faltasJustificadas", header: "Justificadas (FJ)", type: "number", width: 16 },
  { key: "faltasInjustificadas", header: "Injustificadas (FI)", type: "number", width: 16 },
  { key: "totalDias", header: "Total Días", type: "number", width: 12 },
  { key: "porcentajeAsistencia", header: "% Puntualidad", type: "percent", width: 16 },
  { key: "condicion", header: "Condición", type: "badge", width: 14 },
];

export async function exportAttendanceReportExcel(
  attendanceRecords: any[],
  mesNombre: string = "Mensual",
  anio?: number,
  customHeaderInfo?: InstitutionHeaderInfo,
) {
  let headerInfo = customHeaderInfo;
  if (!headerInfo) {
    const res = await getExcelHeaderInfoAction();
    if (res.data) headerInfo = res.data;
  }

  const academicYear = anio || Number(headerInfo?.academicYear) || new Date().getFullYear();

  const mappedData = attendanceRecords.map((r, idx) => {
    const total =
      r.totalDias ||
      r.presentes +
        r.tardanzas +
        r.faltasJustificadas +
        r.faltasInjustificadas ||
      1;
    const rate = ((r.presentes + r.tardanzas * 0.5) / total) * 100;
    const condicion =
      rate >= 85 ? "Activo" : rate >= 70 ? "Pendiente" : "Inactivo";

    return {
      index: idx + 1,
      dni: r.dni || r.estudiante?.dni || "-",
      estudiante:
        r.nombreCompleto ||
        `${r.estudiante?.apellidoPaterno || ""} ${r.estudiante?.name || ""}`,
      aula: r.aula || r.seccion || "-",
      presentes: r.presentes || 0,
      tardanzas: r.tardanzas || 0,
      faltasJustificadas: r.faltasJustificadas || 0,
      faltasInjustificadas: r.faltasInjustificadas || 0,
      totalDias: total,
      porcentajeAsistencia: Math.min(100, Math.max(0, rate)),
      condicion,
    };
  });

  const totalPresentes = mappedData.reduce((acc, r) => acc + r.presentes, 0);
  const totalTardanzas = mappedData.reduce((acc, r) => acc + r.tardanzas, 0);
  const totalFaltas = mappedData.reduce(
    (acc, r) => acc + r.faltasInjustificadas,
    0,
  );

  const wb = buildProfessionalExcelReport({
    title: "Reporte Mensual de Asistencia y Puntualidad",
    subtitle: `Consolidado de Asistencias correspondiente a ${mesNombre.toUpperCase()} — Ciclo ${academicYear}`,
    institutionInfo: headerInfo,
    academicYear,
    sheetName: `Asistencia_${mesNombre}`.substring(0, 31),
    paletteName: "emerald",
    kpiCards: [
      { label: "Total Alumnos Auditados", value: mappedData.length },
      { label: "Total Asistencias (P)", value: totalPresentes },
      { label: "Total Tardanzas (T)", value: totalTardanzas },
      { label: "Faltas Injustificadas (FI)", value: totalFaltas },
    ],
    columns: ATTENDANCE_COLUMNS,
    data: mappedData,
    summaryRow: {
      labelColKey: "estudiante",
      label: "Totales Generales",
      calculations: {
        index: "count",
        presentes: "sum",
        tardanzas: "sum",
        faltasJustificadas: "sum",
        faltasInjustificadas: "sum",
        porcentajeAsistencia: "avg",
      },
    },
  });

  const fileName = `Reporte_Asistencia_${mesNombre}_${academicYear}_${new Date().toISOString().split("T")[0]}`;
  await downloadExcelWorkbook(wb, fileName);
}
