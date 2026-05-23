"use client";

import { useEffect } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconSchool } from "@tabler/icons-react";

interface StudentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
  meta?: any;
}

interface StudentFiltersProps {
  table: any;
  estadoFilter: string;
  nivelFilter: string;
  meta: any;
}

function StudentFilters({
  table,
  estadoFilter,
  nivelFilter,
  meta,
}: StudentFiltersProps) {
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

  return (
    <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
      {/* Estado Select */}
      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-full sm:w-auto min-w-[160px] h-10 bg-background border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors pl-3.5 gap-2">
          <div className="flex items-center gap-2">
            <IconFilter className="size-3.5 text-muted-foreground/60 shrink-0" />
            <SelectValue placeholder="Estado" />
          </div>
        </SelectTrigger>
        <SelectContent className="border-slate-200 dark:border-zinc-800 rounded-2xl bg-background/95 backdrop-blur-xl p-1 shadow-2xl">
          <SelectItem value="ALL" className="font-bold text-xs">
            Todos los Estados
          </SelectItem>
          {meta?.estados?.map((e: any) => (
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

      {/* Nivel Select */}
      <Select value={nivelFilter} onValueChange={meta.setNivelFilter}>
        <SelectTrigger className="w-full sm:w-auto min-w-[200px] h-10 bg-background border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors pl-3.5 gap-2">
          <div className="flex items-center gap-2">
            <IconSchool className="size-3.5 text-muted-foreground/60 shrink-0" />
            <SelectValue placeholder="Nivel" />
          </div>
        </SelectTrigger>
        <SelectContent className="border-slate-200 dark:border-zinc-800 rounded-2xl bg-background/95 backdrop-blur-xl p-1 shadow-2xl">
          <SelectItem value="ALL" className="font-bold text-xs">
            Todos los Niveles
          </SelectItem>
          {Array.from(
            new Set(meta?.nivelesAcademicos?.map((n: any) => n.nivel.nombre)),
          ).map((nombre: any) => (
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
}: StudentTableProps<TData, TValue>) {
  // Estados con nuqs (persistidos en URL)
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

  // Pagination states with nuqs
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

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="estudiante"
      searchPlaceholder="Buscar por DNI o nombre..."
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1); // Reset to first page on search
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={meta}
      // Controlled pagination
      pageIndex={page - 1} // 0-indexed for table
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)} // 1-indexed for URL
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
    >
      {(table: any) => (
        <StudentFilters
          table={table}
          estadoFilter={estadoFilter}
          nivelFilter={nivelFilter}
          meta={{ ...meta, setEstadoFilter, setNivelFilter }}
        />
      )}
    </DataTable>
  );
}
