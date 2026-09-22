"use client";

import {
  IconSchool,
  IconUsers,
  IconUserPlus,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StudentStatsProps {
  stats: {
    totalStudents: number;
    activeEnrollments: number;
    newEnrollments: number;
    currentYear: number;
  };
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function StudentStats({
  stats,
  activeFilter = "ALL",
  onFilterChange,
}: StudentStatsProps) {
  const total = stats.totalStudents || 0;
  const active = stats.activeEnrollments || 0;
  const unEnrolled = Math.max(0, total - active);
  const coverageRate = total > 0 ? Math.round((active / total) * 100) : 0;

  const cards = [
    {
      id: "ALL",
      title: "Padrón Total",
      value: total,
      subtitle: `${total} alumnos registrados`,
      badge: "Base Completa",
      icon: IconUsers,
      color: "indigo",
      bgClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      activeRing: "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/5",
    },
    {
      id: "MATRICULADO",
      title: `Matrícula Activa ${stats.currentYear}`,
      value: active,
      subtitle: `${coverageRate}% cobertura escolar`,
      badge: `${coverageRate}% Al Día`,
      icon: IconSchool,
      color: "emerald",
      bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      activeRing: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5",
    },
    {
      id: "SIN_MATRICULA",
      title: "Sin Matrícula 2026",
      value: unEnrolled,
      subtitle: unEnrolled === 0 ? "100% formalizados" : "Pendientes de rematrícula",
      badge: unEnrolled > 0 ? "Por Formalizar" : "Excelente",
      icon: IconAlertCircle,
      color: unEnrolled > 0 ? "amber" : "slate",
      bgClass: unEnrolled > 0
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-muted/30 text-muted-foreground border-border/40",
      activeRing: "ring-2 ring-amber-500 border-amber-500 bg-amber-500/5",
    },
    {
      id: "NUEVO",
      title: `Nuevos Ingresos ${stats.currentYear}`,
      value: stats.newEnrollments,
      subtitle: "Primera vez en la institución",
      badge: "Ingresantes",
      icon: IconUserPlus,
      color: "sky",
      bgClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      activeRing: "ring-2 ring-sky-500 border-sky-500 bg-sky-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;
        const Icon = card.icon;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange?.(card.id)}
            className={cn(
              "p-3.5 rounded-2xl bg-card border border-border/60 shadow-2xs flex items-center justify-between text-left transition-all duration-200 cursor-pointer relative overflow-hidden group",
              "hover:border-primary/40 hover:shadow-xs",
              isSelected && card.activeRing
            )}
          >
            <div className="space-y-0.5 min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  {card.title}
                </span>
                {isSelected && (
                  <span className="inline-flex items-center size-3.5 rounded-full bg-primary text-primary-foreground">
                    <IconCheck className="size-2.5 mx-auto" />
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold font-mono text-foreground leading-tight">
                {card.value}
              </h3>
              <p className="text-[11px] text-muted-foreground/80 font-medium truncate">
                {card.subtitle}
              </p>
            </div>

            <div
              className={cn(
                "size-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                card.bgClass
              )}
            >
              <Icon className="size-5" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
