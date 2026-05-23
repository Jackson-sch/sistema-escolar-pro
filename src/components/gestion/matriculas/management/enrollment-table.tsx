"use client";

import { useEffect } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
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

interface EnrollmentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
}

interface EnrollmentFiltersProps {
  table: any;
  currentYear: number;
  anioFilter: number;
  estadoFilter: string;
  meta: any;
}

function EnrollmentFilters({
  table,
  currentYear,
  anioFilter,
  estadoFilter,
  meta,
}: EnrollmentFiltersProps) {
  useEffect(() => {
    table.getColumn("anioAcademico")?.setFilterValue(anioFilter);
  }, [anioFilter, table]);

  useEffect(() => {
    table
      .getColumn("estado")
      ?.setFilterValue(estadoFilter === "ALL" ? "" : estadoFilter);
  }, [estadoFilter, table]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center bg-slate-100 dark:bg-zinc-900 rounded-full p-1 border border-slate-200/50 dark:border-zinc-800/50 gap-1 pl-3">
        <IconCalendarEvent className="size-4 text-muted-foreground/75 shrink-0" />
        <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground/50 mr-1 hidden sm:inline select-none">
          Periodo
        </span>
        <Button
          variant="ghost"
          onClick={() => meta.setAnioFilter(currentYear)}
          className={`h-8 text-xs font-black rounded-full px-4 transition-all duration-200 ${
            anioFilter === currentYear
              ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500 hover:text-white"
              : "text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-zinc-800"
          }`}
        >
          {currentYear}
        </Button>
        <Button
          variant="ghost"
          onClick={() => meta.setAnioFilter(currentYear + 1)}
          className={`h-8 text-xs font-black rounded-full px-4 transition-all duration-200 ${
            anioFilter === currentYear + 1
              ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500 hover:text-white"
              : "text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-zinc-800"
          }`}
        >
          {currentYear + 1}
        </Button>
      </div>

      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-full sm:w-auto min-w-[180px] h-10 bg-background border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors pl-3.5 gap-2">
          <div className="flex items-center gap-2">
            <IconFilter className="size-3.5 text-muted-foreground/60 shrink-0" />
            <SelectValue placeholder="Estado" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL" className="font-bold text-xs">Todos los Estados</SelectItem>
          <SelectItem value="activo" className="font-bold text-xs text-green-500">Activo</SelectItem>
          <SelectItem value="retirado" className="font-bold text-xs text-red-500">Retirado</SelectItem>
          <SelectItem value="suspendido" className="font-bold text-xs text-yellow-600">Suspendido</SelectItem>
          <SelectItem value="egresado" className="font-bold text-xs text-blue-500">Egresado</SelectItem>
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
      {(table: any) => (
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
