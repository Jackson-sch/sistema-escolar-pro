"use client";

import {
  IconUsers,
  IconSchool,
  IconBriefcase,
  IconUserCheck,
} from "@tabler/icons-react";

interface StaffKPIsProps {
  staffList: any[];
}

export function StaffKPIs({ staffList = [] }: StaffKPIsProps) {
  const total = staffList.length;
  const docentes = staffList.filter((s) => s.role === "profesor").length;
  const administrativos = staffList.filter(
    (s) => s.role !== "profesor",
  ).length;
  const activos = staffList.filter(
    (s) => s.estado?.nombre?.toLowerCase() === "activo",
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: Total Personal */}
      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Colaboradores
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-0.5">
            {total}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Registrados en el sistema
          </p>
        </div>
        <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
          <IconUsers className="size-5" />
        </div>
      </div>

      {/* KPI 2: Planta Docente */}
      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Planta Docente
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-violet-600 dark:text-violet-400 mt-0.5">
            {docentes}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Profesores y tutores
          </p>
        </div>
        <div className="size-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20 shadow-2xs">
          <IconSchool className="size-5" />
        </div>
      </div>

      {/* KPI 3: Administrativos & Apoyo */}
      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Administrativos
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {administrativos}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Gestión, directivos y apoyo
          </p>
        </div>
        <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-2xs">
          <IconBriefcase className="size-5" />
        </div>
      </div>

      {/* KPI 4: Personal Activo */}
      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Personal Activo
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {activos}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            {total > 0 ? `${Math.round((activos / total) * 100)}% de operatividad` : "Sin bajas"}
          </p>
        </div>
        <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
          <IconUserCheck className="size-5" />
        </div>
      </div>
    </div>
  );
}
