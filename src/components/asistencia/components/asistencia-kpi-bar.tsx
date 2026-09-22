"use client";

import { IconCheck, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AsistenciaKpiBarProps {
  totalAlumnos: number;
  attendanceRate: number;
  presentesCount: number;
  tardanzasCount: number;
  ausentesCount: number;
  onMarkAllPresent: () => void;
  viewMode: "pad" | "table";
  onViewModeChange: (mode: "pad" | "table") => void;
}

export function AsistenciaKpiBar({
  totalAlumnos,
  attendanceRate,
  presentesCount,
  tardanzasCount,
  ausentesCount,
  onMarkAllPresent,
  viewMode,
  onViewModeChange,
}: AsistenciaKpiBarProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* KPIs de Asistencia en Tiempo Real */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-2xl">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/40">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {totalAlumnos}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Total
              </p>
              <p className="text-xs font-extrabold text-foreground">
                {attendanceRate}% Asist.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              {presentesCount}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                Presentes
              </p>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                Puntuales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="size-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              {tardanzasCount}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                Tardanzas
              </p>
              <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                Con retraso
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="size-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
              {ausentesCount}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">
                Faltas
              </p>
              <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                Inasistentes
              </p>
            </div>
          </div>
        </div>

        {/* Botón Maestro: "Marcar Todos Presentes" + View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onMarkAllPresent}
            className="rounded-xl h-9.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer gap-2"
          >
            <IconCheck size={16} />
            <span>Marcar Todos Presentes</span>
            <Badge className="bg-emerald-700/60 text-white text-[9px] px-1.5 py-0 border-none font-mono">
              Alt + P
            </Badge>
          </Button>

          {/* Alternador de Modo de Vista */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewModeChange("pad")}
              className={cn(
                "size-7.5 rounded-lg cursor-pointer",
                viewMode === "pad" &&
                  "bg-background text-foreground shadow-2xs",
              )}
              title="Modo Pad Táctil (Tarjetas)"
            >
              <IconLayoutGrid size={15} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "size-7.5 rounded-lg cursor-pointer",
                viewMode === "table" &&
                  "bg-background text-foreground shadow-2xs",
              )}
              title="Modo Lista Compacta"
            >
              <IconList size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
