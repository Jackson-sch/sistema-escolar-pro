"use client";

import { IconSchool, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-2.5 rounded-xl bg-muted/40 border border-border/50 min-w-[80px]">
      <span
        className={cn(
          "text-xl font-black tabular-nums leading-none",
          accent ?? "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
        {label}
      </span>
    </div>
  );
}

interface PoliticasHeaderProps {
  anioAcademico: number;
  isLoading: boolean;
  politicasCount: number;
  activasCount: number;
  toleranciaPromedio: number;
  onOpenNewDialog: () => void;
}

export function PoliticasHeader({
  anioAcademico,
  isLoading,
  politicasCount,
  activasCount,
  toleranciaPromedio,
  onOpenNewDialog,
}: PoliticasHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-2">
          <IconSchool className="size-3.5" />
          <span>Ciclo Lectivo {anioAcademico}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Reglas de Ingreso
        </h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Horarios y tolerancias por nivel educativo para el ciclo {anioAcademico}.
        </p>
      </div>

      <div className="flex items-end gap-3">
        {!isLoading && politicasCount > 0 && (
          <div className="flex items-center gap-2">
            <StatPill label="Total" value={politicasCount} />
            <StatPill
              label="Activas"
              value={activasCount}
              accent="text-emerald-600 dark:text-emerald-400"
            />
            <StatPill
              label="Tolerancia"
              value={`${toleranciaPromedio}m`}
              accent="text-amber-600 dark:text-amber-400"
            />
          </div>
        )}

        <Button
          onClick={onOpenNewDialog}
          className="h-10 px-4 rounded-xl font-bold text-sm gap-2 shrink-0 cursor-pointer"
        >
          <IconPlus className="size-4" />
          Nueva Regla
        </Button>
      </div>
    </div>
  );
}
