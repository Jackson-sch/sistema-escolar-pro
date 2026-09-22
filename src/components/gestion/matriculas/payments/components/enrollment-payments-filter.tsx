"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PaymentFilterType = "todos" | "pendientes" | "pagados";

interface EnrollmentPaymentsFilterProps {
  currentFilter: PaymentFilterType;
  onFilterChange: (filter: PaymentFilterType) => void;
  counts: {
    todos: number;
    pendientes: number;
    pagados: number;
  };
}

export function EnrollmentPaymentsFilter({
  currentFilter,
  onFilterChange,
  counts,
}: EnrollmentPaymentsFilterProps) {
  const tabs: { id: PaymentFilterType; label: string; count: number }[] = [
    { id: "todos", label: "Todas las Cuotas", count: counts.todos },
    { id: "pendientes", label: "Por Cobrar", count: counts.pendientes },
    { id: "pagados", label: "Pagadas", count: counts.pagados },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/40">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              isActive
                ? "bg-background text-foreground shadow-2xs border border-border/40"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "font-mono text-[10px] px-1.5 py-0.2 rounded-full",
                isActive
                  ? "bg-primary/10 text-primary font-black"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
