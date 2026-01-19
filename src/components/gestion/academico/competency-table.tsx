"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconBook,
  IconFilterOff,
  IconSearch,
  IconTarget,
} from "@tabler/icons-react";
import { useQueryState, parseAsString } from "nuqs";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns, CompetencyTableType } from "./competency-table-columns";

interface CompetencyTableProps {
  data: CompetencyTableType[];
  areas: { id: string; nombre: string }[];
}

export function CompetencyTable({ data, areas }: CompetencyTableProps) {
  const [areaId, setAreaId] = useQueryState("areaId", parseAsString);
  const [searchQuery, setSearchQuery] = useQueryState(
    "nombre",
    parseAsString.withDefault("")
  );

  const hasActiveFilters = !!areaId || !!searchQuery;

  const clearFilters = () => {
    setAreaId(null);
    setSearchQuery("");
  };

  // Extended columns to include hidden filterable areaId
  const tableColumns: ColumnDef<CompetencyTableType>[] = [
    ...columns,
    {
      accessorFn: (row) => row.areaCurricularId,
      id: "areaCurricularId",
      header: "",
      cell: () => null,
      enableColumnFilter: true,
    },
  ];

  return (
    <DataTable
      columns={tableColumns}
      data={data as any}
      searchKey="nombre"
      searchPlaceholder="Buscar competencias..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      initialState={{
        columnVisibility: {
          areaCurricularId: false,
        },
      }}
    >
      {(table: any) => {
        // Link nuqs state to table filters
        useEffect(() => {
          table.getColumn("areaCurricularId")?.setFilterValue(areaId);
        }, [areaId, table]);

        return (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Select
              value={areaId || "all"}
              onValueChange={(v) => setAreaId(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-full sm:w-[220px] h-9 bg-background border-primary/10 text-xs shadow-sm">
                <div className="flex items-center gap-2 truncate">
                  <IconBook className="size-3.5 opacity-60 shrink-0 text-violet-500" />
                  <SelectValue placeholder="Filtrar por Área" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Áreas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }}
    </DataTable>
  );
}
