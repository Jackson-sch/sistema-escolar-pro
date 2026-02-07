"use client";

import { useQueryState, parseAsString } from "nuqs";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface EstadoUsuarioTableProps {
  data: any[];
}

export function EstadoUsuarioTable({ data }: EstadoUsuarioTableProps) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  const hasActiveFilters = searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar por nombre o código..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
}
