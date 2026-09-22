"use client";

import { IconLayoutGrid, type Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MODULE_THEMES } from "./permisos-types";

export interface ModuloTabInfo {
  id: string; // "all" o nombre del módulo
  nombre: string;
  totalCount: number;
  activeCount: number;
}

interface ModulosTabsFilterProps {
  modulos: ModuloTabInfo[];
  selectedModulo: string;
  onSelectModulo: (moduloId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ModulosTabsFilter({
  modulos,
  selectedModulo,
  onSelectModulo,
  searchQuery,
  onSearchChange,
}: ModulosTabsFilterProps) {
  return (
    <div className="w-full min-w-0">
      {/* Pastillas adaptables con flex-wrap para que se ajusten siempre al ancho de la pantalla */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 py-0.5">
        {modulos.map((mod) => {
          const isSelected = selectedModulo === mod.id;
          const isAll = mod.id === "all";
          const theme = !isAll ? MODULE_THEMES[mod.nombre] : null;
          const ModIcon: Icon = isAll ? IconLayoutGrid : theme?.icon || IconLayoutGrid;

          const isFullyActive = mod.totalCount > 0 && mod.activeCount === mod.totalCount;
          const isPartiallyActive = mod.activeCount > 0 && mod.activeCount < mod.totalCount;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                onSelectModulo(mod.id);
                if (searchQuery) onSearchChange("");
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/20 scale-[1.02]"
                  : "bg-card hover:bg-muted/70 text-muted-foreground hover:text-foreground border-border/60"
              )}
            >
              <ModIcon
                size={14}
                className={cn(
                  "shrink-0 transition-colors",
                  isSelected
                    ? "text-primary-foreground"
                    : theme?.accent || "text-muted-foreground"
                )}
              />

              <span>{mod.nombre}</span>

              {/* Badge Contador de Permisos */}
              <Badge
                variant="outline"
                className={cn(
                  "ml-0.5 px-1.5 py-0 text-[10px] font-mono font-bold rounded-md border",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                    : isFullyActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : isPartiallyActive
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-muted text-muted-foreground/70 border-border/40"
                )}
              >
                {mod.activeCount}/{mod.totalCount}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
