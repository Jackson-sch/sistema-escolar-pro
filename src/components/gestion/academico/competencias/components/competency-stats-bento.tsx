"use client";

import {
  IconTarget,
  IconListCheck,
  IconBook,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";

interface CompetencyStatsBentoProps {
  totalCompetencias: number;
  totalCapacidades: number;
  totalAreas: number;
  activeNivelName?: string;
}

export function CompetencyStatsBento({
  totalCompetencias,
  totalCapacidades,
  totalAreas,
  activeNivelName = "Nivel Seleccionado",
}: CompetencyStatsBentoProps) {
  const avgCapacities =
    totalCompetencias > 0
      ? (totalCapacidades / totalCompetencias).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Competencias */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Competencias
          </span>
          <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <IconTarget className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground tracking-tight">
            {totalCompetencias}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            articuladas
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">
          Para nivel {activeNivelName}
        </p>
      </div>

      {/* 2. Capacidades */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Capacidades
          </span>
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <IconListCheck className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground tracking-tight">
            {totalCapacidades}
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            normadas
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">
          Promedio ~{avgCapacities} por competencia
        </p>
      </div>

      {/* 3. Áreas Curriculares */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Áreas Curriculares
          </span>
          <div className="size-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <IconBook className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground tracking-tight">
            {totalAreas}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            activas
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">
          Malla oficial MINEDU
        </p>
      </div>

      {/* 4. Estado Normativo */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-4 transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Marco CNEB
          </span>
          <div className="size-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <IconShieldCheck className="size-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-black text-sky-600 dark:text-sky-400 tracking-tight flex items-center gap-1.5">
            <IconSparkles className="size-4" />
            100% CNEB
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">
          Currículo Nacional vigente
        </p>
      </div>
    </div>
  );
}
