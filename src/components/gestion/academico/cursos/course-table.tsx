"use client";

import * as React from "react";
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

interface CourseTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: any;
}

interface CourseFiltersProps {
  table: any;
  aulaFilter: string;
  docenteFilter: string;
  areaFilter: string;
  periodoFilter: string;
  meta: any;
}

function CourseFilters({
  table,
  aulaFilter,
  docenteFilter,
  areaFilter,
  periodoFilter,
  meta,
}: CourseFiltersProps) {
  // Sync filters with table columns
  React.useEffect(() => {
    table
      .getColumn("aula")
      ?.setFilterValue(aulaFilter === "ALL" ? "" : aulaFilter);
  }, [aulaFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("profesor")
      ?.setFilterValue(docenteFilter === "ALL" ? "" : docenteFilter);
  }, [docenteFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("area")
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
      table.getCoreRowModel().rows.map((r: any) => r.original.anioAcademico),
    ),
  )
    .sort()
    .reverse();

  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Filtro de Aula */}
      <Select value={aulaFilter} onValueChange={meta.setAulaFilter}>
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Filtrar por Aula" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas las Aulas</SelectItem>
          {meta?.nivelesAcademicos?.map((n: any) => (
            <SelectItem
              key={n.id}
              value={`${n.nivel.nombre} ${n.grado.nombre} ${n.seccion}`}
            >
              {n.nivel.nombre} - {n.grado.nombre} "{n.seccion}"
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Docente */}
      <Select value={docenteFilter} onValueChange={meta.setDocenteFilter}>
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Filtrar por Docente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los Docentes</SelectItem>
          {meta?.profesores?.map((p: any) => (
            <SelectItem
              key={p.id}
              value={`${p.name} ${p.apellidoPaterno}`}
              className="capitalize"
            >
              {p.name} {p.apellidoPaterno}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Área */}
      <Select value={areaFilter} onValueChange={meta.setAreaFilter}>
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Filtrar por Área" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas las Áreas</SelectItem>
          {meta?.areas?.map((a: any) => (
            <SelectItem key={a.id} value={a.nombre} className="capitalize">
              {a.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Periodo */}
      <Select value={periodoFilter} onValueChange={meta.setPeriodoFilter}>
        <SelectTrigger className="w-[140px] h-10 bg-background rounded-full">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          {periodos.map((p: any) => (
            <SelectItem key={p} value={String(p)} className="capitalize">
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
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [aulaFilter, setAulaFilter] = useQueryState(
    "aula",
    parseAsString.withDefault("ALL"),
  );
  const [docenteFilter, setDocenteFilter] = useQueryState(
    "docente",
    parseAsString.withDefault("ALL"),
  );
  const [areaFilter, setAreaFilter] = useQueryState(
    "area",
    parseAsString.withDefault("ALL"),
  );
  const [periodoFilter, setPeriodoFilter] = useQueryState(
    "periodo",
    parseAsString.withDefault("ALL"),
  );

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
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar curso..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      meta={meta}
    >
      {(table: any) => (
        <CourseFilters
          table={table}
          aulaFilter={aulaFilter}
          docenteFilter={docenteFilter}
          areaFilter={areaFilter}
          periodoFilter={periodoFilter}
          meta={{
            ...meta,
            setAulaFilter,
            setDocenteFilter,
            setAreaFilter,
            setPeriodoFilter,
          }}
        />
      )}
    </DataTable>
  );
}
