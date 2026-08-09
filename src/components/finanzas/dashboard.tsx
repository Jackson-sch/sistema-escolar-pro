"use client";

import {
  IconCash,
  IconClock,
  IconAlertTriangle,
  IconReceipt2,
  IconTrendingUp,
  IconChartBar,
  IconArrowRight,
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

export function FinanzasDashboard({ estadisticas }: FinanzasDashboardProps) {
  const percentageMonthly =
    estadisticas?.proyeccionMensual && estadisticas.proyeccionMensual > 0
      ? (estadisticas.recaudacionMensual / estadisticas.proyeccionMensual) * 100
      : 0;

  const totalFacturado = (estadisticas?.cobrado || 0) + (estadisticas?.pendiente || 0);
  const moraRate = totalFacturado > 0 ? ((estadisticas?.pendiente || 0) / totalFacturado) * 100 : 0;

  const handleFilterVerificacion = () => {
    window.location.href = "/finanzas/verificacion";
  };

  const mesActual = new Date()
    .toLocaleString("es-PE", { month: "long", timeZone: "America/Lima" })
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3 animate-in fade-in animation-duration-">
      {/* ── BARRA ULTRA-COMPACTA DE KPIS CLAVE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Cobrado */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IconCash className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                Resumen Cobrado
              </p>
              <h4 className="text-base sm:text-lg font-bold font-mono text-foreground truncate">
                {formatCurrency(estadisticas?.cobrado || 0)}
              </h4>
            </div>
          </div>
        </div>

        {/* KPI 2: Por Cobrar */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <IconClock className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  Por Cobrar
                </p>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  ({moraRate.toFixed(1)}% mora)
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-mono text-foreground truncate">
                {formatCurrency(estadisticas?.pendiente || 0)}
              </h4>
            </div>
          </div>
        </div>

        {/* KPI 3: Deudas Vencidas */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <IconAlertTriangle className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                Cuotas Vencidas
              </p>
              <h4 className="text-base sm:text-lg font-bold font-mono text-foreground truncate">
                {estadisticas?.deudasVencidas || 0} <span className="text-xs font-normal text-muted-foreground">cuotas</span>
              </h4>
            </div>
          </div>
        </div>

        {/* KPI 4: Por Verificar (Vouchers) */}
        <div className={cn(
          "p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs transition-[background-color,border-color,box-shadow,backdrop-filter,padding,gap]",
          (estadisticas?.pagosPendientesVerificacion || 0) > 0
            ? "bg-indigo-500/10 border-indigo-500/30"
            : "bg-card/80 border-border/50"
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <IconReceipt2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                Por Verificar
              </p>
              <h4 className="text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 truncate">
                {estadisticas?.pagosPendientesVerificacion || 0} <span className="text-xs font-normal text-muted-foreground">vouchers</span>
              </h4>
            </div>
          </div>

          {(estadisticas?.pagosPendientesVerificacion || 0) > 0 && (
            <Button
              size="sm"
              onClick={handleFilterVerificacion}
              className="h-8 px-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1 shadow-xs shrink-0 cursor-pointer"
            >
              <span>Revisar</span>
              <IconArrowRight className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* ── COMPACT RECAUDACIÓN MES & MORA BAR ── */}
      <div className="p-3.5 rounded-2xl bg-background/40 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-xs">
        {/* Lado Izquierdo: Meta del Mes */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <IconTrendingUp className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Meta de Recaudación ({mesActual})
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold py-0 px-1.5 rounded-md border-indigo-500/30 text-indigo-600 bg-indigo-500/10">
                  {percentageMonthly.toFixed(1)}% Avance
                </Badge>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(estadisticas?.recaudacionMensual || 0)} / {formatCurrency(estadisticas?.proyeccionMensual || 0)}
              </span>
            </div>

            {/* Barra Delgada de Progreso */}
            <div className="relative h-2 w-full bg-muted/40 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-[width] duration-1000 ease-out"
                style={{ width: `${Math.min(percentageMonthly, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lado Derecho: Mora Acumulada Resumen */}
        {(estadisticas?.totalMora || 0) > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
            <IconChartBar className="size-4 text-amber-600" />
            <span className="text-xs font-semibold">
              Mora Acumulada: <strong className="font-mono">{formatCurrency(estadisticas?.totalMora || 0)}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
