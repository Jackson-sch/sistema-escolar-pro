"use client";

import { IconSchool, IconCalendarCheck, IconCertificate, IconChartPie } from "@tabler/icons-react";

export default function Stats({ stats }: { stats: any }) {
  const safeStats = stats || {
    metas: 0,
    matriculadosHoy: 0,
    situacionRegular: 0,
    totalCapacity: 0,
    totalEnrollments: 0,
    anioAcademico: new Date().getFullYear(),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* KPI 1: Total Matrículas */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Matrículas {safeStats.anioAcademico}</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{safeStats.totalEnrollments}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Inscripciones formalizadas</p>
        </div>
        <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <IconSchool className="size-5" />
        </div>
      </div>

      {/* KPI 2: Matriculados Hoy */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Matriculados Hoy</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{safeStats.matriculadosHoy}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Procesados en el día</p>
        </div>
        <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <IconCalendarCheck className="size-5" />
        </div>
      </div>

      {/* KPI 3: Ocupación de Vacantes */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ocupación de Vacantes</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{safeStats.metas}%</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">{safeStats.totalEnrollments} de {safeStats.totalCapacity} aforo</p>
        </div>
        <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <IconChartPie className="size-5" />
        </div>
      </div>

      {/* KPI 4: Situación Regular */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Alumnos Regulares</span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{safeStats.situacionRegular}</h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">Sin condición de repitencia</p>
        </div>
        <div className="size-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
          <IconCertificate className="size-5" />
        </div>
      </div>
    </div>
  );
}
