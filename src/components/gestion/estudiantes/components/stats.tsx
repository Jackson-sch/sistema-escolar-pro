"use client";

import { IconSchool, IconUsers, IconUserPlus, IconChartPie } from "@tabler/icons-react";

interface StudentStatsProps {
  stats: {
    totalStudents: number;
    activeEnrollments: number;
    newEnrollments: number;
    currentYear: number;
  };
}

export default function StudentStats({ stats }: StudentStatsProps) {
  const total = stats.totalStudents || 0;
  const active = stats.activeEnrollments || 0;
  const coverageRate = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* KPI 1: Padrón Total */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Padrón Registrado</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{stats.totalStudents}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Alumnos en base de datos</p>
        </div>
        <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <IconUsers className="size-5" />
        </div>
      </div>

      {/* KPI 2: Matrícula Activa */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Matrícula Activa {stats.currentYear}</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{stats.activeEnrollments}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Formalizados en el ciclo</p>
        </div>
        <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <IconSchool className="size-5" />
        </div>
      </div>

      {/* KPI 3: Nuevos Ingresos */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nuevos Alumnos {stats.currentYear}</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{stats.newEnrollments}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Primera matriculación</p>
        </div>
        <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <IconUserPlus className="size-5" />
        </div>
      </div>

      {/* KPI 4: Cobertura de Matrícula */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cobertura Activa</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{coverageRate}%</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Ratio de alumnos activos</p>
        </div>
        <div className="size-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
          <IconChartPie className="size-5" />
        </div>
      </div>
    </div>
  );
}
