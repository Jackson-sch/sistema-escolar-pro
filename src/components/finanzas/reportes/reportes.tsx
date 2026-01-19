"use client";

import * as React from "react";
import { Calendar, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formats";

import StatCard from "@/components/stat-card";
import { IngresosMensualesChart } from "./ingresos-mensuales-chart";
import { TopMorosidadList } from "./top-morosidad-list";
import { EstadoGeneralChart } from "./estado-general-chart";
import { Button } from "@/components/ui/button";
import { IconFileText, IconTable, IconDownload } from "@tabler/icons-react";
import { exportToExcel, formatCronogramaForExcel } from "@/lib/export-utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FinanceReportPDF } from "./finance-report-pdf";

interface FinanzasReportesProps {
  cronograma: any[];
}

export function FinanzasReportes({ cronograma }: FinanzasReportesProps) {
  // Procesar datos para ingresos mensuales
  const ingresosMensuales = React.useMemo(() => {
    const meses: Record<
      string,
      { name: string; proyectado: number; real: number }
    > = {};
    const nombresMeses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    cronograma.forEach((item) => {
      const fecha = new Date(item.fechaVencimiento);
      const mesIdx = fecha.getMonth();
      const mesNombre = nombresMeses[mesIdx];

      if (!meses[mesNombre]) {
        meses[mesNombre] = { name: mesNombre, proyectado: 0, real: 0 };
      }

      meses[mesNombre].proyectado += Number(item.monto);
      meses[mesNombre].real += Number(item.montoPagado);
    });

    return Object.values(meses).sort(
      (a, b) => nombresMeses.indexOf(a.name) - nombresMeses.indexOf(b.name)
    );
  }, [cronograma]);

  // Obtener Top Deudores y Mora Total
  const { topDeudores, totalMoraReporte } = React.useMemo(() => {
    const deudores: Record<
      string,
      { id: string; nombre: string; deuda: number; cuotas: number }
    > = {};
    let accumulatedMora = 0;

    cronograma.forEach((item) => {
      accumulatedMora += Number(item.moraAcumulada || 0);

      if (!item.pagado) {
        const est = item.estudiante;
        const key = est.id;
        if (!deudores[key]) {
          deudores[key] = {
            id: key,
            nombre: `${est.apellidoPaterno} ${est.name}`,
            deuda: 0,
            cuotas: 0,
          };
        }
        deudores[key].deuda +=
          Number(item.monto) +
          Number(item.moraAcumulada || 0) -
          Number(item.montoPagado);
        deudores[key].cuotas += 1;
      }
    });

    return {
      topDeudores: Object.values(deudores)
        .sort((a, b) => b.deuda - a.deuda)
        .slice(0, 5),
      totalMoraReporte: accumulatedMora,
    };
  }, [cronograma]);

  // Distribución por estado
  const distribucionEstados = React.useMemo(() => {
    const counts = { pagado: 0, pendiente: 0, vencido: 0 };
    const hoy = new Date();

    cronograma.forEach((item) => {
      if (item.pagado) counts.pagado++;
      else if (new Date(item.fechaVencimiento) < hoy) counts.vencido++;
      else counts.pendiente++;
    });

    return [
      { name: "pagados", value: counts.pagado, fill: "" },
      { name: "pendientes", value: counts.pendiente, fill: "" },
      { name: "vencidos", value: counts.vencido, fill: "" },
    ];
  }, [cronograma]);

  // Calcular totales
  const totalProyectado = ingresosMensuales.reduce(
    (acc, curr) => acc + curr.proyectado,
    0
  );
  const totalReal = ingresosMensuales.reduce((acc, curr) => acc + curr.real, 0);
  const totalDeuda = totalProyectado + totalMoraReporte - totalReal;
  const cumplimiento =
    totalProyectado > 0 ? (totalReal / totalProyectado) * 100 : 0;

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6 px-2">
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-lg font-bold">Resumen Financiero</h2>
          <p className="text-sm text-muted-foreground">
            Análisis detallado de recaudación y mora.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2"
            onClick={() =>
              exportToExcel(
                formatCronogramaForExcel(cronograma),
                "Reporte_Finanzas",
                "Cronograma"
              )
            }
          >
            <IconTable className="size-4 text-emerald-600" />
            Excel
          </Button>

          {isMounted && (
            <PDFDownloadLink
              document={
                <FinanceReportPDF
                  data={{
                    totalProyectado,
                    totalReal,
                    totalDeuda,
                    cumplimiento,
                    totalMora: totalMoraReporte,
                    topDeudores,
                    fecha: new Date().toLocaleDateString("es-PE"),
                  }}
                />
              }
              fileName={`Reporte_Finanzas_${
                new Date().toISOString().split("T")[0]
              }.pdf`}
            >
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <IconFileText className="size-4 text-red-600" />
                PDF
              </Button>
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* KPIs usando StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Proyectado"
          value={formatCurrency(totalProyectado)}
          icon={Calendar}
          description="Total esperado"
        />

        <StatCard
          title="Recaudado"
          value={formatCurrency(totalReal)}
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-500/10"
          description={`${cumplimiento.toFixed(0)}% de cumplimiento`}
        />

        <StatCard
          title="Deuda Pendiente"
          value={formatCurrency(totalDeuda)}
          icon={AlertTriangle}
          iconColor="text-destructive"
          iconBgColor="bg-destructive/10"
          description={`Incluye S/ ${totalMoraReporte.toFixed(2)} de mora`}
        />

        <StatCard
          title="Cumplimiento"
          value={`${cumplimiento.toFixed(1)}%`}
          icon={TrendingUp}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          description="Eficiencia de cobro"
        />
      </div>

      {/* CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras */}
        <div className="col-span-3">
          <IngresosMensualesChart data={ingresosMensuales} />
        </div>

        {/* Sidebar con Lista y Donut */}
        <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMorosidadList deudores={topDeudores} />
          <EstadoGeneralChart data={distribucionEstados} />
        </div>
      </div>
    </div>
  );
}
