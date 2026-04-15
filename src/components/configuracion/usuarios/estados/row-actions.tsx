"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { EstadoUsuarioForm } from "./estado-usuario-form";
import { deleteUserStateAction } from "@/actions/user-states";

interface EstadoUsuarioRowActionsProps {
  row: any;
}

export function EstadoUsuarioRowActions({ row }: EstadoUsuarioRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const state = row.original;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserStateAction(state.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setShowDeleteDialog(false);
      }
    } catch (error) {
      toast.error("Error al eliminar el estado");
    } finally {
      setIsDeleting(false);
    }
  };

  const actions: ActionItem[] = [
    {
      icon: Edit as any,
      label: "Editar",
      onClick: () => setShowEditDialog(true),
      variant: "ghost",
    },
    { isSeparator: true },
    {
      icon: Trash2 as any,
      label: "Eliminar",
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
      disabled: state.sistemico,
      tooltip: state.sistemico ? "Estado del sistema (protegido)" : "Eliminar estado",
    },
  ];

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Acciones" />

      <FormModal
        title="Editar Estado de Usuario"
        description="Modifica los parámetros del estado seleccionado."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-[500px]"
      >
        <EstadoUsuarioForm
          initialData={state}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>

      <ConfirmModal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="¿Está absolutamente seguro?"
        description={`Esta acción no se puede deshacer. Esto eliminará permanentemente el estado ${state.nombre} del sistema. Solo se puede eliminar si no tiene usuarios asociados.`}
        variant="danger"
      />
    </>
  );
}
