"use client";

import { useState } from "react";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
  IconTarget,
} from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

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
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { deleteCompetencyAction } from "@/actions/competencies";
import { CompetencyTableType } from "./competency-table-columns";
import { CompetencyForm } from "./competency-form";
import { CapacityForm } from "./capacity-form";

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Gestión</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <IconEdit className="mr-2 h-4 w-4 text-blue-500" />
            Editar Competencia
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCapacityDialog(true)}>
            <IconPlus className="mr-2 h-4 w-4 text-emerald-500" />
            Añadir Capacidad
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowConfirmModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Eliminar Competencia
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
        className="sm:max-w-xl"
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
        className="sm:max-w-xl"
      >
        <CapacityForm
          competenciaId={comp.id}
          onSuccess={() => setShowCapacityDialog(false)}
        />
      </FormModal>
    </>
  );
}
