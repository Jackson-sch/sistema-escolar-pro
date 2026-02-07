"use client";

import { useEffect } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns } from "@/components/gestion/admisiones/components/prospecto-columns";

interface ProspectoTableProps {
  data: any[];
  grados: any[];
  instituciones: any[];
}

interface ProspectoFiltersProps {
  table: any;
  estadoFilter: string;
  meta: any;
}

function ProspectoFilters({
  table,
  estadoFilter,
  meta,
}: ProspectoFiltersProps) {
  useEffect(() => {
    table
      .getColumn("estado")
      ?.setFilterValue(estadoFilter === "ALL" ? "" : estadoFilter);
  }, [estadoFilter, table]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
        <SelectTrigger className="w-[160px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent className="border-border/40 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            Todos los estados
          </SelectItem>
          <SelectItem value="INTERESADO" className="text-[11px] font-medium">
            INTERESADO
          </SelectItem>
          <SelectItem value="EVALUANDO" className="text-[11px] font-medium">
            EVALUANDO
          </SelectItem>
          <SelectItem value="ADMITIDO" className="text-[11px] font-medium">
            ADMITIDO
          </SelectItem>
          <SelectItem value="RECHAZADO" className="text-[11px] font-medium">
            RECHAZADO
          </SelectItem>
          <SelectItem value="MATRICULADO" className="text-[11px] font-medium">
            MATRICULADO
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProspectoTable({
  data,
  grados,
  instituciones,
}: ProspectoTableProps) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("ALL"),
  );

  const hasActiveFilters = searchQuery !== "" || estadoFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("ALL");
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="prospecto"
      searchPlaceholder="Buscar por DNI o nombre..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={{ grados, instituciones }}
    >
      {(table: any) => (
        <ProspectoFilters
          table={table}
          estadoFilter={estadoFilter}
          meta={{ setEstadoFilter }}
        />
      )}
    </DataTable>
  );
}
