"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  IconClipboardList,
  IconCalendar,
  IconSchool,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/data-table";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { deleteEvaluacionAction } from "@/actions/evaluations";
import { useQueryState, parseAsString } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEvaluacionColumns } from "./evaluacion-columns";

export type EvaluacionTableType = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha: string;
  peso: number;
  activa: boolean;
  tipoEvaluacion: { id: string; nombre: string };
  curso: {
    id: string;
    nombre: string;
    areaCurricular: { nombre: string; color: string | null };
    nivelAcademico: { seccion: string; grado: { nombre: string } };
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
  cursoId: string | null;
  tipoId: string | null;
  periodoId: string | null;
  meta: any;
}

function EvaluacionFilters({
  table,
  cursoId,
  tipoId,
  periodoId,
  meta,
}: EvaluacionFiltersProps) {
  useEffect(() => {
    table.getColumn("cursoId")?.setFilterValue(cursoId);
  }, [cursoId, table]);

  useEffect(() => {
    table.getColumn("tipoId")?.setFilterValue(tipoId);
  }, [tipoId, table]);

  useEffect(() => {
    table.getColumn("periodoId")?.setFilterValue(periodoId);
  }, [periodoId, table]);

  return (
    <div className="flex flex-row flex-wrap items-center gap-2.5 w-full">
      <Select
        value={cursoId || "all"}
        onValueChange={(v) => meta.setCursoId(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] bg-background text-[11px] shadow-sm rounded-full px-3">
          <div className="flex items-center gap-2 truncate">
            <IconSchool className="size-3.5 opacity-60 shrink-0" />
            <SelectValue placeholder="Curso" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Cursos</SelectItem>
          {meta?.cursos?.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nombre} - {c.nivelAcademico?.seccion}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={tipoId || "all"}
        onValueChange={(v) => meta.setTipoId(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] bg-background text-[11px] shadow-sm rounded-full px-3">
          <div className="flex items-center gap-2">
            <IconClipboardList className="size-3.5 opacity-60 shrink-0" />
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
        <SelectTrigger className="w-full sm:w-[160px] bg-background text-[11px] shadow-sm rounded-full px-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="size-3.5 opacity-60 shrink-0" />
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] =
    useState<EvaluacionTableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para filtros con nuqs (persistidos en URL)
  const [cursoId, setCursoId] = useQueryState("cursoId", parseAsString);
  const [tipoId, setTipoId] = useQueryState("tipoId", parseAsString);
  const [periodoId, setPeriodoId] = useQueryState("periodoId", parseAsString);
  const [searchQuery, setSearchQuery] = useQueryState(
    "nombre",
    parseAsString.withDefault(""),
  );

  const hasActiveFilters =
    !!cursoId || !!tipoId || !!periodoId || !!searchQuery;

  const clearFilters = () => {
    setCursoId(null);
    setTipoId(null);
    setPeriodoId(null);
    setSearchQuery("");
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
      const res = await deleteEvaluacionAction(selectedEvaluacion.id);
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
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar por nombre..."
        stackFilters={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        meta={meta}
        initialState={{
          columnVisibility: {
            tipoId: false,
            cursoId: false,
            periodoId: false,
          },
        }}
      >
        {(table: any) => (
          <EvaluacionFilters
            table={table}
            cursoId={cursoId}
            tipoId={tipoId}
            periodoId={periodoId}
            meta={{ ...meta, setCursoId, setTipoId, setPeriodoId }}
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
    </>
  );
}
