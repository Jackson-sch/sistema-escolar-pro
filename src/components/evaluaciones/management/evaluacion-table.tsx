"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { DataTable } from "@/components/ui/data-table";
import { EvaluacionStats } from "../reportes/evaluacion-stats";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { deleteEvaluacionAction } from "@/actions/evaluations";
import { getEvaluacionColumns } from "./evaluacion-columns";
import { EvaluacionFilters } from "./evaluacion-filters";
import { useEvaluacionTableStats } from "./use-evaluacion-table-stats";

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
    nivelAcademico: {
      id: string;
      seccion: string;
      grado: { id: string; nombre: string };
      nivel?: { id: string; nombre: string } | null;
    };
  };
  periodo: { id: string; nombre: string };
  capacidad: {
    id: string;
    nombre: string;
    competencia: { nombre: string };
  } | null;
  notas?: { valor: number }[];
  _count: { notas: number };
};

interface EvaluacionTableProps {
  data: EvaluacionTableType[];
  meta?: any;
}

export function EvaluacionTable({ data, meta }: EvaluacionTableProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] =
    useState<EvaluacionTableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para filtros con nuqs (persistidos en URL)
  const [nivelId, setNivelId] = useQueryState("nivelId", parseAsString);
  const [gradoId, setGradoId] = useQueryState("gradoId", parseAsString);
  const [nivelAcademicoId, setNivelAcademicoId] = useQueryState(
    "nivelAcademicoId",
    parseAsString,
  );
  const [cursoId, setCursoId] = useQueryState("cursoId", parseAsString);
  const [tipoId, setTipoId] = useQueryState("tipoId", parseAsString);
  const [periodoId, setPeriodoId] = useQueryState("periodoId", parseAsString);
  const [estado, setEstado] = useQueryState("estado", parseAsString);
  const [searchQuery, setSearchQuery] = useQueryState(
    "nombre",
    parseAsString.withDefault(""),
  );

  // Paginación con nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  // Cálculo reactivo de estadísticas y filtros
  const {
    totalEvaluaciones,
    totalGlobal,
    totalNotas,
    sinCalificar,
    promedioGeneral,
    hasActiveFilters,
  } = useEvaluacionTableStats(data, {
    searchQuery,
    nivelId,
    gradoId,
    nivelAcademicoId,
    cursoId,
    tipoId,
    periodoId,
    estado,
  });

  const clearFilters = () => {
    setNivelId(null);
    setGradoId(null);
    setNivelAcademicoId(null);
    setCursoId(null);
    setTipoId(null);
    setPeriodoId(null);
    setEstado(null);
    setSearchQuery("");
    setPage(1);
  };

  const columns = useMemo(
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
        totalGlobal={totalGlobal}
        isFiltered={hasActiveFilters}
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
        pageIndex={page - 1}
        pageSize={limit}
        onPageIndexChange={(index) => setPage(index + 1)}
        onPageSizeChange={setLimit}
        showColumnVisibility={false}
        initialState={{
          columnVisibility: {
            tipoId: false,
            nivelId: false,
            gradoId: false,
            nivelAcademicoId: false,
            cursoId: false,
            periodoId: false,
            estadoNotas: false,
          },
        }}
      >
        {(table: any) => (
          <EvaluacionFilters
            table={table}
            nivelId={nivelId}
            gradoId={gradoId}
            nivelAcademicoId={nivelAcademicoId}
            cursoId={cursoId}
            tipoId={tipoId}
            periodoId={periodoId}
            estado={estado}
            onClearFilters={clearFilters}
            meta={{
              ...meta,
              nivelId,
              setNivelId,
              gradoId,
              setGradoId,
              nivelAcademicoId,
              setNivelAcademicoId,
              cursoId,
              setCursoId,
              tipoId,
              setTipoId,
              periodoId,
              setPeriodoId,
              estado,
              setEstado,
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
