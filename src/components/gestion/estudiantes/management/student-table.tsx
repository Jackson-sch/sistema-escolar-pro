"use client";

import { useEffect, useMemo } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ColumnDef, type Table } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DownloadPadronButton } from "@/components/gestion/estudiantes/components/download-padron-button";
import {
  IconFilter,
  IconSchool,
  IconFilterSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StudentTableMeta {
  instituciones?: unknown[];
  estados?: Array<{ id: string; nombre: string }>;
  nivelesAcademicos?: Array<{ nivel: { nombre: string } }>;
  institucion?: unknown;
}

interface StudentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
  meta?: StudentTableMeta;
  /** Muestra el botón de exportación del padrón en el toolbar */
  showPadronExport?: boolean;
}

interface StudentFiltersProps<TData> {
  table: Table<TData>;
  estadoFilter: string;
  nivelFilter: string;
  meta: StudentTableMeta & {
    setEstadoFilter: (value: string) => void;
    setNivelFilter: (value: string) => void;
  };
}

function StudentFilters<TData>({
  table,
  estadoFilter,
  nivelFilter,
  meta,
}: StudentFiltersProps<TData>) {
  useEffect(() => {
    table
      .getColumn("estado")
      ?.setFilterValue(estadoFilter === "ALL" ? "" : estadoFilter);
  }, [estadoFilter, table]);

  useEffect(() => {
    table
      .getColumn("nivelAcademico")
      ?.setFilterValue(nivelFilter === "ALL" ? "" : nivelFilter);
  }, [nivelFilter, table]);

  const uniqueEstados = useMemo(() => {
    if (!meta?.estados) return [];
    const seen = new Set<string>();
    return meta.estados.filter((e) => {
      if (!e.nombre || seen.has(e.nombre)) return false;
      seen.add(e.nombre);
      return true;
    });
  }, [meta?.estados]);

  return (
    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger
          className={cn(
            "w-full sm:w-auto min-w-[160px] h-9 bg-background/40 border-border/40 rounded-full text-xs font-bold hover:bg-background/60 transition-colors pl-3.5 gap-2",
            estadoFilter !== "ALL" &&
              "border-primary/30 bg-primary/5 text-primary",
          )}
        >
          <div className="flex items-center gap-2">
            <IconFilter
              className={cn(
                "size-3.5 shrink-0 transition-colors",
                estadoFilter !== "ALL"
                  ? "text-primary/60"
                  : "text-muted-foreground/60",
              )}
            />
            <SelectValue placeholder="Estado" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="border-border/40 rounded-2xl bg-background/95 p-1 shadow-lg">
          <SelectItem value="ALL" className="font-bold text-xs">
            Todos los Estados
          </SelectItem>
          {uniqueEstados.map((e) => (
            <SelectItem
              key={e.id}
              value={e.nombre}
              className="font-bold text-xs"
            >
              {e.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={nivelFilter} onValueChange={meta.setNivelFilter}>
        <SelectTrigger
          className={cn(
            "w-full sm:w-auto min-w-[200px] h-9 bg-background/40 border-border/40 rounded-full text-xs font-bold hover:bg-background/60 transition-colors pl-3.5 gap-2",
            nivelFilter !== "ALL" &&
              "border-primary/30 bg-primary/5 text-primary",
          )}
        >
          <div className="flex items-center gap-2">
            <IconSchool
              className={cn(
                "size-3.5 shrink-0 transition-colors",
                nivelFilter !== "ALL"
                  ? "text-primary/60"
                  : "text-muted-foreground/60",
              )}
            />
            <SelectValue placeholder="Nivel" />
          </div>
        </SelectTrigger>
        <SelectContent className="border-border/40 rounded-2xl bg-background/95 p-1 shadow-lg">
          <SelectItem value="ALL" className="font-bold text-xs">
            Todos los Niveles
          </SelectItem>
          {Array.from(
            new Set(meta?.nivelesAcademicos?.map((n) => n.nivel.nombre)),
          ).map((nombre) => (
            <SelectItem
              key={nombre}
              value={nombre}
              className="font-bold text-xs"
            >
              {nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function StudentTable<TData, TValue>({
  columns,
  data,
  meta,
  showPadronExport = false,
}: StudentTableProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("ALL"),
  );
  const [nivelFilter, setNivelFilter] = useQueryState(
    "nivel",
    parseAsString.withDefault("ALL"),
  );

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const hasActiveFilters =
    searchQuery !== "" || estadoFilter !== "ALL" || nivelFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("ALL");
    setNivelFilter("ALL");
    setPage(1);
  };

  const activeFilterCount = [
    searchQuery !== "",
    estadoFilter !== "ALL",
    nivelFilter !== "ALL",
  ].filter(Boolean).length;

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="estudiante"
      searchPlaceholder="Buscar por DNI, nombre o código..."
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={meta}
      pageIndex={page - 1}
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)}
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
      emptyStateTitle="No se encontraron estudiantes"
      emptyStateDescription="No pudimos encontrar estudiantes que coincidan con tu búsqueda o filtros aplicados. Intenta con otros criterios."
    >
      {(table) => (
        <div className="flex items-center gap-3 w-full">
          <StudentFilters
            table={table}
            estadoFilter={estadoFilter}
            nivelFilter={nivelFilter}
            meta={{ ...meta, setEstadoFilter, setNivelFilter }}
          />

          {showPadronExport && (
            <DownloadPadronButton
              rows={table
                .getFilteredRowModel()
                .rows.map((row: any) => row.original)}
            />
          )}

          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-6 px-2 rounded-full text-[10px] font-bold gap-1 shrink-0 bg-primary/5 text-primary border border-primary/15"
            >
              <IconFilterSearch className="size-3" />
              {activeFilterCount}
            </Badge>
          )}
        </div>
      )}
    </DataTable>
  );
}
