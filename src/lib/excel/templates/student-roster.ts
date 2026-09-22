import { buildProfessionalExcelReport, ExcelColumnDef } from "../excel-builder";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction, InstitutionHeaderInfo } from "@/actions/institucion";

export interface StudentRosterRow {
  index: number;
  codigo: string;
  dni: string;
  paterno: string;
  materno: string;
  nombres: string;
  genero: string;
  nivel: string;
  grado: string;
  seccion: string;
  sede: string;
  apoderadoNombre: string;
  apoderadoDni: string;
  apoderadoTelefono: string;
  apoderadoEmail: string;
  direccion: string;
  estado: string;
  matriculado: string;
}

const STUDENT_COLUMNS: ExcelColumnDef[] = [
  { key: "index", header: "N°", type: "number", width: 6, align: "center" },
  { key: "codigo", header: "Cód. Modular / Est.", type: "center", width: 18 },
  { key: "dni", header: "DNI / Doc.", type: "center", width: 14 },
  { key: "paterno", header: "Apellido Paterno", type: "text", width: 18 },
  { key: "materno", header: "Apellido Materno", type: "text", width: 18 },
  { key: "nombres", header: "Nombres", type: "text", width: 22 },
  { key: "genero", header: "Sexo", type: "center", width: 8 },
  { key: "nivel", header: "Nivel", type: "text", width: 14 },
  { key: "grado", header: "Grado", type: "text", width: 14 },
  { key: "seccion", header: "Sección", type: "center", width: 10 },
  { key: "sede", header: "Sede", type: "text", width: 16 },
  { key: "apoderadoNombre", header: "Apoderado Principal", type: "text", width: 26 },
  { key: "apoderadoTelefono", header: "Teléfono", type: "center", width: 14 },
  { key: "estado", header: "Estado Usuario", type: "badge", width: 14 },
  { key: "matriculado", header: "Matrícula Año Actual", type: "badge", width: 18 },
];

export async function exportStudentRosterExcel(
  students: any[],
  customHeaderInfo?: InstitutionHeaderInfo,
) {
  let headerInfo = customHeaderInfo;
  if (!headerInfo) {
    const res = await getExcelHeaderInfoAction();
    if (res.data) headerInfo = res.data;
  }

  const academicYear = headerInfo?.academicYear || new Date().getFullYear();

  const mappedData: StudentRosterRow[] = students.map((s, idx) => {
    const matricula = s.matriculas?.[0];
    const apoderadoRel =
      s.padresTutores?.find((pt: any) => pt.contactoPrimario) ||
      s.padresTutores?.[0];
    const apoderado = apoderadoRel?.padreTutor;

    return {
      index: idx + 1,
      codigo: s.codigoEstudiante || s.codigoSiagie || "-",
      dni: s.dni || "-",
      paterno: s.apellidoPaterno || "-",
      materno: s.apellidoMaterno || "-",
      nombres: s.name || "-",
      genero: s.sexo ? s.sexo.toUpperCase().substring(0, 1) : "-",
      nivel:
        matricula?.nivelAcademico?.nivel?.nombre ||
        s.nivelAcademico?.nivel?.nombre ||
        "-",
      grado:
        matricula?.nivelAcademico?.grado?.nombre ||
        s.nivelAcademico?.grado?.nombre ||
        "-",
      seccion:
        matricula?.nivelAcademico?.seccion ||
        s.nivelAcademico?.seccion ||
        "-",
      sede:
        matricula?.nivelAcademico?.sede?.nombre ||
        s.nivelAcademico?.sede?.nombre ||
        "Principal",
      apoderadoNombre: apoderado
        ? `${apoderado.name} ${apoderado.apellidoPaterno || ""}`.trim()
        : "No registrado",
      apoderadoDni: apoderado?.dni || "-",
      apoderadoTelefono: apoderado?.telefono || s.telefono || "-",
      apoderadoEmail: apoderado?.email || "-",
      direccion: s.direccion || "-",
      estado: s.estado?.nombre || "Activo",
      matriculado: matricula ? "Matriculado" : "Sin Matrícula",
    };
  });

  const totalActivos = mappedData.filter(
    (d) => d.estado.toLowerCase() === "activo",
  ).length;
  const totalMatriculados = mappedData.filter(
    (d) => d.matriculado === "Matriculado",
  ).length;

  const wb = buildProfessionalExcelReport({
    title: "Padrón General de Estudiantes",
    subtitle: `Directorio Oficial de Alumnos y Apoderados — Ciclo Lectivo ${academicYear}`,
    institutionInfo: headerInfo,
    academicYear,
    sheetName: "Padrón Estudiantes",
    paletteName: "navy",
    kpiCards: [
      { label: "Total Registrados", value: mappedData.length },
      { label: "Estudiantes Activos", value: totalActivos },
      { label: "Matriculados Ciclo", value: totalMatriculados },
      { label: "Sin Matrícula", value: mappedData.length - totalMatriculados },
    ],
    columns: STUDENT_COLUMNS,
    data: mappedData,
    summaryRow: {
      labelColKey: "paterno",
      label: "Total Estudiantes",
      calculations: {
        index: "count",
      },
    },
  });

  const fileName = `Padron_Estudiantes_${academicYear}_${new Date().toISOString().split("T")[0]}`;
  await downloadExcelWorkbook(wb, fileName);
}
