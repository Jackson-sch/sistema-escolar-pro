"use client";

import {
  IconUserCheck,
  IconUserExclamation,
  IconUserMinus,
  IconClock,
} from "@tabler/icons-react";

interface AttendanceMetricsProps {
  stats: {
    total: number;
    presentes: number;
    faltas: number;
    tardanzas: number;
    justificadas: number;
  };
}

export function AttendanceMetrics({ stats }: AttendanceMetricsProps) {
  const items = [
    {
      label: "Asistencias A Tiempo",
      value: stats.presentes,
      sub: "Días con ingreso puntual",
      icon: IconUserCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Tardanzas Registradas",
      value: stats.tardanzas,
      sub: "Ingresos fuera de horario",
      icon: IconClock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Inasistencias Libres",
      value: stats.faltas,
      sub: "Faltas no justificadas",
      icon: IconUserMinus,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "Faltas Justificadas",
      value: stats.justificadas,
      sub: "Con permiso formal",
      icon: IconUserExclamation,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {items.map((item) => (
        <div
          key={item.label}
          className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
            <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{item.value}</h3>
            <p className="text-[11px] text-muted-foreground/80 mt-1">{item.sub}</p>
          </div>
          <div className={`size-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${item.bg} ${item.color}`}>
            <item.icon className="size-5" />
          </div>
        </div>
      ))}
    </div>
  );
}
