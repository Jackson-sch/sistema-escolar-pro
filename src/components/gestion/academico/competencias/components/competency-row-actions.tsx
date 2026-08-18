"use client";

import { useState } from "react";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { deleteCompetencyAction } from "@/actions/competencies";
import { CompetencyTableType } from "./competency-table-columns";
import { CompetencyForm } from "../competency-form";
import { CapacityForm } from "../../cursos/capacity-form";

interface CompetencyRowActionsProps {
  row: Row<CompetencyTableType>;
}

export function CompetencyRowActions({ row }: CompetencyRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCapacityDialog, setShowCapacityDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const comp = row.original;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteCompetencyAction(comp.id);
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
      label: "Editar Competencia",
      onClick: () => setShowEditDialog(true),
      variant: "ghost",
      className: "text-blue-500",
    },
    {
      icon: IconPlus,
      label: "Añadir Capacidad",
      onClick: () => setShowCapacityDialog(true),
      variant: "ghost",
      className: "text-emerald-500",
    },
    { isSeparator: true },
    {
      icon: IconTrash,
      label: "Eliminar Competencia",
      onClick: () => setShowConfirmModal(true),
      variant: "ghost",
      className: "text-red-600",
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
        title="Eliminar Competencia"
        description={`¿Estás seguro de eliminar la competencia "${comp.nombre}"? Se perderán todas las capacidades asociadas.`}
      />

      <FormModal
        title="Editar Competencia"
        description="Actualice la definición de esta competencia curricular."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-md"
      >
        <CompetencyForm
          id={comp.id}
          initialData={comp}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>

      <FormModal
        title="Nueva Capacidad"
        description={`Añadir capacidad a: ${comp.nombre}`}
        isOpen={showCapacityDialog}
        onOpenChange={setShowCapacityDialog}
        className="sm:max-w-md"
      >
        <CapacityForm
          competenciaId={comp.id}
          onSuccess={() => setShowCapacityDialog(false)}
        />
      </FormModal>
    </>
  );
}
