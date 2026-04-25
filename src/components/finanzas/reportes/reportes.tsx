"use client";

import * as React from "react";
import { Calendar, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formats";

import { IngresosMensualesChart } from "./ingresos-mensuales-chart";
import { TopMorosidadList } from "./top-morosidad-list";
import { EstadoGeneralChart } from "./estado-general-chart";
import { Button } from "@/components/ui/button";
import { IconFileText, IconTable, IconChartPie } from "@tabler/icons-react";
import { exportToExcel, formatCronogramaForExcel } from "@/lib/export-utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FinanceReportPDF } from "./finance-report-pdf";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FinanzasReportesProps {
  cronograma: any[];
  institucion: any;
}

function ReportStatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "primary",
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  color?: "primary" | "emerald" | "red" | "amber";
}) {
  const colors = {
    primary: "text-primary bg-primary/10 border-primary/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <Card className="liquid-glass border-none overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("size-10 rounded-xl flex items-center justify-center border", colors[color])}>
            <Icon size={20} />
          </div>
          <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase opacity-60">
            En tiempo real
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{title}</p>
          <h3 className="text-2xl font-black tracking-tighter">{value}</h3>
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanzasReportes({ cronograma, institucion }: FinanzasReportesProps) {
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
      (a, b) => nombresMeses.indexOf(a.name) - nombresMeses.indexOf(b.name),
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
    0,
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 liquid-glass">
        <div>
          <h2 className="text-xl font-black tracking-tight">Reportes de Recaudación</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Análisis proyectado vs recaudado con indicadores de mora.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-bold gap-2 px-4 h-10 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 transition-all"
            onClick={() =>
              exportToExcel(
                formatCronogramaForExcel(cronograma),
                "Reporte_Finanzas",
                "Cronograma",
              )
            }
          >
            <IconTable className="size-4" />
            Exportar Excel
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
                  institucion={institucion}
                />
              }
              fileName={`Reporte_Finanzas_${
                new Date().toISOString().split("T")[0]
              }.pdf`}
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold gap-2 px-4 h-10 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 transition-all"
              >
                <IconFileText className="size-4" />
                Descargar PDF
              </Button>
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard
          title="Monto Proyectado"
          value={formatCurrency(totalProyectado)}
          icon={Calendar}
          description="Total esperado anual"
          color="primary"
        />

        <ReportStatCard
          title="Monto Recaudado"
          value={formatCurrency(totalReal)}
          icon={Wallet}
          description={`${cumplimiento.toFixed(1)}% de cumplimiento`}
          color="emerald"
        />

        <ReportStatCard
          title="Deuda Pendiente"
          value={formatCurrency(totalDeuda)}
          icon={AlertTriangle}
          description={`Mora: ${formatCurrency(totalMoraReporte)}`}
          color="red"
        />

        <ReportStatCard
          title="Tasa de Cobro"
          value={`${cumplimiento.toFixed(1)}%`}
          icon={TrendingUp}
          description="Eficiencia de recaudación"
          color="amber"
        />
      </div>

      {/* CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Barras */}
        <div className="col-span-3">
          <IngresosMensualesChart data={ingresosMensuales} />
        </div>

        {/* Sidebar con Lista y Donut */}
        <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopMorosidadList deudores={topDeudores} />
          <EstadoGeneralChart data={distribucionEstados} />
        </div>
      </div>
    </div>
  );
}

