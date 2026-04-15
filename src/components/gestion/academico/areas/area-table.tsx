"use client";

import * as React from "react";
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

interface AreaTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
}

export function AreaTable<TData, TValue>({
  columns,
  data,
  meta,
}: AreaTableProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  
  const [nivelId, setNivelId] = useQueryState(
    "nivel",
    parseAsString.withDefault("all")
  );

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const clearFilters = () => {
    setSearchQuery("");
    setNivelId("all");
    setPage(1);
  };

  const niveles = meta?.niveles || [];

  // Client-side filter for Nivel
  const filteredData = React.useMemo(() => {
    if (nivelId === "all") return data;
    return data.filter((item: any) => item.nivelId === nivelId);
  }, [data, nivelId]);

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      searchPlaceholder="Buscar por nombre o código..."
      searchValue={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={searchQuery !== "" || nivelId !== "all"}
      meta={meta}
      // Controlled pagination
      pageIndex={page - 1}
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)}
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
    >
      {() => (
        <Select
          value={nivelId}
          onValueChange={(val) => {
            setNivelId(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background border-dashed">
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todos los niveles</SelectItem>
            {niveles.map((nivel: any) => (
              <SelectItem key={nivel.id} value={nivel.id}>
                {nivel.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </DataTable>
  );
}
