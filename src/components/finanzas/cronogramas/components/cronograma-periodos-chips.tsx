"use client";

import React from "react";
import { IconCalendarEvent } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const CURRENT_MONTH = new Date().getMonth() + 1;

export const PERIODOS_MESES = [
  { id: "all", short: "Todos los meses" },
  { id: "matricula", short: "Matrícula" },
  { id: "3", short: "Mar" },
  { id: "4", short: "Abr" },
  { id: "5", short: "May" },
  { id: "6", short: "Jun" },
  { id: "7", short: "Jul" },
  { id: "8", short: "Ago" },
  { id: "9", short: "Set" },
  { id: "10", short: "Oct" },
  { id: "11", short: "Nov" },
  { id: "12", short: "Dic" },
];

interface CronogramaPeriodosChipsProps {
  mesFilter: string;
  onSelectMes: (mes: string) => void;
}

export function CronogramaPeriodosChips({
  mesFilter,
  onSelectMes,
}: CronogramaPeriodosChipsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 border-t border-border/30 pt-2.5">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 shrink-0 mr-1.5 select-none">
        <IconCalendarEvent className="size-3.5" />
        <span>Periodo:</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {PERIODOS_MESES.map((p) => {
          const isActive = mesFilter === p.id;
          const isCurrent = p.id === String(CURRENT_MONTH);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectMes(p.id)}
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs font-extrabold"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40",
              )}
            >
              <span>{p.short}</span>
              {isCurrent && (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isActive ? "bg-white" : "bg-amber-500 animate-pulse",
                  )}
                  title="Mes en curso"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
