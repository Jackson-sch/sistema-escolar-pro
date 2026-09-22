"use client";

import {
  IconCircleDashed,
  IconFilter,
  IconReceipt2,
  IconTable,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
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
import { cn } from "@/lib/utils";

interface CronogramaFiltersProps {
  levelFilter: string;
  seccionFilter: string;
  estadoFilter: string;
  conceptoFilter: string;
  seccionesDisponibles: [string, string][];
  conceptos: any[];
  niveles: any[];
  filteredData: any[];
  meta: any;
  handleExport?: () => void;
  isExporting?: boolean;
}

const ESTADO_STYLE_MAP: Record<string, string> = {
  PAID: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  EXPIRED: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  PENDING_VERIFICATION: "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
};

function SeccionFilterSelect({
  value,
  onChange,
  seccionesDisponibles,
}: {
  value: string;
  onChange: (val: string) => void;
  seccionesDisponibles: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-[140px] max-w-[180px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-2 shadow-2xs",
          value !== "all" && "border-primary/40 bg-primary/5 text-primary",
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

function EstadoFilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const customClass =
    ESTADO_STYLE_MAP[value] ||
    (value !== "all" ? "border-primary/40 bg-primary/5 text-primary" : "");

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-[130px] max-w-[180px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-2 shadow-2xs",
          customClass,
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

function ConceptoFilterSelect({
  value,
  onChange,
  conceptos,
}: {
  value: string;
  onChange: (val: string) => void;
  conceptos: any[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-[140px] max-w-[180px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-2 shadow-2xs",
          value !== "all" && "border-primary/40 bg-primary/5 text-primary",
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

function ExportExcelButton({
  isExporting,
  onClick,
}: {
  isExporting: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isExporting}
      onClick={onClick}
      className="h-9 gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold rounded-xl cursor-pointer shadow-2xs shrink-0 transition-transform hover:scale-105"
    >
      {isExporting ? (
        <IconLoader2 className="size-3.5 animate-spin" />
      ) : (
        <IconTable className="size-3.5 text-emerald-600" />
      )}
      <span className="hidden sm:inline">
        {isExporting ? "Exportando..." : "Exportar a Excel"}
      </span>
    </Button>
  );
}

export function CronogramaFilters({
  levelFilter,
  seccionFilter,
  estadoFilter,
  conceptoFilter,
  seccionesDisponibles,
  conceptos,
  niveles,
  filteredData,
  meta,
  handleExport,
  isExporting = false,
}: CronogramaFiltersProps) {
  const hasFilters =
    levelFilter !== "all" ||
    seccionFilter !== "all" ||
    estadoFilter !== "all" ||
    conceptoFilter !== "all";

  const handleClear = () => {
    meta.setLevelFilter("all");
    meta.setSeccionFilter("all");
    meta.setEstadoFilter("all");
    meta.setConceptoFilter("all");
    meta.setPage(1);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full">
      {niveles && niveles.length > 0 && (
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
      )}

      <SeccionFilterSelect
        value={seccionFilter}
        onChange={meta.setSeccionFilter}
        seccionesDisponibles={seccionesDisponibles}
      />

      <EstadoFilterSelect
        value={estadoFilter}
        onChange={meta.setEstadoFilter}
      />

      <ConceptoFilterSelect
        value={conceptoFilter}
        onChange={meta.setConceptoFilter}
        conceptos={conceptos}
      />

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground gap-1"
        >
          <IconX size={14} />
          <span>Limpiar</span>
        </Button>
      )}

      <div className="hidden lg:flex items-center ml-auto pr-1">
        <Badge
          variant="outline"
          className="text-[10px] font-bold py-1 px-2.5 rounded-lg border-border/60 text-muted-foreground bg-muted/20"
        >
          {filteredData.length} cuotas listadas
        </Badge>
      </div>

      {handleExport && (
        <ExportExcelButton
          isExporting={isExporting}
          onClick={handleExport}
        />
      )}
    </div>
  );
}
