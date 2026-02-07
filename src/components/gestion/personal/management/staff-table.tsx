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

interface StaffTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
}

interface StaffFiltersProps {
  table: any;
  estadoFilter: string;
  rolFilter: string;
  meta: any;
}

function StaffFilters({
  table,
  estadoFilter,
  rolFilter,
  meta,
}: StaffFiltersProps) {
  useEffect(() => {
    table
      .getColumn("estado")
      ?.setFilterValue(estadoFilter === "ALL" ? "" : estadoFilter);
  }, [estadoFilter, table]);

  useEffect(() => {
    table
      .getColumn("rol")
      ?.setFilterValue(rolFilter === "ALL" ? "" : rolFilter);
  }, [rolFilter, table]);

  return (
    <div className="flex items-center gap-3">
      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-[140px] rounded-full">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Cualquier Estado</SelectItem>
          {meta?.estados?.map((e: any) => (
            <SelectItem key={e.id} value={e.nombre}>
              {e.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rolFilter} onValueChange={meta.setRolFilter}>
        <SelectTrigger className="w-[140px] rounded-full">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los Roles</SelectItem>
          <SelectItem value="profesor">Profesores</SelectItem>
          <SelectItem value="admin">Administrativos</SelectItem>
          <SelectItem value="director">Directivos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function StaffTable<TData, TValue>({
  columns,
  data,
  meta,
}: StaffTableProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("ALL"),
  );
  const [rolFilter, setRolFilter] = useQueryState(
    "rol",
    parseAsString.withDefault("ALL"),
  );

  const hasActiveFilters =
    searchQuery !== "" || estadoFilter !== "ALL" || rolFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("ALL");
    setRolFilter("ALL");
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="personal"
      searchPlaceholder="Nombre, DNI o cargo..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={meta}
    >
      {(table: any) => (
        <StaffFilters
          table={table}
          estadoFilter={estadoFilter}
          rolFilter={rolFilter}
          meta={{ ...meta, setEstadoFilter, setRolFilter }}
        />
      )}
    </DataTable>
  );
}
