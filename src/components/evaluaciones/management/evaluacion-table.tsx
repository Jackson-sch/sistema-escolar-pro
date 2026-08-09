"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconClipboardList,
  IconCalendar,
  IconSchool,
  IconBook,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/data-table";
import { EvaluacionStats } from "../reportes/evaluacion-stats";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { deleteEvaluacionAction } from "@/actions/evaluations";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { getEvaluacionColumns } from "./evaluacion-columns";

export type EvaluacionTableType = {
  id: string;
  nombre: string;
  descripcion: string | null;
  // Prisma retorna `Date`; la acción lo serializa a ISO string en runtime.
  fecha: string | Date;
  peso: number;
  activa: boolean;
  tipoEvaluacion: { id: string; nombre: string };
  curso: {
    id: string;
    nombre: string;
    areaCurricular: { nombre: string; color: string | null };
    nivelAcademico: { id: string; seccion: string; grado: { nombre: string } };
  };
  periodo: { id: string; nombre: string };
  capacidad: {
    id: string;
    nombre: string;
    competencia: { nombre: string };
  } | null;
  _count: { notas: number };
};

interface EvaluacionTableProps {
  data: EvaluacionTableType[];
  meta?: any;
}

interface EvaluacionFiltersProps {
  table: any;
  nivelAcademicoId: string | null;
  cursoId: string | null;
  tipoId: string | null;
  periodoId: string | null;
  meta: any;
}

