"use client";

import * as React from "react";
import {
  Calendar,
  Wallet,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/formats";

import { TopMorosidadList } from "./top-morosidad-list";
import { Button } from "@/components/ui/button";
import { IconFileText, IconTable } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const IngresosMensualesChart = dynamic(
  () => import("./ingresos-mensuales-chart").then((mod) => mod.IngresosMensualesChart),
  { ssr: false }
);
const EstadoGeneralChart = dynamic(
  () => import("./estado-general-chart").then((mod) => mod.EstadoGeneralChart),
  { ssr: false }
);
import { exportToExcel, formatCronogramaForExcel } from "@/lib/export-utils";
import { FinanceReportPDF } from "./finance-report-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);
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
  trend,
  progress,
  delay = 0,
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  color?: "primary" | "emerald" | "red" | "amber";
  trend?: { value: number; isUp: boolean };
  progress?: number;
  delay?: number;
}) {
  const colors = {
    primary: {
      icon: "text-primary bg-primary/10 border-primary/20",
      bar: "bg-primary",
      glow: "shadow-primary/5",
      accent: "text-primary",
    },
    emerald: {
      icon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      bar: "bg-emerald-500",
      glow: "shadow-emerald-500/5",
      accent: "text-emerald-500",
    },
    red: {
      icon: "text-red-500 bg-red-500/10 border-red-500/20",
      bar: "bg-red-500",
      glow: "shadow-red-500/5",
      accent: "text-red-500",
    },
    amber: {
      icon: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      bar: "bg-amber-500",
      glow: "shadow-amber-500/5",
      accent: "text-amber-500",
    },
  };

  const c = colors[color];

  return (
    <Card
      className={cn(
        "bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden group hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-[background-color,box-shadow,transform] duration-300 animate-in fade-in slide-in-from-bottom-4",
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "size-11 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
              c.icon,
            )}
          >
            <Icon size={20} />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                trend.isUp
                  ? "text-emerald-600 bg-emerald-500/10"
                  : "text-red-500 bg-red-500/10",
              )}
            >
              {trend.isUp ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {trend.value.toFixed(1)}%
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
            {title}
          </p>
          <h3 className="text-2xl font-black tracking-tighter leading-none">
            {value}
          </h3>
          <p className="text-xs text-muted-foreground/80 font-medium">
            {description}
          </p>
        </div>

        {/* Micro progress bar */}
        {progress !== undefined && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                Progreso
              </span>
              <span className={cn("text-[10px] font-black", c.accent)}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-1000 ease-out",
                  c.bar,
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FinanzasReportes({
  cronograma,
  institucion,
}: FinanzasReportesProps) {
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

  // Porcentaje de deuda respecto al total
  const deudaPorcentaje =
    totalProyectado > 0
      ? ((totalDeuda) / (totalProyectado + totalMoraReporte)) * 100
      : 0;

  // true solo después de la hidratación (SSR-safe) sin efecto de montaje.
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Fecha de "hoy" calculada solo en el cliente (SSR-safe): evita new Date()
  // y toLocaleDateString() dentro del JSX (mismatch de hidratación).
  const todayLabel = React.useSyncExternalStore(
    () => () => {},
    () => new Date().toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
    () => "",
  );
  const todayStamp = React.useSyncExternalStore(
    () => () => {},
    () => new Date().toISOString().split("T")[0],
    () => "",
  );

  return (
    <div className="space-y-8 animate-in fade-in animation-duration-">
      {/* ── HEADER PREMIUM ── */}
      <div className="overflow-hidden rounded-2xl bg-card/80 border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Reportes de Recaudación
                </h2>
                <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed">
                  Análisis proyectado vs recaudado con indicadores de mora.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold gap-2 px-4 h-10 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 transition-[background-color,transform] hover:scale-105 active:scale-95"
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
                      fecha: todayLabel,
                    }}
                    institucion={institucion}
                  />
                }
                fileName={`Reporte_Finanzas_${todayStamp}.pdf`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold gap-2 px-4 h-10 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 transition-[background-color,transform] hover:scale-105 active:scale-95"
                >
                  <IconFileText className="size-4" />
                  Descargar PDF
                </Button>
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>

      {/* ── KPIs CON STAGGERED ANIMATION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <ReportStatCard
          title="Monto Proyectado"
          value={formatCurrency(totalProyectado)}
          icon={Calendar}
          description="Total esperado anual"
          color="primary"
          delay={0}
        />

        <ReportStatCard
          title="Monto Recaudado"
          value={formatCurrency(totalReal)}
          icon={Wallet}
          description={`${cumplimiento.toFixed(1)}% de cumplimiento`}
          color="emerald"
          trend={{ value: cumplimiento, isUp: cumplimiento >= 50 }}
          progress={cumplimiento}
          delay={75}
        />

        <ReportStatCard
          title="Deuda Pendiente"
          value={formatCurrency(totalDeuda)}
          icon={AlertTriangle}
          description={`Mora acumulada: ${formatCurrency(totalMoraReporte)}`}
          color="red"
          progress={deudaPorcentaje}
          delay={150}
        />

        <ReportStatCard
          title="Tasa de Cobro"
          value={`${cumplimiento.toFixed(1)}%`}
          icon={TrendingUp}
          description="Eficiencia de recaudación"
          color="amber"
          progress={cumplimiento}
          delay={225}
        />
      </div>

      {/* ── CHARTS AREA ── */}
      <div className="space-y-8">
        {/* Gráfico de Barras - Full Width */}
        <div
          className="animate-in fade-in slide-in-from-bottom-6 animation-duration-500"
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
        >
          <IngresosMensualesChart data={ingresosMensuales} />
        </div>

        {/* Sidebar con Lista y Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="animate-in fade-in slide-in-from-left-6 animation-duration-500"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            <TopMorosidadList deudores={topDeudores} />
          </div>
          <div
            className="animate-in fade-in slide-in-from-right-6 animation-duration-500"
            style={{ animationDelay: "450ms", animationFillMode: "both" }}
          >
            <EstadoGeneralChart data={distribucionEstados} />
          </div>
        </div>
      </div>
    </div>
  );
}
