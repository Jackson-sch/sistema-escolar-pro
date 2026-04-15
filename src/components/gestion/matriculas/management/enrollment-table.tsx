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
    <div className="flex items-center gap-3">
      <div className="flex items-center bg-muted/50 rounded-full p-1">
        <Button
          variant={anioFilter === currentYear ? "secondary" : "ghost"}
          onClick={() => meta.setAnioFilter(currentYear)}
          className="h-8 text-xs font-bold rounded-full"
        >
          {currentYear}
        </Button>
        <Button
          variant={anioFilter === currentYear + 1 ? "secondary" : "ghost"}
          onClick={() => meta.setAnioFilter(currentYear + 1)}
          className="h-8 text-xs font-bold rounded-full"
        >
          {currentYear + 1}
        </Button>
      </div>

      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-[140px] h-10 bg-background border-primary/10 rounded-full">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="retirado">Retirado</SelectItem>
          <SelectItem value="suspendido">Suspendido</SelectItem>
          <SelectItem value="egresado">Egresado</SelectItem>
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
