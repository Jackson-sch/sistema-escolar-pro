"use client";

import {
  IconUserCheck,
  IconUserX,
  IconClockHour4,
  IconFileCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TotalesData {
  P: number;
  F: number;
  T: number;
  J: number;
}

interface IndividualKpiCardsProps {
  totales: TotalesData;
  totalDiasEvaluados: number;
  getPercent: (val: number) => string;
}

export function IndividualKpiCards({
  totales,
  totalDiasEvaluados,
  getPercent,
}: IndividualKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Asistencias Puntuales */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/[0.04] to-emerald-500/[0.08] p-5 shadow-xs hover:border-emerald-500/40 transition-[border-color,box-shadow] duration-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <IconUserCheck className="size-5" />
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Puntual
          </Badge>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
            Asistencias Puntuales
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {totales.P}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              ({getPercent(totales.P)}%)
            </span>
          </div>
        </div>

        <Progress
          value={totalDiasEvaluados > 0 ? (totales.P / totalDiasEvaluados) * 100 : 0}
          className="h-1.5 bg-emerald-500/15"
          indicatorClassName="bg-emerald-500"
        />
      </div>

      {/* Card 2: Inasistencias */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/[0.04] to-rose-500/[0.08] p-5 shadow-xs hover:border-rose-500/40 transition-[border-color,box-shadow] duration-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="size-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <IconUserX className="size-5" />
          </div>
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Faltas
          </Badge>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
            Inasistencias
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
              {totales.F}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              ({getPercent(totales.F)}%)
            </span>
          </div>
        </div>

        <Progress
          value={totalDiasEvaluados > 0 ? (totales.F / totalDiasEvaluados) * 100 : 0}
          className="h-1.5 bg-rose-500/15"
          indicatorClassName="bg-rose-500"
        />
      </div>

      {/* Card 3: Tardanzas */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/[0.04] to-amber-500/[0.08] p-5 shadow-xs hover:border-amber-500/40 transition-[border-color,box-shadow] duration-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <IconClockHour4 className="size-5" />
          </div>
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Tardanzas
          </Badge>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
            Atrasos Registrados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              {totales.T}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              ({getPercent(totales.T)}%)
            </span>
          </div>
        </div>

        <Progress
          value={totalDiasEvaluados > 0 ? (totales.T / totalDiasEvaluados) * 100 : 0}
          className="h-1.5 bg-amber-500/15"
          indicatorClassName="bg-amber-500"
        />
      </div>

      {/* Card 4: Justificadas */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-linear-to-br from-sky-500/[0.04] to-sky-500/[0.08] p-5 shadow-xs hover:border-sky-500/40 transition-[border-color,box-shadow] duration-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="size-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
            <IconFileCheck className="size-5" />
          </div>
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Permisos
          </Badge>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
            Inasistencias Justificadas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-sky-600 dark:text-sky-400 tracking-tight">
              {totales.J}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              ({getPercent(totales.J)}%)
            </span>
          </div>
        </div>

        <Progress
          value={totalDiasEvaluados > 0 ? (totales.J / totalDiasEvaluados) * 100 : 0}
          className="h-1.5 bg-sky-500/15"
          indicatorClassName="bg-sky-500"
        />
      </div>
    </div>
  );
}
