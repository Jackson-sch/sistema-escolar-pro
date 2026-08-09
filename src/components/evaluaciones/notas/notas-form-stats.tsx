"use client";

import { IconCheck, IconSearch, IconX, IconTrendingUp, IconFilter } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export type StatusFilterType = "todos" | "calificados" | "pendientes" | "aprobados" | "desaprobados";

interface NotasFormStatsProps {
  total: number;
  calificados: number;
  pendientes: number;
  promedio: number | null;
  distribucion: {
    aprobados: number;
    desaprobados: number;
  };
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
}

export function NotasFormStats({
  total,
  calificados,
  pendientes,
  promedio,
  distribucion,
  escala,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: NotasFormStatsProps) {
  const percentAprobados = total > 0 ? Math.round((distribucion.aprobados / total) * 100) : 0;
  const percentDesaprobados = total > 0 ? Math.round((distribucion.desaprobados / total) * 100) : 0;

  const filters: { id: StatusFilterType; label: string; count: number; activeBg: string; activeText: string; icon?: any }[] = [
    {
      id: "todos",
      label: "Todos",
      count: total,
      activeBg: "bg-indigo-600 text-white shadow-xs",
      activeText: "text-foreground",
    },
    {
      id: "calificados",
      label: "Calificados",
      count: calificados,
      activeBg: "bg-emerald-600 text-white shadow-xs",
      activeText: "text-emerald-600 dark:text-emerald-400",
      icon: IconCheck,
    },
    {
      id: "pendientes",
      label: "Pendientes",
      count: pendientes,
      activeBg: "bg-rose-600 text-white shadow-xs",
      activeText: "text-rose-600 dark:text-rose-400",
      icon: IconX,
    },
    {
      id: "aprobados",
      label: "Aprobados",
      count: distribucion.aprobados,
      activeBg: "bg-emerald-600 text-white shadow-xs",
      activeText: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "desaprobados",
      label: "Desaprobados",
      count: distribucion.desaprobados,
      activeBg: "bg-rose-600 text-white shadow-xs",
      activeText: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-4 w-full bg-background/40 p-4 sm:p-5 rounded-2xl border border-border/30 shadow-xs">
      <div className="flex flex-col-reverse md:flex-row gap-4 justify-between items-center">
        {/* Badges / Tabs de Filtrado Interactivo */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-semibold text-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
            <IconFilter className="size-3" /> Filtrar:
          </span>
          {filters.map((f) => {
            const isActive = statusFilter === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onStatusFilterChange(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-xl transition-[color,background-color,border-color] text-xs font-semibold border cursor-pointer select-none",
                  isActive
                    ? f.activeBg
                    : "bg-background/60 hover:bg-background border-border/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {Icon && <Icon className="size-3" />}
                <span>{f.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-md font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}

          {/* Promedio General (Si aplica) */}
          {promedio !== null && (
            <Badge
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border shadow-xs ml-auto sm:ml-2 text-xs",
                promedio >= 11
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
              )}
            >
              <IconTrendingUp className="size-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Promedio Aula:</span>
              <span className="font-bold">{promedio}</span>
            </Badge>
          )}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-[280px] group">
          <InputGroup className="rounded-xl bg-background/60 border-border/40">
            <InputGroupAddon>
              <IconSearch className="size-4 text-muted-foreground/70" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por nombre o DNI..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-xs font-medium h-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </InputGroup>
        </div>
      </div>

      {/* Barra de Distribución de Rendimiento Académico */}
      {total > 0 && (
        <div className="space-y-1.5 pt-2.5 border-t border-border/20">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Distribución de Desempeño del Aula</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {percentAprobados}% {escala === "LITERAL" ? "Logrado / Destacado" : "Aprobado (≥11)"}
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {percentDesaprobados}% {escala === "LITERAL" ? "En Inicio / Proceso" : "Sin Calificar / Bajo Promedio"}
              </span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden flex border border-border/20 shadow-inner">
            <div
              style={{ width: `${percentAprobados}%` }}
              className="h-full bg-emerald-500 transition-[width] duration-700 ease-out"
            />
            <div
              style={{ width: `${percentDesaprobados}%` }}
              className="h-full bg-rose-500/40 transition-[width,height] duration-700 ease-out"
            />
          </div>
        </div>
      )}
    </div>
  );
}
