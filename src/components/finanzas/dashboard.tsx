"use client";

import {
  IconCash,
  IconClock,
  IconAlertTriangle,
  IconReceipt2,
  IconTrendingUp,
  IconChartBar,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FinanzasDashboardProps {
  estadisticas?: {
    pendiente: number;
    cobrado: number;
    deudasVencidas: number;
    totalMora: number;
    pagosPendientesVerificacion: number;
    recaudacionMensual: number;
    proyeccionMensual: number;
  };
}

const handleFilterVerificacion = () => {
  window.location.href = "/finanzas/verificacion";
};

function KpiCardRecaudado({ cobrado, tasaCobro }: { cobrado: number; tasaCobro: number }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-[border-color,box-shadow] duration-300 group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <IconCash className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
              Total Recaudado
            </p>
            <Badge
              variant="outline"
              className="text-[9px] font-black px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-none"
            >
              {tasaCobro.toFixed(0)}%
            </Badge>
          </div>
          <h4 className="text-lg sm:text-xl font-black font-mono tracking-tight text-foreground truncate">
            {formatCurrency(cobrado)}
          </h4>
        </div>
      </div>
    </div>
  );
}

function KpiCardPorCobrar({ pendiente, moraRate }: { pendiente: number; moraRate: number }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-amber-500/30 transition-[border-color,box-shadow] duration-300 group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="size-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <IconClock className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
              Saldo por Cobrar
            </p>
            <Badge
              variant="outline"
              className="text-[9px] font-black px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 border-none"
            >
              {moraRate.toFixed(0)}%
            </Badge>
          </div>
          <h4 className="text-lg sm:text-xl font-black font-mono tracking-tight text-foreground truncate">
            {formatCurrency(pendiente)}
          </h4>
        </div>
      </div>
    </div>
  );
}

function KpiCardCuotasVencidas({ deudasVencidas }: { deudasVencidas: number }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-rose-500/30 transition-[border-color,box-shadow] duration-300 group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <IconAlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
            Cuotas Vencidas
          </p>
          <h4 className="text-lg sm:text-xl font-black font-mono tracking-tight text-foreground truncate flex items-baseline gap-1.5">
            {deudasVencidas}
            <span className="text-xs font-normal text-muted-foreground">
              cuotas en mora
            </span>
          </h4>
        </div>
      </div>
    </div>
  );
}

function KpiCardPorValidar({ pendientesVerificacion }: { pendientesVerificacion: number }) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs transition-[border-color,box-shadow] duration-300",
        pendientesVerificacion > 0
          ? "bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/50"
          : "bg-card border-border/60 hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="size-11 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
          <IconReceipt2 className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
            Por Validar
          </p>
          <h4 className="text-lg sm:text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 truncate flex items-baseline gap-1.5">
            {pendientesVerificacion}
            <span className="text-xs font-normal text-muted-foreground">
              vouchers
            </span>
          </h4>
        </div>
      </div>

      {pendientesVerificacion > 0 && (
        <Button
          size="sm"
          onClick={handleFilterVerificacion}
          className="h-8 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1 shadow-2xs shrink-0 cursor-pointer transition-transform hover:scale-105"
        >
          <span>Revisar</span>
          <IconArrowRight className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

function MetaMensualSection({
  recaudacionMensual,
  proyeccionMensual,
  mesActual,
  totalMora,
}: {
  recaudacionMensual: number;
  proyeccionMensual: number;
  mesActual: string;
  totalMora: number;
}) {
  const percentageMonthly = proyeccionMensual > 0 ? (recaudacionMensual / proyeccionMensual) * 100 : 0;

  return (
    <div className="p-4 rounded-2xl bg-card/60 border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-2xs">
          <IconTrendingUp className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Meta del Mes de {mesActual}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold py-0.5 px-2 rounded-full border",
                  percentageMonthly >= 75
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {percentageMonthly.toFixed(1)}% Avance
              </Badge>
            </div>
            <span className="text-xs font-mono font-bold text-foreground">
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(recaudacionMensual)}
              </span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-muted-foreground">
                {formatCurrency(proyeccionMensual)}
              </span>
            </span>
          </div>

          <div className="relative h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-1000 ease-out"
              style={{ width: `${Math.min(percentageMonthly, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {totalMora > 0 && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          <IconChartBar className="size-4 text-amber-600" />
          <span className="text-xs font-semibold">
            Mora Acumulada:{" "}
            <strong className="font-mono font-bold">
              {formatCurrency(totalMora)}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

export function FinanzasDashboard({ estadisticas }: FinanzasDashboardProps) {
  const cobrado = estadisticas?.cobrado || 0;
  const pendiente = estadisticas?.pendiente || 0;
  const totalFacturado = cobrado + pendiente;
  const tasaCobro = totalFacturado > 0 ? (cobrado / totalFacturado) * 100 : 0;
  const moraRate = totalFacturado > 0 ? (pendiente / totalFacturado) * 100 : 0;
  const mesActual = new Date()
    .toLocaleString("es-PE", { month: "long", timeZone: "America/Lima" })
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCardRecaudado cobrado={cobrado} tasaCobro={tasaCobro} />
        <KpiCardPorCobrar pendiente={pendiente} moraRate={moraRate} />
        <KpiCardCuotasVencidas deudasVencidas={estadisticas?.deudasVencidas || 0} />
        <KpiCardPorValidar pendientesVerificacion={estadisticas?.pagosPendientesVerificacion || 0} />
      </div>

      <MetaMensualSection
        recaudacionMensual={estadisticas?.recaudacionMensual || 0}
        proyeccionMensual={estadisticas?.proyeccionMensual || 0}
        mesActual={mesActual}
        totalMora={estadisticas?.totalMora || 0}
      />
    </div>
  );
}