function EvaluacionFilters({
  table,
  nivelAcademicoId,
  cursoId,
  tipoId,
  periodoId,
  meta,
}: EvaluacionFiltersProps) {
  useEffect(() => {
    table.getColumn("nivelAcademicoId")?.setFilterValue(nivelAcademicoId);
  }, [nivelAcademicoId, table]);

  useEffect(() => {
    table.getColumn("cursoId")?.setFilterValue(cursoId);
  }, [cursoId, table]);

  useEffect(() => {
    table.getColumn("tipoId")?.setFilterValue(tipoId);
  }, [tipoId, table]);

  useEffect(() => {
    table.getColumn("periodoId")?.setFilterValue(periodoId);
  }, [periodoId, table]);

  // Obtener aulas únicas de la lista de cursos
  const aulas = (() => {
    const uniqueAulas = new Map<string, { id: string; nombre: string; nivel: string }>();
    meta?.cursos?.forEach((c: any) => {
      const na = c.nivelAcademico;
      if (na && !uniqueAulas.has(na.id)) {
        uniqueAulas.set(na.id, {
          id: na.id,
          nombre: `${na.grado?.nombre} "${na.seccion}"`,
          nivel: na.nivel?.nombre || "General",
        });
      }
    });
    return Array.from(uniqueAulas.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  })();

  // Obtener cursos correspondientes al aula seleccionada
  const filteredCursos = !nivelAcademicoId
    ? []
    : meta?.cursos?.filter((c: any) => c.nivelAcademico?.id === nivelAcademicoId) || [];

  return (
    <div className="flex flex-row flex-wrap items-center gap-2.5 w-full">
      {/* Selector de Aula */}
      <Select
        value={nivelAcademicoId || "all"}
        onValueChange={(v) => {
          const val = v === "all" ? null : v;
          meta.setNivelAcademicoId(val);
          meta.setCursoId(null); // Resetear el curso seleccionado
        }}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px] bg-background border-border/40 text-[11px] shadow-sm rounded-xl px-3.5 h-10 hover:bg-muted/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 truncate">
            <IconSchool className="size-3.5 opacity-60 shrink-0 text-primary" />
            <SelectValue placeholder="Seleccionar Aula" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">Todas las Aulas</SelectItem>
          {aulas.map((aula: any) => (
            <SelectItem key={aula.id} value={aula.id}>
              {aula.nombre} ({aula.nivel})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selector de Curso (Filtrado y habilitado solo si se selecciona Aula) */}
      <Select
        value={cursoId || "all"}
        onValueChange={(v) => meta.setCursoId(v === "all" ? null : v)}
        disabled={!nivelAcademicoId}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px] bg-background border-border/40 text-[11px] shadow-sm rounded-xl px-3.5 h-10 hover:bg-muted/10 transition-[background-color,opacity] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          <div className="flex items-center gap-2 truncate">
            <IconBook className="size-3.5 opacity-60 shrink-0 text-primary" />
            <SelectValue
              placeholder={nivelAcademicoId ? "Curso" : "Selecciona Aula..."}
            />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">Todos los Cursos</SelectItem>
          {filteredCursos.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={tipoId || "all"}
        onValueChange={(v) => meta.setTipoId(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px] bg-background border-border/40 text-[11px] shadow-sm rounded-xl px-3.5 h-10 hover:bg-muted/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <IconClipboardList className="size-3.5 opacity-60 shrink-0 text-primary" />
            <SelectValue placeholder="Tipo" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Tipos</SelectItem>
          {meta?.tipos?.map((t: any) => (
            <SelectItem key={t.id} value={t.id}>
              {t.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={periodoId || "all"}
        onValueChange={(v) => meta.setPeriodoId(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px] bg-background border-border/40 text-[11px] shadow-sm rounded-xl px-3.5 h-10 hover:bg-muted/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <IconCalendar className="size-3.5 opacity-60 shrink-0 text-primary" />
            <SelectValue placeholder="Periodo" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Periodos</SelectItem>
          {meta?.periodos?.map((p: any) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function EvaluacionTable({ data, meta }: EvaluacionTableProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] =
    useState<EvaluacionTableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estadísticas dinámicas locales
  const totalEvaluaciones = data.length;
  const totalNotas = data.reduce((sum, ev) => sum + ev._count.notas, 0);
  const sinCalificar = data.filter((ev) => ev._count.notas === 0).length;
  const promedioGeneral = 14.8; // Escala referencial del ciclo actual

  // Estados para filtros con nuqs (persistidos en URL)
  const [nivelAcademicoId, setNivelAcademicoId] = useQueryState("nivelAcademicoId", parseAsString);
  const [cursoId, setCursoId] = useQueryState("cursoId", parseAsString);
  const [tipoId, setTipoId] = useQueryState("tipoId", parseAsString);
  const [periodoId, setPeriodoId] = useQueryState("periodoId", parseAsString);
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

  const hasActiveFilters =
    !!nivelAcademicoId || !!cursoId || !!tipoId || !!periodoId || !!searchQuery;

  const clearFilters = () => {
    setNivelAcademicoId(null);
    setCursoId(null);
    setTipoId(null);
    setPeriodoId(null);
    setSearchQuery("");
    setPage(1);
  };

  const columns = React.useMemo(
    () =>
      getEvaluacionColumns({
        meta,
        setSelectedEvaluacion,
        setShowDeleteModal,
      }),
    [meta],
  );

  const onConfirm = async () => {
    if (!selectedEvaluacion) return;
    setIsDeleting(true);
    try {
      const res = await deleteEvaluacionAction({ id: selectedEvaluacion.id });
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <EvaluacionStats
        totalEvaluaciones={totalEvaluaciones}
        totalNotas={totalNotas}
        sinCalificar={sinCalificar}
        promedioGeneral={promedioGeneral}
      />

      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => router.push(`/evaluaciones/${row.id}/notas`)}
        searchKey="nombre"
        searchPlaceholder="Buscar por nombre..."
        stackFilters={true}
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
            tipoId: false,
            nivelAcademicoId: false,
            cursoId: false,
            periodoId: false,
          },
        }}
      >
        {(table: any) => (
          <EvaluacionFilters
            table={table}
            nivelAcademicoId={nivelAcademicoId}
            cursoId={cursoId}
            tipoId={tipoId}
            periodoId={periodoId}
            meta={{
              ...meta,
              nivelAcademicoId,
              setNivelAcademicoId,
              cursoId,
              setCursoId,
              tipoId,
              setTipoId,
              periodoId,
              setPeriodoId,
            }}
          />
        )}
      </DataTable>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirm}
        loading={isDeleting}
        title="Eliminar Evaluación"
        description={`¿Estás seguro de eliminar la evaluación "${selectedEvaluacion?.nombre}"? Esta acción no se puede deshacer y eliminará todas las calificaciones asociadas.`}
      />
    </div>
  );
}
