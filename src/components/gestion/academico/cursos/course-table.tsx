"use client";

import * as React from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconSchool,
  IconBooks,
  IconClock,
  IconUserCheck,
  IconAlertCircle,
  IconMapPin,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CourseTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  activeNivelId?: string;
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
  // Sincronizar filtros con columnas TanStack Table
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

  const periodos = Array.from(
    new Set(
      table.getCoreRowModel().rows.map((r: any) => String(r.original.anioAcademico)),
    ),
  ).sort().reverse();

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
      {/* Filtro de Aula / Sección */}
      <Select
        value={aulaFilter}
        onValueChange={meta.setAulaFilter}
        disabled={!nivelId}
      >
        <SelectTrigger className="w-[170px] h-9 text-xs rounded-xl bg-background/80 border-border/40 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <IconMapPin className="size-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Todas las Aulas" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl z-[80]">
          <SelectItem value="ALL" className="text-xs">Todas las Aulas</SelectItem>
          {meta?.nivelesAcademicos?.map((n: any) => (
            <SelectItem key={n.id} value={n.id} className="text-xs">
              {n.grado.nombre} &quot;{n.seccion}&quot;
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Área Curricular */}
      <Select
        value={areaFilter}
        onValueChange={meta.setAreaFilter}
        disabled={!nivelId}
      >
        <SelectTrigger className="w-[170px] h-9 text-xs rounded-xl bg-background/80 border-border/40 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <IconBooks className="size-3.5 text-indigo-500 shrink-0" />
            <SelectValue placeholder="Todas las Áreas" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl z-[80]">
          <SelectItem value="ALL" className="text-xs">Todas las Áreas</SelectItem>
          {meta?.areas?.map((a: any) => (
            <SelectItem key={a.id} value={a.id} className="text-xs capitalize">
              {a.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Docente */}
      <Select
        value={docenteFilter}
        onValueChange={meta.setDocenteFilter}
        disabled={!nivelId}
      >
        <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-background/80 border-border/40 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <IconUserCheck className="size-3.5 text-emerald-500 shrink-0" />
            <SelectValue placeholder="Todos los Docentes" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl z-[80]">
          <SelectItem value="ALL" className="text-xs">Todos los Docentes</SelectItem>
          <SelectItem value="unassigned" className="text-xs text-amber-600 font-bold">
            Sin Docente Asignado
          </SelectItem>
          {meta?.profesores?.map((p: any) => (
            <SelectItem key={p.id} value={p.id} className="text-xs capitalize">
              {p.name} {p.apellidoPaterno}
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
  activeNivelId,
  meta,
}: CourseTableProps<TData, TValue>) {
  const [nivelId, setNivelId] = useQueryState(
    "nivelId",
    parseAsString.withDefault(activeNivelId || "").withOptions({ shallow: false }),
  );
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [aulaFilter, setAulaFilter] = useQueryState("aula", parseAsString.withDefault("ALL"));
  const [docenteFilter, setDocenteFilter] = useQueryState("docente", parseAsString.withDefault("ALL"));
  const [areaFilter, setAreaFilter] = useQueryState("area", parseAsString.withDefault("ALL"));
  const [periodoFilter, setPeriodoFilter] = useQueryState("periodo", parseAsString.withDefault("ALL"));

  // Paginación con nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const effectiveNivelId = nivelId || activeNivelId || (meta?.niveles?.[0]?.id ?? "");

  // Cálculo dinámico de KPI Dashboard Stats
  const totalCursos = data.length;
  const totalHoras = React.useMemo(() => {
    return (data as any[]).reduce((sum, item) => sum + (item.horasSemanales || 0), 0);
  }, [data]);

  const asignadosCount = React.useMemo(() => {
    return (data as any[]).filter((item) => !!item.profesorId || !!item.profesor).length;
  }, [data]);

  const sinDocenteCount = totalCursos - asignadosCount;

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

  return (
    <div className="space-y-5">
      {/* ── 1. Top Level Selector Pills ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border/40 bg-muted/40 flex-wrap w-full sm:w-auto">
          {meta?.niveles?.map((nivel: any) => {
            const isActive = effectiveNivelId === nivel.id;
            return (
              <button
                key={nivel.id}
                onClick={() => {
                  setNivelId(nivel.id);
                  setAulaFilter("ALL");
                  setDocenteFilter("ALL");
                  setAreaFilter("ALL");
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer flex items-center gap-2",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/80",
                )}
              >
                <IconSchool className="size-3.5" />
                <span>{nivel.nombre.toLowerCase()}</span>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Acceso rápido a filtro "Sin Docente" */}
        {sinDocenteCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDocenteFilter("unassigned")}
            className="rounded-xl h-9 text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 gap-1.5 cursor-pointer animate-pulse"
          >
            <IconAlertCircle className="size-4 text-amber-500" />
            <span>{sinDocenteCount} {sinDocenteCount === 1 ? "curso sin docente" : "cursos sin docente"}</span>
          </Button>
        )}
      </div>

      {/* ── 2. KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-border/40 bg-card/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Cursos
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {totalCursos}
              </p>
            </div>
            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <IconBooks className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 bg-card/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Carga Horaria Total
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {totalHoras} <span className="text-xs font-normal text-muted-foreground">hrs/sem</span>
              </p>
            </div>
            <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <IconClock className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 bg-card/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Docentes Asignados
              </p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {asignadosCount} <span className="text-xs font-normal text-muted-foreground">/ {totalCursos}</span>
              </p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <IconUserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 bg-card/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Sin Docente
              </p>
              <p className={cn(
                "text-2xl font-bold tracking-tight",
                sinDocenteCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}>
                {sinDocenteCount}
              </p>
            </div>
            <div className={cn(
              "size-10 rounded-xl border flex items-center justify-center",
              sinDocenteCount > 0
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : "bg-muted/40 text-muted-foreground border-border/40"
            )}>
              <IconAlertCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Tabla Principal de Carga Horaria ── */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar asignatura o curso..."
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        meta={meta}
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
            nivelId={effectiveNivelId}
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
    </div>
  );
}
