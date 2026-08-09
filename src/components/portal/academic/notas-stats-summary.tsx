"use client";

import { cn } from "@/lib/utils";
import {
  IconTrophy,
  IconPercentage,
  IconChartBar,
} from "@tabler/icons-react";

interface StatsSummaryProps {
  promedio: number;
  asistencia: number;
  ranking: string;
}

export function NotasStatsSummary({
  promedio,
  asistencia,
  ranking,
}: StatsSummaryProps) {
  const stats = [
    {
      label: "Promedio General",
      value: `${promedio.toFixed(1)}/20`,
      sub: "Escala vigesimal acumulada",
      icon: IconChartBar,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Asistencia Efectiva",
      value: `${asistencia}%`,
      sub: "Presencia en aulas",
      icon: IconPercentage,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Mérito Académico",
      value: ranking,
      sub: "Posición en la sección",
      icon: IconTrophy,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{stat.value}</h3>
            <p className="text-[11px] text-muted-foreground/80 mt-1">{stat.sub}</p>
          </div>
          <div className={cn("size-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs", stat.bg, stat.color)}>
            <stat.icon className="size-5" />
          </div>
        </div>
      ))}
    </div>
  );
}
