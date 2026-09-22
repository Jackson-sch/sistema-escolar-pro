"use client";

import { useEffect } from "react";
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

interface StaffTableMeta {
  instituciones?: unknown[];
  estados?: Array<{ id: string; nombre: string }>;
  cargos?: Array<{ id: string; nombre: string }>;
}

interface StaffTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: StaffTableMeta;
}

interface StaffFiltersProps<TData> {
  table: Table<TData>;
  estadoFilter: string;
  rolFilter: string;
  cargoFilter: string;
  meta: StaffTableMeta & {
    setEstadoFilter: (value: string) => void;
    setRolFilter: (value: string) => void;
    setCargoFilter: (value: string) => void;
  };
}

function StaffFilters<TData>({
  table,
  estadoFilter,
  rolFilter,
  cargoFilter,
  meta,
}: StaffFiltersProps<TData>) {
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

  useEffect(() => {
    table
      .getColumn("cargo")
      ?.setFilterValue(cargoFilter === "ALL" ? "" : cargoFilter);
  }, [cargoFilter, table]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-[140px] rounded-full text-xs font-semibold h-9">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Cualquier Estado</SelectItem>
          {meta?.estados?.map((e) => (
            <SelectItem key={e.id} value={e.nombre}>
              {e.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rolFilter} onValueChange={meta.setRolFilter}>
        <SelectTrigger className="w-[140px] rounded-full text-xs font-semibold h-9">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los Roles</SelectItem>
          <SelectItem value="profesor">Profesores</SelectItem>
          <SelectItem value="admin">Administrativos</SelectItem>
          <SelectItem value="director">Directivos</SelectItem>
        </SelectContent>
      </Select>

      {meta?.cargos && meta.cargos.length > 0 && (
        <Select value={cargoFilter} onValueChange={meta.setCargoFilter}>
          <SelectTrigger className="w-[160px] rounded-full text-xs font-semibold h-9">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los Cargos</SelectItem>
            {meta.cargos.map((c) => (
              <SelectItem key={c.id} value={c.nombre}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
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
  const [cargoFilter, setCargoFilter] = useQueryState(
    "cargo",
    parseAsString.withDefault("ALL"),
  );

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const hasActiveFilters =
    searchQuery !== "" ||
    estadoFilter !== "ALL" ||
    rolFilter !== "ALL" ||
    cargoFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("ALL");
    setRolFilter("ALL");
    setCargoFilter("ALL");
    setPage(1);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="personal"
      searchPlaceholder="Nombre, DNI o cargo..."
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={meta}
      // Controlled pagination
      pageIndex={page - 1}
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)}
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
    >
      {(table) => (
        <StaffFilters
          table={table}
          estadoFilter={estadoFilter}
          rolFilter={rolFilter}
          cargoFilter={cargoFilter}
          meta={{ ...meta, setEstadoFilter, setRolFilter, setCargoFilter }}
        />
      )}
    </DataTable>
  );
}
