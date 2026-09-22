"use client";

import { useEffect } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ColumnDef, type Table } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCalendarEvent, IconFilter } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface EnrollmentTableMeta {
  nivelesAcademicos?: unknown[];
  institucion?: { cicloEscolarActual?: number | null } | null;
}

interface EnrollmentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: EnrollmentTableMeta;
}

interface EnrollmentFiltersProps<TData> {
  table: Table<TData>;
  currentYear: number;
  anioFilter: number;
  estadoFilter: string;
  meta: EnrollmentTableMeta & {
    setAnioFilter: (value: number) => void;
    setEstadoFilter: (value: string) => void;
  };
}

function EnrollmentFilters<TData>({
  table,
  currentYear,
  anioFilter,
  estadoFilter,
  meta,
}: EnrollmentFiltersProps<TData>) {
  useEffect(() => {
    table.getColumn("anioAcademico")?.setFilterValue(anioFilter);
  }, [anioFilter, table]);

  useEffect(() => {
    table
      .getColumn("estado")
      ?.setFilterValue(estadoFilter === "ALL" ? "" : estadoFilter);
  }, [estadoFilter, table]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="inline-flex items-center h-9 p-0.5 bg-muted/40 rounded-xl border border-border/50 gap-0.5">
        <div className="flex items-center gap-1 px-2 text-[10px] uppercase font-bold text-muted-foreground/60 select-none">
          <IconCalendarEvent className="size-3.5 opacity-70" />
          <span>Periodo</span>
        </div>
        <button
          type="button"
          onClick={() => meta.setAnioFilter(currentYear)}
          className={cn(
            "h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
            anioFilter === currentYear
              ? "bg-background text-foreground shadow-2xs border border-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40",
          )}
        >
          {currentYear}
        </button>
        <button
          type="button"
          onClick={() => meta.setAnioFilter(currentYear + 1)}
          className={cn(
            "h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
            anioFilter === currentYear + 1
              ? "bg-background text-foreground shadow-2xs border border-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40",
          )}
        >
          {currentYear + 1}
        </button>
      </div>

      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className={cn(
          "h-9 min-w-[140px] max-w-[180px] bg-background border-border/60 rounded-xl text-xs font-bold transition-colors pl-3 pr-2.5 gap-2 shadow-2xs",
          estadoFilter !== "ALL" && "border-primary/40 bg-primary/5 text-primary"
        )}>
          <div className="flex items-center gap-1.5 truncate">
            <IconFilter className="size-3.5 opacity-60 shrink-0" />
            <SelectValue placeholder="Estado" />
          </div>
        </SelectTrigger>
        <SelectContent align="start" className="border-border/60 rounded-xl bg-popover p-1 shadow-lg">
          <SelectItem value="ALL" className="font-semibold text-xs">Todos los estados</SelectItem>
          <SelectItem value="activo" className="font-medium text-xs text-emerald-600">✓ Activo</SelectItem>
          <SelectItem value="pendiente" className="font-medium text-xs text-amber-600 dark:text-amber-400">🟡 Por Ratificar</SelectItem>
          <SelectItem value="retirado" className="font-medium text-xs text-rose-600">✕ Retirado</SelectItem>
          <SelectItem value="suspendido" className="font-medium text-xs text-amber-600">⏳ Suspendido</SelectItem>
          <SelectItem value="egresado" className="font-medium text-xs text-blue-600">Graduado/Egresado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function EnrollmentTable<TData, TValue>({
  columns,
  data,
  meta,
}: EnrollmentTableProps<TData, TValue>) {
  // Use current academic year from meta or fallback to actual year
  const currentYear = meta?.institucion?.cicloEscolarActual || new Date().getFullYear();

  // Estados con nuqs (persistidos en URL)
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [anioFilter, setAnioFilter] = useQueryState(
    "anio",
    parseAsInteger.withDefault(currentYear),
  );
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("ALL"),
  );

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  // hasActiveFilters only when user changes from the DEFAULT current year or selects a status
  const hasActiveFilters =
    searchQuery !== "" || anioFilter !== currentYear || estadoFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setAnioFilter(currentYear);
    setEstadoFilter("ALL");
    setPage(1);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="estudiante"
      searchPlaceholder="Buscar por DNI o nombre..."
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      ignoredFilterColumns={["anioAcademico", "estado"]}
      meta={meta}
      // Controlled pagination
      pageIndex={page - 1}
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)}
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
    >
      {(table) => (
        <EnrollmentFilters
          table={table}
          currentYear={currentYear}
          anioFilter={anioFilter}
          estadoFilter={estadoFilter}
          meta={{ ...meta, setAnioFilter, setEstadoFilter }}
        />
      )}
    </DataTable>
  );
}
