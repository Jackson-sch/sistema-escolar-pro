"use client";

import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AsistenciaFilterToolbarProps {
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  totalAlumnos: number;
  ausentesCount: number;
  tardanzasCount: number;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export function AsistenciaFilterToolbar({
  filterStatus,
  onFilterStatusChange,
  totalAlumnos,
  ausentesCount,
  tardanzasCount,
  searchTerm,
  onSearchTermChange,
}: AsistenciaFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 bg-card/80 border border-border/60 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => onFilterStatusChange("todos")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            filterStatus === "todos"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Todos ({totalAlumnos})
        </button>
        <button
          type="button"
          onClick={() => onFilterStatusChange("ausentes")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
            filterStatus === "ausentes"
              ? "bg-rose-600 text-white shadow-2xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Faltas ({ausentesCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterStatusChange("tardanzas")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
            filterStatus === "tardanzas"
              ? "bg-amber-600 text-white shadow-2xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Tardes ({tardanzasCount})
        </button>
      </div>

      <div className="relative flex-1 sm:max-w-xs">
        <IconSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Buscar estudiante por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="h-9 pl-9 pr-3 rounded-xl text-xs bg-card border-border/60"
        />
      </div>
    </div>
  );
}
