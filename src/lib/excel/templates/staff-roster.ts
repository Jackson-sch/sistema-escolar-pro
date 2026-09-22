import { buildProfessionalExcelReport, ExcelColumnDef } from "../excel-builder";
import { downloadExcelWorkbook } from "../excel-download";
import { getExcelHeaderInfoAction, InstitutionHeaderInfo } from "@/actions/institucion";

export interface StaffRosterRow {
  index: number;
  dni: string;
  paterno: string;
  materno: string;
  nombres: string;
  cargo: string;
  area: string;
  rol: string;
  email: string;
  telefono: string;
  tipoContrato: string;
  fechaIngreso: string;
  estado: string;
}

const STAFF_COLUMNS: ExcelColumnDef[] = [
  { key: "index", header: "N°", type: "number", width: 6, align: "center" },
  { key: "dni", header: "DNI / Doc.", type: "center", width: 14 },
  { key: "paterno", header: "Apellido Paterno", type: "text", width: 18 },
  { key: "materno", header: "Apellido Materno", type: "text", width: 18 },
  { key: "nombres", header: "Nombres", type: "text", width: 22 },
  { key: "cargo", header: "Cargo Institucional", type: "text", width: 22 },
  { key: "area", header: "Área / Departamento", type: "text", width: 20 },
  { key: "rol", header: "Rol Sistema", type: "badge", width: 16 },
  { key: "email", header: "Correo Electrónico", type: "text", width: 28 },
  { key: "telefono", header: "Teléfono / Móvil", type: "center", width: 16 },
  { key: "tipoContrato", header: "Tipo Contrato", type: "text", width: 16 },
  { key: "fechaIngreso", header: "Fecha Ingreso", type: "center", width: 14 },
  { key: "estado", header: "Estado", type: "badge", width: 14 },
];

export async function exportStaffRosterExcel(
  staffList: any[],
  customHeaderInfo?: InstitutionHeaderInfo,
) {
  let headerInfo = customHeaderInfo;
  if (!headerInfo) {
    const res = await getExcelHeaderInfoAction();
    if (res.data) headerInfo = res.data;
  }

  const academicYear = headerInfo?.academicYear || new Date().getFullYear();

  const mappedData: StaffRosterRow[] = staffList.map((s, idx) => {
    let fechaIngresoStr = "-";
    if (s.fechaIngreso) {
      const d = new Date(s.fechaIngreso);
      if (!isNaN(d.getTime())) {
        fechaIngresoStr = d.toLocaleDateString("es-PE");
      }
    }

    return {
      index: idx + 1,
      dni: s.dni || "-",
      paterno: s.apellidoPaterno || "-",
      materno: s.apellidoMaterno || "-",
      nombres: s.name || "-",
      cargo: s.cargo?.nombre || "Sin cargo",
      area: s.area || "General",
      rol: s.role ? s.role.toUpperCase() : "PERSONAL",
      email: s.email || "-",
      telefono: s.telefono || "-",
      tipoContrato: s.tipoContrato || "-",
      fechaIngreso: fechaIngresoStr,
      estado: s.estado?.nombre || "Activo",
    };
  });

  const totalActivos = mappedData.filter(
    (d) => d.estado.toLowerCase() === "activo",
  ).length;
  const totalDocentes = mappedData.filter(
    (d) => d.rol === "PROFESOR",
  ).length;
  const totalAdmin = mappedData.filter(
    (d) => d.rol !== "PROFESOR",
  ).length;

  const wb = buildProfessionalExcelReport({
    title: "Nómina General de Personal y Docentes",
    subtitle: `Directorio Institucional de Recursos Humanos — Periodo Lectivo ${academicYear}`,
    institutionInfo: headerInfo,
    academicYear,
    sheetName: "Nómina Personal",
    paletteName: "navy",
    kpiCards: [
      { label: "Total Personal", value: mappedData.length },
      { label: "Planta Docente", value: totalDocentes },
      { label: "Administrativos", value: totalAdmin },
      { label: "Personal Activo", value: totalActivos },
    ],
    columns: STAFF_COLUMNS,
    data: mappedData,
    summaryRow: {
      labelColKey: "paterno",
      label: "Total Colaboradores",
      calculations: {
        index: "count",
      },
    },
  });

  const fileName = `Nomina_Personal_${academicYear}_${new Date().toISOString().split("T")[0]}`;
  await downloadExcelWorkbook(wb, fileName);
}
