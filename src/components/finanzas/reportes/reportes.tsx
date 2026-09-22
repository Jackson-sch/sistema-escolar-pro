"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportFinanceCronogramaExcel } from "@/lib/excel/templates/finance-cronograma";
import { ReportHeaderBanner } from "./components/report-header-banner";
import { ReportKpisGrid } from "./components/report-kpis-grid";
import { NivelRecaudacionMatrix } from "./components/nivel-recaudacion-matrix";
import { TopMorosidadList } from "./top-morosidad-list";

const IngresosMensualesChart = dynamic(
  () =>
    import("./ingresos-mensuales-chart").then(
      (mod) => mod.IngresosMensualesChart,
    ),
  { ssr: false },
);

const EstadoGeneralChart = dynamic(
  () =>
    import("./estado-general-chart").then((mod) => mod.EstadoGeneralChart),
  { ssr: false },
);

interface FinanzasReportesProps {
  cronograma: any[];
  institucion: any;
}

const emptySubscribe = () => () => {};

export function FinanzasReportes({
  cronograma,
  institucion,
}: FinanzasReportesProps) {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [isExportingExcel, setIsExportingExcel] = React.useState(false);

  const {
    totalProyectado,
    totalReal,
    totalDeuda,
    totalMoraReporte,
    cumplimiento,
    deudaPorcentaje,
    ingresosMensuales,
    topDeudores,
    distribucionEstados,
    todayLabel,
    todayStamp,
  } = React.useMemo(() => {
    let proyectado = 0;
    let real = 0;
    let deuda = 0;
    let moraTotal = 0;

    const mesesNombres = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Oct",
      "Nov",
      "Dic",
    ];

    const meses: Record<
      string,
      { name: string; proyectado: number; real: number }
    > = {};

    mesesNombres.forEach((m) => {
      meses[m] = { name: m, proyectado: 0, real: 0 };
    });

    const deudoresMap: Record<
      string,
      { cuotas: number; deuda: number; telefono?: string; aula?: string }
    > = {};
    let countPagados = 0;
    let countPendientes = 0;
    let countVencidos = 0;

    const hoy = new Date();

    cronograma.forEach((item: any) => {
      const original = Number(item.monto || 0);
      const mora = Number(item.moraAcumulada || 0);
      const exigible = original + mora;
      const pagado = Number(item.montoPagado || (item.pagado ? exigible : 0));
      const saldo = Math.max(0, exigible - pagado);

      proyectado += original;
      real += pagado;
      deuda += saldo;
      moraTotal += mora;

      if (item.fechaVencimiento) {
        const fecha = new Date(item.fechaVencimiento);
        const mesIdx = fecha.getMonth();
        const mesNombre = mesesNombres[mesIdx];
        if (meses[mesNombre]) {
          meses[mesNombre].proyectado += original;
        }
      }

      if (pagado > 0 && item.fechaPago) {
        const fecha = new Date(item.fechaPago);
        const mesIdx = fecha.getMonth();
        const mesNombre = mesesNombres[mesIdx];
        if (meses[mesNombre]) {
          meses[mesNombre].real += pagado;
        }
      }

      if (saldo > 0) {
        const estNombre = item.estudiante
          ? `${item.estudiante.apellidoPaterno || ""} ${item.estudiante.apellidoMaterno || ""}, ${item.estudiante.name || ""}`.trim()
          : "Estudiante";
        const aulaStr = item.estudiante?.nivelAcademico
          ? `${item.estudiante.nivelAcademico.grado?.nombre || ""} "${item.estudiante.nivelAcademico.seccion || ""}"`
          : undefined;
        const phone =
          item.estudiante?.padresTutores?.[0]?.padreTutor?.telefono ||
          item.estudiante?.telefono ||
          undefined;

        if (!deudoresMap[estNombre]) {
          deudoresMap[estNombre] = {
            cuotas: 0,
            deuda: 0,
            telefono: phone,
            aula: aulaStr,
          };
        }
        deudoresMap[estNombre].cuotas += 1;
        deudoresMap[estNombre].deuda += saldo;
      }

      if (item.pagado || saldo === 0) {
        countPagados++;
      } else if (new Date(item.fechaVencimiento) < hoy) {
        countVencidos++;
      } else {
        countPendientes++;
      }
    });

    const deudoresSorted = Object.entries(deudoresMap)
      .map(([nombre, val], idx) => ({
        id: `deudor-${idx}`,
        nombre,
        ...val,
      }))
      .sort((a, b) => b.deuda - a.deuda)
      .slice(0, 5);

    const tasaCumplimiento =
      proyectado > 0 ? (real / proyectado) * 100 : 0;
    const porcentajeDeuda =
      proyectado > 0 ? (deuda / proyectado) * 100 : 0;

    const distribucionEstados = [
      { name: "pagados", value: countPagados, fill: "var(--chart-9)" },
      { name: "pendientes", value: countPendientes, fill: "var(--chart-11)" },
      { name: "vencidos", value: countVencidos, fill: "var(--chart-13)" },
    ];

    return {
      totalProyectado: proyectado,
      totalReal: real,
      totalDeuda: deuda,
      totalMoraReporte: moraTotal,
      cumplimiento: tasaCumplimiento,
      deudaPorcentaje: porcentajeDeuda,
      ingresosMensuales: Object.values(meses),
      topDeudores: deudoresSorted,
      distribucionEstados,
      todayLabel: hoy.toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
      todayStamp: hoy.toISOString().split("T")[0],
    };
  }, [cronograma]);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportFinanceCronogramaExcel(cronograma);
      toast.success("Reporte oficial en Excel generado con éxito.");
    } catch {
      toast.error("Error al generar el reporte en Excel.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const pdfData = {
    totalProyectado,
    totalReal,
    totalDeuda,
    cumplimiento,
    totalMora: totalMoraReporte,
    topDeudores,
    fecha: todayLabel,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── 1. CABECERA EJECUTIVA Y BOTONES DE DESCARGA ── */}
      <ReportHeaderBanner
        isMounted={isMounted}
        isExportingExcel={isExportingExcel}
        onExportExcel={handleExportExcel}
        pdfData={pdfData}
        institucion={institucion}
        todayStamp={todayStamp}
      />

      {/* ── 2. MATRIZ DE KPIS FINANCIEROS ── */}
      <ReportKpisGrid
        totalProyectado={totalProyectado}
        totalReal={totalReal}
        totalDeuda={totalDeuda}
        totalMora={totalMoraReporte}
        cumplimiento={cumplimiento}
        deudaPorcentaje={deudaPorcentaje}
      />

      {/* ── 3. MATRIZ DE RENDIMIENTO POR NIVEL EDUCATIVO ── */}
      <NivelRecaudacionMatrix cronograma={cronograma} />

      {/* ── 4. GRÁFICO DE TENDENCIA MENSUAL ── */}
      <IngresosMensualesChart data={ingresosMensuales} />

      {/* ── 5. MOROSIDAD & DISTRIBUCIÓN DE ESTADOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMorosidadList deudores={topDeudores} />
        <EstadoGeneralChart data={distribucionEstados} />
      </div>
    </div>
  );
}
