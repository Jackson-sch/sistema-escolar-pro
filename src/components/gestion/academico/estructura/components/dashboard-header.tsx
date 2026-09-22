"use client";

import {
  IconSchool,
  IconChevronRight,
  IconCalendarEvent,
  IconSearch,
  IconCopy,
  IconPlus,
  IconSparkles,
  IconLayoutGrid,
  IconTable,
  IconBuilding,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAnioLectivoOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  selectedNivel: any;
  selectedYear: number;
  clonando: boolean;
  searchQuery: string;
  viewMode: "cards" | "table";
  sedes?: any[];
  selectedSedeId?: string;
  onSedeChange?: (sedeId: string) => void;
  onViewModeChange: (mode: "cards" | "table") => void;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onYearChange: (year: string) => void;
  onClone: () => void;
  onNewGrado: () => void;
  onNewSalon: () => void;
}

export function DashboardHeader({
  selectedNivel,
  selectedYear,
  clonando,
  searchQuery,
  viewMode,
  sedes = [],
  selectedSedeId = "all",
  onSedeChange,
  onViewModeChange,
  onSearchChange,
  onBack,
  onYearChange,
  onClone,
  onNewGrado,
  onNewSalon,
}: DashboardHeaderProps) {
  return (
    <div className="px-4 sm:px-6 py-3.5 border-b border-border/50 shrink-0 bg-muted/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver atrás"
            className="size-8 rounded-lg lg:hidden shrink-0 -ml-1"
            onClick={onBack}
          >
            <IconChevronRight size={16} className="rotate-180" />
          </Button>

          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <IconSchool size={18} className="text-primary" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold tracking-tight text-foreground truncate">
                {selectedNivel?.nombre || "Selecciona un nivel"}
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border-primary/25 text-primary bg-primary/5 shrink-0"
              >
                {selectedYear}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Grados y distribución de secciones
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher (Tarjetas / Tabla) */}
          <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Vista de Cuadrícula / Tarjetas"
            >
              <IconLayoutGrid size={13} />
              <span className="hidden md:inline">Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Vista de Tabla Compacta"
            >
              <IconTable size={13} />
              <span className="hidden md:inline">Tabla</span>
            </button>
          </div>

          {/* Year selector */}
          <Select
            key={selectedYear}
            onValueChange={onYearChange}
            defaultValue={String(selectedYear)}
          >
            <SelectTrigger className="h-8.5 w-auto gap-1.5 rounded-lg border-border/60 bg-background px-2.5 text-xs font-semibold">
              <IconCalendarEvent size={13} className="text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {getAnioLectivoOptions().map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="rounded-lg text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sede selector */}
          {sedes.length > 0 && (
            <Select
              value={selectedSedeId}
              onValueChange={(val) => onSedeChange?.(val)}
            >
              <SelectTrigger className="h-8.5 w-auto max-w-[170px] gap-1.5 rounded-lg border-border/60 bg-background px-2.5 text-xs font-semibold">
                <IconBuilding size={13} className="text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todas las Sedes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">
                  Todas las Sedes
                </SelectItem>
                {sedes.map((sede: any) => (
                  <SelectItem key={sede.id} value={sede.id} className="rounded-lg text-xs">
                    {sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Search */}
          {viewMode === "cards" && (
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar grado..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-7.5 h-8.5 w-32 sm:w-40 text-xs bg-background border-border/60 rounded-lg"
              />
            </div>
          )}

          {/* Clone */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClone}
            disabled={clonando}
            className="h-8.5 rounded-lg px-2.5 gap-1.5 text-xs font-semibold border-border/60 text-muted-foreground hover:text-foreground"
            title="Clonar estructura académica al siguiente año"
          >
            <IconCopy size={13} />
            <span className="hidden lg:inline">Clonar</span>
          </Button>

          {/* New grade */}
          <Button
            variant="outline"
            size="sm"
            onClick={onNewGrado}
            className="h-8.5 rounded-lg px-2.5 gap-1.5 text-xs font-bold border-border/60"
          >
            <IconPlus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">Nuevo Grado</span>
          </Button>

          {/* Wizard Nuevo Salón */}
          <Button
            size="sm"
            onClick={onNewSalon}
            className="h-8.5 rounded-lg px-3 gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
          >
            <IconSparkles size={13} />
            <span>Nuevo Salón</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
