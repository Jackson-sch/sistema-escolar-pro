"use client";

import {
  IconCircleDashed,
  IconFilter,
  IconReceipt2,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import { CronogramaPeriodosChips } from "./cronograma-periodos-chips";
import { cn } from "@/lib/utils";

interface CronogramaFiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  levelFilter: string;
  seccionFilter: string;
  estadoFilter: string;
  conceptoFilter: string;
  mesFilter: string;
  seccionesDisponibles: [string, string][];
  conceptos: any[];
  niveles: any[];
  totalFiltrados: number;
  totalOriginal: number;
  onClearFilters: () => void;
  meta: {
    setLevelFilter: (val: string) => void;
    setSeccionFilter: (val: string) => void;
    setEstadoFilter: (val: string) => void;
    setConceptoFilter: (val: string) => void;
    setMesFilter: (val: string) => void;
    setPage: (val: number) => void;
  };
}

const ESTADO_STYLE_CONFIG: Record<string, string> = {
  PAID: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  EXPIRED: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  PENDING_VERIFICATION: "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
};

function CronogramaSearchInput({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por estudiante (DNI, Nombres, Apellidos)..."
        className="pl-9 pr-8 h-9 text-xs rounded-xl border-border/60 bg-background"
      />
      {searchQuery && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onSearchChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <IconX className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function CronogramaSeccionSelect({
  seccionFilter,
  onValueChange,
  seccionesDisponibles,
}: {
  seccionFilter: string;
  onValueChange: (val: string) => void;
  seccionesDisponibles: [string, string][];
}) {
  return (
    <Select value={seccionFilter} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-8 min-w-[130px] max-w-[170px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-2.5 pr-2 gap-1.5 shadow-2xs",
          seccionFilter !== "all" && "border-primary/40 bg-primary/5 text-primary",
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <IconFilter className="size-3.5 opacity-50 shrink-0" />
          <SelectValue placeholder="Sección" />
        </div>
      </SelectTrigger>
      <SelectContent className="border-border/60 bg-popover rounded-xl p-1 shadow-lg">
        <SelectItem value="all" className="text-xs font-semibold">
          Todas las secciones
        </SelectItem>
        {seccionesDisponibles.map(([id, label]) => (
          <SelectItem key={id} value={id} className="text-xs font-medium">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CronogramaEstadoSelect({
  estadoFilter,
  onValueChange,
}: {
  estadoFilter: string;
  onValueChange: (val: string) => void;
}) {
  const estadoClass =
    ESTADO_STYLE_CONFIG[estadoFilter] ||
    (estadoFilter !== "all" ? "border-primary/40 bg-primary/5 text-primary" : "");

  return (
    <Select value={estadoFilter} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-8 min-w-[130px] max-w-[170px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-2.5 pr-2 gap-1.5 shadow-2xs",
          estadoClass,
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <IconCircleDashed className="size-3.5 opacity-50 shrink-0" />
          <SelectValue placeholder="Estado" />
        </div>
      </SelectTrigger>
      <SelectContent className="border-border/60 bg-popover rounded-xl p-1 shadow-lg">
        <SelectItem value="all" className="text-xs font-semibold">
          Todos los estados
        </SelectItem>
        <SelectItem value="PAID" className="text-xs text-emerald-600 font-semibold">
          ✓ Pagado
        </SelectItem>
        <SelectItem value="PENDING" className="text-xs text-amber-600 font-semibold">
          ⏳ Pendiente
        </SelectItem>
        <SelectItem value="EXPIRED" className="text-xs text-rose-600 font-semibold">
          ⚠️ Vencido
        </SelectItem>
        <SelectItem value="PARTIALLY_PAID" className="text-xs text-blue-600 font-semibold">
          Parcial
        </SelectItem>
        <SelectItem value="PENDING_VERIFICATION" className="text-xs text-indigo-600 font-semibold">
          Por verificar (Vouchers)
        </SelectItem>
        <SelectItem value="VOIDED" className="text-xs opacity-50">
          Anulado
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function CronogramaConceptoSelect({
  conceptoFilter,
  onValueChange,
  conceptos,
}: {
  conceptoFilter: string;
  onValueChange: (val: string) => void;
  conceptos: any[];
}) {
  return (
    <Select value={conceptoFilter} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-8 min-w-[130px] max-w-[170px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-2.5 pr-2 gap-1.5 shadow-2xs",
          conceptoFilter !== "all" && "border-primary/40 bg-primary/5 text-primary",
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <IconReceipt2 className="size-3.5 opacity-50 shrink-0" />
          <SelectValue placeholder="Concepto" />
        </div>
      </SelectTrigger>
      <SelectContent className="border-border/60 bg-popover rounded-xl p-1 shadow-lg">
        <SelectItem value="all" className="text-xs font-semibold">
          Todos los conceptos
        </SelectItem>
        {conceptos.map((c) => (
          <SelectItem key={c.id} value={c.id} className="text-xs font-medium">
            {c.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CronogramaFiltersBar({
  searchQuery,
  onSearchChange,
  levelFilter,
  seccionFilter,
  estadoFilter,
  conceptoFilter,
  mesFilter,
  seccionesDisponibles,
  conceptos,
  niveles,
  totalFiltrados,
  totalOriginal,
  onClearFilters,
  meta,
}: CronogramaFiltersBarProps) {
  const hasActiveFilters =
    levelFilter !== "all" ||
    seccionFilter !== "all" ||
    estadoFilter !== "all" ||
    conceptoFilter !== "all" ||
    mesFilter !== "all" ||
    searchQuery !== "";

  return (
    <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
      {/* Fila 1: Buscador y Nivel Segmentado */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <CronogramaSearchInput
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {niveles && niveles.length > 0 && (
          <div className="shrink-0">
            <LevelSegmentedControl
              levels={[
                { id: "all", label: "Todos" },
                ...niveles.map((n: any) => ({ id: n.id, label: n.nombre })),
              ]}
              value={levelFilter}
              onChange={(val: string) => {
                meta.setLevelFilter(val);
                meta.setSeccionFilter("all");
                meta.setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Fila 2: Selector Rápido de Mes / Periodo Desacoplado */}
      <CronogramaPeriodosChips
        mesFilter={mesFilter}
        onSelectMes={(val) => {
          meta.setMesFilter(val);
          meta.setPage(1);
        }}
      />

      {/* Fila 3: Selectores Secundarios y Conteo */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-border/40">
        <CronogramaSeccionSelect
          seccionFilter={seccionFilter}
          onValueChange={meta.setSeccionFilter}
          seccionesDisponibles={seccionesDisponibles}
        />

        <CronogramaEstadoSelect
          estadoFilter={estadoFilter}
          onValueChange={meta.setEstadoFilter}
        />

        <CronogramaConceptoSelect
          conceptoFilter={conceptoFilter}
          onValueChange={meta.setConceptoFilter}
          conceptos={conceptos}
        />

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <IconX size={13} />
            <span>Limpiar</span>
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-bold py-1 px-2.5 rounded-lg border-border/60 text-muted-foreground bg-muted/20"
          >
            {totalFiltrados} de {totalOriginal} cuotas
          </Badge>
        </div>
      </div>
    </div>
  );
}
