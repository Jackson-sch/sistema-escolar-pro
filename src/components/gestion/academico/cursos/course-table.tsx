"use client";

import * as React from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import { IconSchool } from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
}

interface CourseFiltersProps {
  table: any;
  nivelId: string | null;
  aulaFilter: string;
  docenteFilter: string;
  areaFilter: string;
  periodoFilter: string;
  meta: any;
}

function CourseFilters({
  table,
  nivelId,
  aulaFilter,
  docenteFilter,
  areaFilter,
  periodoFilter,
  meta,
}: CourseFiltersProps) {
  // Sync filters with table columns explicitly using exact IDs
  React.useEffect(() => {
    table
      .getColumn("aulaId")
      ?.setFilterValue(aulaFilter === "ALL" ? "" : aulaFilter);
  }, [aulaFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("profesorId")
      ?.setFilterValue(docenteFilter === "ALL" ? "" : docenteFilter);
  }, [docenteFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("areaId")
      ?.setFilterValue(areaFilter === "ALL" ? "" : areaFilter);
  }, [areaFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("periodo")
      ?.setFilterValue(periodoFilter === "ALL" ? "" : periodoFilter);
  }, [periodoFilter, table]);

  // Obtener periodos únicos de la data
  const periodos = Array.from(
    new Set(
      table.getCoreRowModel().rows.map((r: any) => String(r.original.anioAcademico)),
    ),
  ).sort().reverse();

  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Filtro de Nivel */}
      <Select 
        value={nivelId || ""} 
        onValueChange={(v) => {
          meta.setNivelId(v);
          meta.setAulaFilter("ALL");
          meta.setDocenteFilter("ALL");
          meta.setAreaFilter("ALL");
          meta.setPage(1);
        }}
      >
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <div className="flex items-center gap-2 truncate">
            <IconSchool className="size-3.5 opacity-60 text-blue-500 shrink-0" />
            <SelectValue placeholder="Nivel Educativo" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {meta?.niveles?.map((n: any) => (
            <SelectItem key={n.id} value={n.id}>
              {n.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Aula */}
      <Select value={aulaFilter} onValueChange={meta.setAulaFilter} disabled={!nivelId}>
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Filtrar por Aula" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas las Aulas</SelectItem>
          {meta?.nivelesAcademicos?.map((n: any) => (
            <SelectItem
              key={n.id}
              value={n.id}
            >
              {n.grado.nombre} "{n.seccion}"
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Docente */}
      <Select value={docenteFilter} onValueChange={meta.setDocenteFilter} disabled={!nivelId}>
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Filtrar por Docente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los Docentes</SelectItem>
          {meta?.profesores?.map((p: any) => (
            <SelectItem
              key={p.id}
              value={p.id}
              className="capitalize"
            >
              {p.name} {p.apellidoPaterno}
            </SelectItem>
          ))}
          <SelectItem value="unassigned">Sin Docente Asignado</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro de Área */}
      <Select value={areaFilter} onValueChange={meta.setAreaFilter} disabled={!nivelId}>
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Filtrar por Área" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas las Áreas</SelectItem>
          {meta?.areas?.map((a: any) => (
            <SelectItem key={a.id} value={a.id} className="capitalize">
              {a.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Periodo */}
      <Select value={periodoFilter} onValueChange={meta.setPeriodoFilter} disabled={!nivelId || periodos.length === 0}>
        <SelectTrigger className="w-[140px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          {periodos.map((p: any) => (
            <SelectItem key={p} value={p} className="capitalize">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CourseTable<TData, TValue>({
  columns,
  data,
  meta,
}: CourseTableProps<TData, TValue>) {
  const [nivelId, setNivelId] = useQueryState("nivelId", parseAsString.withOptions({ shallow: false }));
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [aulaFilter, setAulaFilter] = useQueryState("aula", parseAsString.withDefault("ALL"));
  const [docenteFilter, setDocenteFilter] = useQueryState("docente", parseAsString.withDefault("ALL"));
  const [areaFilter, setAreaFilter] = useQueryState("area", parseAsString.withDefault("ALL"));
  const [periodoFilter, setPeriodoFilter] = useQueryState("periodo", parseAsString.withDefault("ALL"));

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const hasActiveFilters =
    searchQuery !== "" ||
    aulaFilter !== "ALL" ||
    docenteFilter !== "ALL" ||
    areaFilter !== "ALL" ||
    periodoFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setAulaFilter("ALL");
    setDocenteFilter("ALL");
    setAreaFilter("ALL");
    setPeriodoFilter("ALL");
    setPage(1);
  };

  if (!nivelId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/30">
        <IconSchool className="size-12 text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium">Seleccione un Nivel Educativo</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md text-center">
          Para visualizar y gestionar la carga horaria, primero debe seleccionar un nivel educativo.
        </p>
        <div className="w-full max-w-xs">
          <Select
            value={nivelId || ""}
            onValueChange={(v) => {
               setNivelId(v);
               setAulaFilter("ALL");
               setDocenteFilter("ALL");
               setAreaFilter("ALL");
               setPage(1);
            }}
          >
            <SelectTrigger className="w-full shadow-sm rounded-full">
              <div className="flex items-center gap-2 truncate">
                <IconSchool className="size-4 opacity-60 shrink-0 text-blue-500" />
                <SelectValue placeholder="Seleccionar Nivel..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {meta?.niveles?.map((nivel: any) => (
                <SelectItem key={nivel.id} value={nivel.id}>
                  {nivel.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar curso..."
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
      initialState={{
        columnVisibility: {
          aulaId: false,
          profesorId: false,
          areaId: false,
          nombre: false,
        },
      }}
    >
      {(table: any) => (
        <CourseFilters
          table={table}
          nivelId={nivelId}
          aulaFilter={aulaFilter}
          docenteFilter={docenteFilter}
          areaFilter={areaFilter}
          periodoFilter={periodoFilter}
          meta={{
            ...meta,
            setNivelId,
            setAulaFilter,
            setDocenteFilter,
            setAreaFilter,
            setPeriodoFilter,
            setPage,
          }}
        />
      )}
    </DataTable>
  );
}
