"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface FilterChipItem {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface EvaluacionFilterChipsProps {
  chips: FilterChipItem[];
  onClearAll?: () => void;
}

export function EvaluacionFilterChips({
  chips,
  onClearAll,
}: EvaluacionFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-[11px] font-semibold text-muted-foreground mr-1">
        Filtros activos ({chips.length}):
      </span>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          variant="secondary"
          className="gap-1.5 text-xxs font-medium rounded-lg px-2.5 py-1 bg-muted/60 border border-border/40 hover:bg-muted transition-colors"
        >
          <span className="opacity-70">{chip.label}:</span>
          <span className="font-semibold text-foreground">{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="hover:text-destructive rounded-sm p-0.5 transition-colors cursor-pointer"
            aria-label={`Eliminar filtro ${chip.label}`}
          >
            <IconX className="size-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline ml-1 cursor-pointer transition-colors"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
}
