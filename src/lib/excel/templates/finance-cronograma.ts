import {
  buildProfessionalExcelReport,
  ExcelColumnDef,
} from "../excel-builder";
import { downloadExcelWorkbook } from "../excel-download";
import {
  getExcelHeaderInfoAction,
  InstitutionHeaderInfo,
} from "@/actions/institucion";

const FINANCE_COLUMNS: ExcelColumnDef[] = [
  { key: "index", header: "N°", type: "number", width: 6, align: "center" },
  { key: "dni", header: "DNI Alumno", type: "text", width: 14, align: "center" },
  { key: "estudiante", header: "Estudiante", type: "text", width: 28 },
  { key: "aula", header: "Grado / Sección", type: "text", width: 18 },
  { key: "concepto", header: "Concepto de Cobro", type: "text", width: 22 },
  { key: "vencimiento", header: "Vencimiento", type: "date", width: 14 },
  { key: "montoOriginal", header: "Monto Original", type: "currency", width: 16 },
  { key: "mora", header: "Mora", type: "currency", width: 14 },
  { key: "totalExigible", header: "Total Exigible", type: "currency", width: 16 },
  { key: "montoPagado", header: "Monto Pagado", type: "currency", width: 16 },
  { key: "saldoPendiente", header: "Saldo Pendiente", type: "currency", width: 16 },
  { key: "estado", header: "Estado", type: "badge", width: 14 },
];

export async function exportFinanceCronogramaExcel(
  cronogramas: any[],
  customHeaderInfo?: InstitutionHeaderInfo,
) {
  let headerInfo = customHeaderInfo;
  if (!headerInfo) {
    const res = await getExcelHeaderInfoAction();
    if (res.data) headerInfo = res.data;
  }

  const academicYear = headerInfo?.academicYear || new Date().getFullYear();

  const mappedData = cronogramas.map((item, idx) => {
    const original = Number(item.monto || 0);
    const mora = Number(item.moraAcumulada || 0);
    const total = original + mora;
    const pagado = Number(item.montoPagado || (item.pagado ? total : 0));
    const pendiente = Math.max(0, total - pagado);

    const isVencido =
      !item.pagado && new Date(item.fechaVencimiento) < new Date();
    const estado = item.pagado
      ? "Pagado"
      : isVencido
        ? "Vencido"
        : "Pendiente";

    return {
      index: idx + 1,
      dni: item.estudiante?.dni || "-",
      estudiante: item.estudiante
        ? `${item.estudiante.apellidoPaterno || ""} ${item.estudiante.apellidoMaterno || ""}, ${item.estudiante.name || ""}`.trim()
        : "-",
      aula: item.estudiante?.nivelAcademico
        ? `${item.estudiante.nivelAcademico.grado?.nombre || ""} "${item.estudiante.nivelAcademico.seccion || ""}" (${item.estudiante.nivelAcademico.nivel?.nombre || ""})`.trim()
        : "-",
      concepto: item.concepto?.nombre || item.concepto || "Pensión Mensual",
      vencimiento: new Date(item.fechaVencimiento),
      montoOriginal: original,
      mora: mora,
      totalExigible: total,
      montoPagado: pagado,
      saldoPendiente: pendiente,
      estado,
    };
  });

  const totalExigible = mappedData.reduce(
    (acc, i) => acc + i.totalExigible,
    0,
  );
  const totalRecaudado = mappedData.reduce((acc, i) => acc + i.montoPagado, 0);
  const totalDeuda = mappedData.reduce((acc, i) => acc + i.saldoPendiente, 0);
  const totalMora = mappedData.reduce((acc, i) => acc + i.mora, 0);
  const tasaRecaudacion =
    totalExigible > 0 ? (totalRecaudado / totalExigible) * 100 : 0;

  const wb = buildProfessionalExcelReport({
    title: "Estado de Cuentas y Cronograma de Pensiones",
    subtitle: `Reporte Financiero Institucional de Cobranzas y Morosidad — Periodo ${academicYear}`,
    institutionInfo: headerInfo,
    academicYear,
    sheetName: "Cronograma de Cobranzas",
    paletteName: "navy",
    kpiCards: [
      {
        label: "Monto Facturado",
        value: `S/ ${totalExigible.toFixed(2)}`,
        subtext: "Total programado en cronograma",
      },
      {
        label: "Total Recaudado",
        value: `S/ ${totalRecaudado.toFixed(2)}`,
        subtext: "Ingresos en bancos y caja",
      },
      {
        label: "Deuda Pendiente",
        value: `S/ ${totalDeuda.toFixed(2)}`,
        subtext: `Incluye mora: S/ ${totalMora.toFixed(2)}`,
      },
      {
        label: "Efectividad Cobranza",
        value: `${tasaRecaudacion.toFixed(1)}%`,
        subtext: "Ratio global de cumplimiento",
      },
    ],
    columns: FINANCE_COLUMNS,
    data: mappedData,
    summaryRow: {
      labelColKey: "estudiante",
      label: "TOTALES CONSOLIDADOS",
      calculations: {
        index: "count",
        montoOriginal: "sum",
        mora: "sum",
        totalExigible: "sum",
        montoPagado: "sum",
        saldoPendiente: "sum",
      },
    },
  });

  const fileName = `Reporte_Financiero_Oficial_${academicYear}_${new Date().toISOString().split("T")[0]}`;
  await downloadExcelWorkbook(wb, fileName);
}
