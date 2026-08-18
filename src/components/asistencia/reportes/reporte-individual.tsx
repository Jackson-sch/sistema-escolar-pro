"use client";

import {
  IconCalendar,
  IconLoader2,
  IconUser,
  IconTrendingUp,
  IconUserCheck,
  IconUserX,
  IconClockHour4,
  IconFileCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MESES_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReporteIndividualProps {
  data: any[];
  estudianteNombre: string;
  isPending: boolean;
}

export function ReporteIndividual({ data, estudianteNombre, isPending }: ReporteIndividualProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground animate-in fade-in animation-duration-">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shadow-lg shadow-indigo-500/5">
          <IconLoader2 className="size-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Cargando Historial Individual
          </p>
          <p className="text-xs text-muted-foreground/70">Recuperando registros y estadísticas anuales...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/40 bg-card/40 backdrop-blur-md shadow-xs animate-in zoom-in-95 animation-duration-">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
          <div className="relative size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <IconUser className="size-8" />
          </div>
        </div>
        <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground">Seleccionar Estudiante</h3>
        <p className="max-w-sm text-center text-xs text-muted-foreground leading-relaxed mt-1">
          Por favor selecciona un estudiante del selector superior para visualizar su historial consolidado de asistencia.
        </p>
      </div>
    );
  }

  const totales = data.reduce(
    (acc, curr) => ({
      P: acc.P + curr.presentes,
      F: acc.F + curr.ausentes,
      T: acc.T + curr.tardanzas,
      J: acc.J + curr.justificadas,
    }),
    { P: 0, F: 0, T: 0, J: 0 },
  );

  const totalDiasEvaluados = totales.P + totales.F + totales.T + totales.J;
  const tasaGlobal =
    totalDiasEvaluados > 0
      ? ((totales.P + totales.T + totales.J) / totalDiasEvaluados) * 100
      : 0;

  const initials = estudianteNombre
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const getPercent = (val: number) =>
    totalDiasEvaluados > 0 ? ((val / totalDiasEvaluados) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      {/* Banner de Perfil de Estudiante */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-900/80 p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 size-[300px] rounded-full bg-indigo-500/15 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-2xl border-2 border-indigo-400/30 shadow-md">
              <AvatarFallback className="bg-indigo-600/50 text-white font-black text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider gap-1">
                  <IconSparkles className="size-3" />
                  Perfil de Asistencia Individual
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
                {estudianteNombre}
              </h3>
              <p className="text-xs text-indigo-200/80 font-medium">
                {totalDiasEvaluados} Días Lectivos Monitoreados en el Periodo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/70">
                Índice Global
              </span>
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {tasaGlobal.toFixed(1)}%
              </div>
            </div>
            <Badge
              className={cn(
                "rounded-xl px-2.5 py-1 font-bold text-xs uppercase border-0 shadow-sm",
                tasaGlobal >= 90
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : tasaGlobal >= 75
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30",
              )}
            >
              {tasaGlobal >= 90 ? "Óptimo" : tasaGlobal >= 75 ? "Regular" : "Atención"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Grid de 4 KPI Cards Ejecutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Asistencias Puntuales */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/[0.04] to-emerald-500/[0.08] p-5 shadow-xs hover:border-emerald-500/40 transition-all duration-200 space-y-4">
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
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/[0.04] to-rose-500/[0.08] p-5 shadow-xs hover:border-rose-500/40 transition-all duration-200 space-y-4">
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
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/[0.04] to-amber-500/[0.08] p-5 shadow-xs hover:border-amber-500/40 transition-all duration-200 space-y-4">
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
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-linear-to-br from-sky-500/[0.04] to-sky-500/[0.08] p-5 shadow-xs hover:border-sky-500/40 transition-all duration-200 space-y-4">
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

      {/* Tabla de Evolución Cronológica */}
      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden shadow-lg shadow-indigo-500/5">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <IconTrendingUp className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Evolución por Periodos Mensuales
              </h3>
              <p className="text-[10px] text-muted-foreground">Tasa de puntualidad e inasistencias desglosada</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Mes
                </TableHead>
                <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Pres.
                </TableHead>
                <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                  Falt.
                </TableHead>
                <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Tard.
                </TableHead>
                <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  Just.
                </TableHead>
                <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Tasa de Asistencia
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((mesData) => {
                const totalDias =
                  mesData.presentes +
                  mesData.ausentes +
                  mesData.tardanzas +
                  mesData.justificadas;
                const tasa =
                  totalDias > 0
                    ? ((mesData.presentes + mesData.tardanzas + mesData.justificadas) /
                        totalDias) *
                      100
                    : 0;

                return (
                  <TableRow
                    key={mesData.mes}
                    className="group border-b border-border/20 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="py-3 px-5 font-bold text-xs uppercase text-foreground">
                      {MESES_OPTIONS[mesData.mes]?.nombre || `Mes ${mesData.mes}`}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {mesData.presentes}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                      {mesData.ausentes}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                      {mesData.tardanzas}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                      {mesData.justificadas}
                    </TableCell>
                    <TableCell className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-2 bg-muted/60 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              tasa >= 90
                                ? "bg-emerald-500"
                                : tasa >= 75
                                  ? "bg-amber-500"
                                  : "bg-rose-500",
                            )}
                            style={{ width: `${tasa}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-mono font-bold w-12 text-right",
                            tasa >= 90
                              ? "text-emerald-600 dark:text-emerald-400"
                              : tasa >= 75
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-rose-600 dark:text-rose-400",
                          )}
                        >
                          {tasa.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
