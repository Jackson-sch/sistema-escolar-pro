"use client";

import { useState } from "react";
import { IconEdit, IconTrash, IconGripVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteCapacityAction } from "@/actions/competencies";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { CapacityForm } from "@/components/gestion/academico/cursos/capacity-form";

export interface CapacidadWithRelations {
  id: string;
  nombre: string;
  descripcion?: string | null;
  [key: string]: any;
}

interface CapacityItemProps {
  cap: CapacidadWithRelations;
  compId: string;
}

export function CapacityItem({ cap, compId }: CapacityItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteCapacityAction(cap.id);
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
      <div className="flex items-center gap-3 bg-card border border-border/50 p-3 rounded-xl text-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-2xs group/cap relative">
        <div className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground shrink-0 transition-colors">
          <IconGripVertical className="size-4" />
        </div>
        <div className="flex-1 space-y-0.5 min-w-0 pr-16">
          <p className="font-semibold text-foreground truncate text-xs">
            {cap.nombre}
          </p>
          {cap.descripcion && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {cap.descripcion}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-card/95 opacity-0 group-hover/cap:opacity-100 transition-opacity rounded-lg p-0.5 border border-border/50 shadow-2xs">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
            onClick={() => setShowEditDialog(true)}
            title="Editar capacidad"
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            onClick={() => setShowConfirmModal(true)}
            title="Eliminar capacidad"
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Capacidad"
        description={`¿Estás seguro de eliminar la capacidad "${cap.nombre}"?`}
      />

      <FormModal
        title="Editar Capacidad"
        description="Actualice la definición de esta capacidad."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-md"
      >
        <CapacityForm
          id={cap.id}
          competenciaId={compId}
          initialData={cap}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>
    </>
  );
}
