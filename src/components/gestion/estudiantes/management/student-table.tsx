"use client";

import { useEffect } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
}

interface EnrollmentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
    <div className="flex flex-wrap items-center gap-2">
      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-[140px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            Todos los estados
          </SelectItem>
          {meta?.estados?.map((e: any) => (
            <SelectItem
              key={e.id}
              value={e.nombre}
              className="text-[11px] font-medium"
            >
              {e.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={nivelFilter} onValueChange={meta.setNivelFilter}>
        <SelectTrigger className="w-[160px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
          <SelectValue placeholder="Nivel" />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            Todos los niveles
          </SelectItem>
          {Array.from(
            new Set(meta?.nivelesAcademicos?.map((n: any) => n.nivel.nombre)),
          ).map((nombre: any) => (
            <SelectItem
              key={nombre}
              value={nombre}
              className="text-[11px] font-medium"
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

  const hasActiveFilters =
    searchQuery !== "" || estadoFilter !== "ALL" || nivelFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("ALL");
    setNivelFilter("ALL");
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="estudiante"
      searchPlaceholder="Buscar por DNI o nombre..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={meta}
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
