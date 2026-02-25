"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
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

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const hasActiveFilters = searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setPage(1);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar por nombre o código..."
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      // Controlled pagination
      pageIndex={page - 1}
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)}
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
    />
  );
}
