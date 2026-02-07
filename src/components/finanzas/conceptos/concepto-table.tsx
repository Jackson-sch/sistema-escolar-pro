"use client";

import * as React from "react";
import { useQueryState, parseAsString } from "nuqs";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";

import { deleteConceptoAction } from "@/actions/finance";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ConceptoTableType, getConceptoColumns } from "./concepto-columns";
import { ConceptoFormDialog } from "./concepto-form-dialog";

interface ConceptoTableProps {
  data: ConceptoTableType[];
  meta?: { institucionId: string };
}

export function ConceptoTable({ data, meta }: ConceptoTableProps) {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConcepto, setSelectedConcepto] =
    useState<ConceptoTableType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (concepto: ConceptoTableType) => {
    setSelectedConcepto(concepto);
    setShowFormDialog(true);
  };

  const handleDelete = (concepto: ConceptoTableType) => {
    setSelectedConcepto(concepto);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConcepto) return;
    setIsDeleting(true);
    try {
      const res = await deleteConceptoAction({ id: selectedConcepto.id });
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
        setSelectedConcepto(null);
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
      }),
    [],
  );

  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar concepto..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        hasActiveFilters={searchQuery !== ""}
        meta={meta}
      />

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
        description={`¿Estás seguro de eliminar el concepto "${selectedConcepto?.nombre}"? Esta acción no se puede deshacer.`}
      />

      {/* Dialog de Edición */}
      <ConceptoFormDialog
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) setSelectedConcepto(null);
        }}
        concepto={selectedConcepto}
        institucionId={meta?.institucionId || ""}
      />
    </>
  );
}
