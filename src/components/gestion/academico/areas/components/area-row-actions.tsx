"use client";

import { useState } from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { deleteAreaAction } from "@/actions/academic";
import { AreaForm } from "../area-form";
import { AreaTableType } from "./area-table-columns";

interface AreaRowActionsProps {
  row: Row<AreaTableType>;
  table: Table<AreaTableType>;
}

export function AreaRowActions({ row, table }: AreaRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const area = row.original;

  // Acceso correcto a los metadatos de la tabla
  const meta = table.options.meta as any;
  const institucionId = meta?.institucionId || "";
  const niveles = meta?.niveles || [];

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAreaAction(area.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const actions: ActionItem[] = [
    {
      icon: IconEdit,
      label: "Editar Área",
      onClick: () => setShowEditDialog(true),
      variant: "ghost",
      className: "text-indigo-500",
    },
    { isSeparator: true },
    {
      icon: IconTrash,
      label: "Eliminar Área",
      onClick: () => setShowConfirmModal(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Gestión" />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Área Curricular"
        description={`¿Estás seguro de eliminar el área "${area.nombre}"? Esta acción no se puede deshacer y afectará a los cursos asociados.`}
      />

      <FormModal
        title="Editar Área Curricular"
        description="Actualice los datos generales, el código o el color distintivo del área académica."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-md"
      >
        <AreaForm
          id={area.id}
          initialData={area}
          institucionId={institucionId}
          niveles={niveles}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>
    </>
  );
}
