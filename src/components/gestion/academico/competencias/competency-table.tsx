"use client";

import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconBook } from "@tabler/icons-react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  columns,
  CompetencyTableType,
} from "./components/competency-table-columns";

interface CompetencyTableProps {
  data: CompetencyTableType[];
  areas: { id: string; nombre: string }[];
}

interface CompetencyFiltersProps {
  table: any;
  areaId: string | null;
  meta: any;
}

function CompetencyFilters({ table, areaId, meta }: CompetencyFiltersProps) {
  useEffect(() => {
    table.getColumn("areaCurricularId")?.setFilterValue(areaId);
  }, [areaId, table]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      <Select
        value={areaId || "all"}
        onValueChange={(v) => meta.setAreaId(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-[220px] h-9 bg-background text-xs shadow-sm rounded-full">
          <div className="flex items-center gap-2 truncate">
            <IconBook className="size-3.5 opacity-60 shrink-0 text-violet-500" />
            <SelectValue placeholder="Filtrar por Área" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las Áreas</SelectItem>
          {meta?.areas?.map((area: any) => (
            <SelectItem key={area.id} value={area.id}>
              {area.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CompetencyTable({ data, areas }: CompetencyTableProps) {
  const [areaId, setAreaId] = useQueryState("areaId", parseAsString);
  const [searchQuery, setSearchQuery] = useQueryState(
    "nombre",
    parseAsString.withDefault(""),
  );

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const hasActiveFilters = !!areaId || !!searchQuery;

  const clearFilters = () => {
    setAreaId(null);
    setSearchQuery("");
    setPage(1);
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
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={{ ...areas }}
      // Controlled pagination
      pageIndex={page - 1}
      pageSize={limit}
      onPageIndexChange={(index) => setPage(index + 1)}
      onPageSizeChange={setLimit}
      showColumnVisibility={false}
      initialState={{
        columnVisibility: {
          areaCurricularId: false,
        },
      }}
    >
      {(table: any) => (
        <CompetencyFilters
          table={table}
          areaId={areaId}
          meta={{ areas, setAreaId }}
        />
      )}
    </DataTable>
  );
}
