"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormModal } from "@/components/modals/form-modal";
import { EstadoUsuarioForm } from "./estado-usuario-form";
import { deleteUserStateAction } from "@/actions/user-states";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={state.sistemico}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
