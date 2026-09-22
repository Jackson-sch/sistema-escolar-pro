"use client";

import * as React from "react";
import { IconAlertTriangle, IconCheck, IconClock } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

interface EnrollmentPaymentsSummaryProps {
  totalCobrado: number;
  totalPorCobrar: number;
  totalDeudaVencida: number;
  cuotasVencidasCount: number;
}

export function EnrollmentPaymentsSummary({
  totalCobrado,
  totalPorCobrar,
  totalDeudaVencida,
  cuotasVencidasCount,
}: EnrollmentPaymentsSummaryProps) {
  const totalPresupuesto = totalCobrado + totalPorCobrar;
  const porcentajePagado =
    totalPresupuesto > 0
      ? Math.min(100, Math.round((totalCobrado / totalPresupuesto) * 100))
      : 0;

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/60 shadow-2xs">
      {/* Barra de progreso de recaudación */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            Cumplimiento Financiero Anual
          </span>
          <span className="font-mono font-black text-xs text-primary">
            {porcentajePagado}% pagado
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/70 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${porcentajePagado}%` }}
          />
        </div>
      </div>

      {/* 3 Micro-Tarjetas Bento */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {/* Total Pagado */}
        <div className="flex flex-col p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            <IconCheck className="size-3 text-emerald-600" />
            <span>Pagado</span>
          </div>
          <span className="text-sm font-extrabold text-foreground tabular-nums mt-0.5">
            {formatCurrency(totalCobrado)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {porcentajePagado}% del periodo
          </span>
        </div>

        {/* Saldo Pendiente */}
        <div className="flex flex-col p-2.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <IconClock className="size-3 text-primary" />
            <span>Por Cobrar</span>
          </div>
          <span className="text-sm font-extrabold text-foreground tabular-nums mt-0.5">
            {formatCurrency(totalPorCobrar)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            En cronograma
          </span>
        </div>

        {/* Vencido / Mora */}
        <div
          className={cn(
            "flex flex-col p-2.5 rounded-xl border transition-colors",
            cuotasVencidasCount > 0
              ? "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
              : "bg-muted/40 border-border/50 text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
            <IconAlertTriangle
              className={cn(
                "size-3",
                cuotasVencidasCount > 0 ? "text-rose-500" : "text-emerald-500",
              )}
            />
            <span>{cuotasVencidasCount > 0 ? "Vencido" : "Sin Mora"}</span>
          </div>
          <span className="text-sm font-extrabold text-foreground tabular-nums mt-0.5">
            {formatCurrency(totalDeudaVencida)}
          </span>
          <span className="text-[10px] mt-0.5">
            {cuotasVencidasCount > 0
              ? `${cuotasVencidasCount} cuota${cuotasVencidasCount > 1 ? "s" : ""}`
              : "Al día ✓"}
          </span>
        </div>
      </div>
    </div>
  );
}
