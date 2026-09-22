"use client";

import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconBook, IconSchool } from "@tabler/icons-react";
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
  niveles: { id: string; nombre: string }[];
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
    <div className="flex items-center gap-2">
      <Select
        value={areaId || "all"}
        onValueChange={(v) => meta.setAreaId(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-[180px] sm:w-[220px] h-8.5 bg-background text-xs rounded-xl border-border/60 shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <IconBook className="size-3.5 opacity-70 shrink-0 text-violet-500" />
            <SelectValue placeholder="Todas las Áreas" />
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

export function CompetencyTable({ data, areas, niveles }: CompetencyTableProps) {
  const [nivelId, setNivelId] = useQueryState(
    "nivelId",
    parseAsString.withOptions({ shallow: false })
  );
  const [areaId, setAreaId] = useQueryState("areaId", parseAsString);
  const [searchQuery, setSearchQuery] = useQueryState(
    "nombre",
    parseAsString.withDefault("")
  );

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10)
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

  if (!nivelId && niveles.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-card/60 backdrop-blur-md">
        <IconSchool className="size-12 text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-base font-bold text-foreground">Seleccione un Nivel Educativo</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-md text-center">
          Para visualizar y gestionar las competencias, seleccione un nivel educativo en el panel superior.
        </p>
        <div className="flex gap-2">
          {niveles.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNivelId(n.id)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {n.nombre}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs p-4 overflow-hidden">
      <DataTable
        columns={tableColumns}
        data={data as any}
        searchKey="nombre"
        searchPlaceholder="Buscar por nombre de competencia..."
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        meta={{ ...areas }}
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
            meta={{ areas, setAreaId, setPage }}
          />
        )}
      </DataTable>
    </div>
  );
}
