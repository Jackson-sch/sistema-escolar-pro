"use client";

import * as React from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteConceptoAction,
  toggleConceptoActivoAction,
} from "@/actions/finance";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ConceptoTableType, getConceptoColumns } from "./concepto-columns";
import { ConceptoFormDialog } from "./concepto-form-dialog";
import { ConceptoKpiCards } from "./components/concepto-kpi-cards";
import { ConceptoCardGrid } from "./components/concepto-card-grid";
import { ConceptoPresetsDialog } from "./components/concepto-presets-dialog";
import {
  IconLayoutGrid,
  IconTable,
  IconSparkles,
  IconPlus,
} from "@tabler/icons-react";

interface ConceptoTableProps {
  data: ConceptoTableType[];
  meta?: { institucionId: string };
}

export function ConceptoTable({ data, meta }: ConceptoTableProps) {
  const router = useRouter();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showPresetsDialog, setShowPresetsDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConcepto, setSelectedConcepto] =
    useState<ConceptoTableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );

  const handleEdit = React.useCallback((concepto: ConceptoTableType) => {
    setSelectedConcepto(concepto);
    setShowFormDialog(true);
  }, []);

  const handleDelete = React.useCallback((concepto: ConceptoTableType) => {
    setSelectedConcepto(concepto);
    setShowDeleteModal(true);
  }, []);

  const handleToggleActivo = React.useCallback(
    async (concepto: ConceptoTableType, activo: boolean) => {
      try {
        const res = await toggleConceptoActivoAction({
          id: concepto.id,
          activo,
        });
        if (res.success) {
          toast.success(res.success as string);
          router.refresh();
        }
        if (res.error) toast.error(res.error);
      } catch {
        toast.error("Error al cambiar el estado del concepto.");
      }
    },
    [router],
  );

  const handleConfirmDelete = async () => {
    if (!selectedConcepto) return;
    setIsDeleting(true);
    try {
      const res = await deleteConceptoAction({ id: selectedConcepto.id });
      if (res.success) {
        toast.success(res.success as string);
        setShowDeleteModal(false);
        setSelectedConcepto(null);
        router.refresh();
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = React.useMemo(
    () =>
      getConceptoColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleActivo: handleToggleActivo,
      }),
    [handleEdit, handleDelete, handleToggleActivo],
  );

  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  // Filtrado de datos
  const filteredData = React.useMemo(() => {
    return data.filter((c) => {
      const matchSearch =
        searchQuery === "" ||
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.activo) ||
        (statusFilter === "inactive" && !c.activo);
      return matchSearch && matchStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  React.useEffect(() => {
    if (page > totalPages && filteredData.length > 0) {
      setPage(1);
    }
  }, [page, totalPages, filteredData.length, setPage]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ── 1. RESUMEN KPIS DEL CATÁLOGO ── */}
      <ConceptoKpiCards conceptos={data} />

      {/* ── 2. BARRA DE HERRAMIENTAS Y VISTA ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Filtros de estado */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border/50 rounded-xl">
          <Button
            variant={statusFilter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="h-7 text-xs rounded-lg px-2.5 cursor-pointer"
          >
            Todos ({data.length})
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("active")}
            className="h-7 text-xs rounded-lg px-2.5 cursor-pointer"
          >
            Activos ({data.filter((c) => c.activo).length})
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
            className="h-7 text-xs rounded-lg px-2.5 cursor-pointer"
          >
            Inactivos ({data.filter((c) => !c.activo).length})
          </Button>
        </div>

        {/* Acciones & Vista Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresetsDialog(true)}
            className="rounded-xl text-xs font-bold gap-1.5 h-9 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 cursor-pointer shadow-2xs"
          >
            <IconSparkles className="size-4 text-amber-500" />
            <span>Plantillas Rápidas</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedConcepto(null);
              setShowFormDialog(true);
            }}
            className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-primary text-primary-foreground cursor-pointer shadow-2xs"
          >
            <IconPlus className="size-4" />
            <span>Nuevo Concepto</span>
          </Button>

          <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border/50 rounded-xl">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="size-7 rounded-lg cursor-pointer"
              title="Vista en Tabla"
            >
              <IconTable className="size-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="size-7 rounded-lg cursor-pointer"
              title="Vista en Tarjetas"
            >
              <IconLayoutGrid className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. CONTENIDO PRINCIPAL: TABLA O GRID ── */}
      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKey="nombre"
          searchPlaceholder="Buscar concepto por nombre..."
          searchValue={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setPage(1);
          }}
          onClearFilters={clearFilters}
          hasActiveFilters={searchQuery !== "" || statusFilter !== "all"}
          meta={meta}
          pageIndex={page - 1}
          pageSize={limit}
          onPageIndexChange={(index) => setPage(index + 1)}
          onPageSizeChange={setLimit}
          showColumnVisibility={false}
        />
      ) : (
        <ConceptoCardGrid
          conceptos={filteredData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActivo={handleToggleActivo}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedConcepto(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Eliminar Concepto de Pago"
        description={`¿Estás seguro de eliminar el concepto "${selectedConcepto?.nombre}"? Si tiene cuotas o pagos asociados, se desactivará automáticamente para preservar el historial.`}
      />

      {/* Dialog de Creación y Edición */}
      <ConceptoFormDialog
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) setSelectedConcepto(null);
        }}
        concepto={selectedConcepto}
        institucionId={meta?.institucionId || ""}
      />

      {/* Dialog de Plantillas Rápidas */}
      <ConceptoPresetsDialog
        open={showPresetsDialog}
        onOpenChange={setShowPresetsDialog}
        institucionId={meta?.institucionId || ""}
      />
    </div>
  );
}
