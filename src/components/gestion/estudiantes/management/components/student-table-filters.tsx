"use client";

import {
  IconFilter,
  IconSchool,
  IconBooks,
  IconX,
  IconList,
  IconLayoutGrid,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadPadronButton } from "@/components/gestion/estudiantes/components/download-padron-button";
import { BatchCardsButton } from "@/components/gestion/estudiantes/components/batch-cards-button";
import { ImportStudentsDialog } from "@/components/gestion/estudiantes/import";
import { StudentKeyboardLegend } from "@/components/gestion/estudiantes/components/student-keyboard-legend";
import { cn } from "@/lib/utils";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";

interface StudentTableFiltersProps {
  nivelFilter: string;
  onNivelChange: (val: string) => void;
  availableNiveles: string[];
  gradoFilter: string;
  onGradoChange: (val: string) => void;
  availableGrados: string[];
  estadoFilter: string;
  onEstadoChange: (val: string) => void;
  uniqueEstados: Array<{ id: string; nombre: string }>;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClearFilters: () => void;
  showPadronExport?: boolean;
  filteredData: StudentTableType[];
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  nivelesAcademicos?: any[];
}

const DEFAULT_NIVELES_ACADEMICOS: any[] = [];

export function StudentTableFilters({
  nivelFilter,
  onNivelChange,
  availableNiveles,
  gradoFilter,
  onGradoChange,
  availableGrados,
  estadoFilter,
  onEstadoChange,
  uniqueEstados,
  hasActiveFilters,
  activeFilterCount,
  onClearFilters,
  showPadronExport,
  filteredData,
  viewMode,
  onViewModeChange,
  nivelesAcademicos = DEFAULT_NIVELES_ACADEMICOS,
}: StudentTableFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2 bg-card/60 border border-border/60 rounded-2xl">
      {/* Controles de Filtros en Cascada */}
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {/* Estado */}
        <Select value={estadoFilter} onValueChange={onEstadoChange}>
          <SelectTrigger
            className={cn(
              "h-9 min-w-[130px] max-w-[160px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-1.5 shadow-2xs cursor-pointer",
              estadoFilter !== "ALL" &&
                "border-primary/50 bg-primary/5 text-primary font-extrabold",
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <IconFilter
                className={cn(
                  "size-3.5 shrink-0 opacity-60",
                  estadoFilter !== "ALL" && "text-primary opacity-100",
                )}
              />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent
            align="start"
            className="border-border/60 rounded-xl bg-popover p-1 shadow-lg"
          >
            <SelectItem value="ALL" className="font-semibold text-xs">
              Todos los estados
            </SelectItem>
            {uniqueEstados.map((estado) => (
              <SelectItem
                key={estado.id}
                value={estado.nombre}
                className="text-xs font-medium"
              >
                {estado.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Nivel */}
        <Select value={nivelFilter} onValueChange={onNivelChange}>
          <SelectTrigger
            className={cn(
              "h-9 min-w-[130px] max-w-[160px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-1.5 shadow-2xs cursor-pointer",
              nivelFilter !== "ALL" &&
                "border-primary/50 bg-primary/5 text-primary font-extrabold",
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <IconSchool
                className={cn(
                  "size-3.5 shrink-0 opacity-60",
                  nivelFilter !== "ALL" && "text-primary opacity-100",
                )}
              />
              <SelectValue placeholder="Nivel" />
            </div>
          </SelectTrigger>
          <SelectContent
            align="start"
            className="border-border/60 rounded-xl bg-popover p-1 shadow-lg"
          >
            <SelectItem value="ALL" className="font-semibold text-xs">
              Todos los niveles
            </SelectItem>
            {availableNiveles.map((nombre) => (
              <SelectItem
                key={nombre}
                value={nombre}
                className="text-xs font-medium"
              >
                {nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grado (Cascada) */}
        <Select value={gradoFilter} onValueChange={onGradoChange}>
          <SelectTrigger
            className={cn(
              "h-9 min-w-[130px] max-w-[160px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-1.5 shadow-2xs cursor-pointer",
              gradoFilter !== "ALL" &&
                "border-primary/50 bg-primary/5 text-primary font-extrabold",
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <IconBooks
                className={cn(
                  "size-3.5 shrink-0 opacity-60",
                  gradoFilter !== "ALL" && "text-primary opacity-100",
                )}
              />
              <SelectValue placeholder="Grado" />
            </div>
          </SelectTrigger>
          <SelectContent
            align="start"
            className="border-border/60 rounded-xl bg-popover p-1 shadow-lg"
          >
            <SelectItem value="ALL" className="font-semibold text-xs">
              Todos los grados
            </SelectItem>
            {availableGrados.map((nombre) => (
              <SelectItem
                key={nombre}
                value={nombre}
                className="text-xs font-medium"
              >
                {nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botón Reset Filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground font-semibold rounded-xl hover:bg-muted/80 gap-1.5 cursor-pointer"
          >
            <IconX className="size-3.5" />
            <span>Limpiar</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 border-none"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Acciones de Derecha: Atajos + Exportar/Importar & Selector de Vista */}
      <div className="flex items-center gap-2 shrink-0">
        <StudentKeyboardLegend variant="button" />

        {showPadronExport && (
          <>
            <BatchCardsButton
              nivelFilter={nivelFilter}
              gradoFilter={gradoFilter}
              nivelesAcademicos={nivelesAcademicos}
            />
            <ImportStudentsDialog nivelesAcademicos={nivelesAcademicos} />
            <DownloadPadronButton rows={filteredData as any} />
          </>
        )}

        {/* Alternador de Vista: Tabla / Cuadrícula */}
        <div className="flex items-center p-1 bg-background rounded-xl border border-border/60 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
              viewMode === "table"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Vista de Tabla Detallada"
          >
            <IconList className="size-3.5" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Vista de Tarjetas / Directorio"
          >
            <IconLayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">Directorio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
