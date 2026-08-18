"use client";

import { IconCalendarMonth, IconLoader2, IconUsers, IconAlertCircle } from "@tabler/icons-react";

interface ReporteEmptyStateProps {
  type: "initial" | "empty" | "loading";
}

export function ReporteEmptyState({ type }: ReporteEmptyStateProps) {
  if (type === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-muted-foreground animate-in fade-in animation-duration-">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shadow-lg shadow-indigo-500/5">
          <IconLoader2 className="size-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Generando Reporte
          </p>
          <p className="text-xs text-muted-foreground/70">Calculando asistencias y consolidando datos...</p>
        </div>
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-8 rounded-2xl border border-dashed border-border/40 bg-card/40 backdrop-blur-md shadow-xs animate-in zoom-in-95 animation-duration-">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20 shadow-xs">
          <IconAlertCircle className="size-8 opacity-80" />
        </div>
        <h3 className="text-sm font-extrabold uppercase tracking-tight text-foreground">Sin registros encontrados</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          No se registraron asistencias para esta sección en el periodo seleccionado o la consulta no arrojó resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] text-center p-8 rounded-2xl border border-dashed border-border/40 bg-card/60 backdrop-blur-md shadow-xs animate-in fade-in animation-duration-">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
        <div className="relative size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/10">
          <IconCalendarMonth className="size-8" />
        </div>
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground">Consolidado de Asistencias</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Selecciona el nivel, grado, sección y periodo deseado para generar el reporte de asistencia mensual o individual.
        </p>
      </div>
    </div>
  );
}
