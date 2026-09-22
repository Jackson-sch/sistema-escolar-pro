"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconListCheck,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSparkles,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { CapacityForm } from "../../cursos/capacity-form";
import { deleteCapacityAction } from "@/actions/competencies";

interface CapacidadItem {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

interface CapacidadesInspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competencia: {
    id: string;
    nombre: string;
    descripcion?: string | null;
    areaCurricular?: {
      nombre: string;
      color?: string | null;
    };
    capacidades: CapacidadItem[];
  };
}

export function CapacidadesInspectDialog({
  open,
  onOpenChange,
  competencia,
}: CapacidadesInspectDialogProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<CapacidadItem | null>(null);
  const [deletingCapacity, setDeletingCapacity] = useState<CapacidadItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingCapacity) return;
    setIsDeleting(true);
    try {
      const res = await deleteCapacityAction(deletingCapacity.id);
      if (res.success) {
        toast.success(res.success);
        setDeletingCapacity(null);
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-md rounded-2xl shadow-xl">
          {/* Header */}
          <div className="p-5 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {competencia.areaCurricular && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-border/60"
                    style={{
                      backgroundColor: `${competencia.areaCurricular.color || "#6366f1"}15`,
                      color: competencia.areaCurricular.color || "#6366f1",
                      borderColor: `${competencia.areaCurricular.color || "#6366f1"}30`,
                    }}
                  >
                    {competencia.areaCurricular.nombre}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                >
                  {competencia.capacidades.length} Capacidades
                </Badge>
              </div>

              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="h-8 px-3 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer"
              >
                <IconPlus className="size-3.5" />
                <span>Añadir</span>
              </Button>
            </div>

            <DialogTitle className="text-base font-bold text-foreground leading-snug">
              {competencia.nombre}
            </DialogTitle>

            {competencia.descripcion ? (
              <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                {competencia.descripcion}
              </DialogDescription>
            ) : (
              <DialogDescription className="text-xs text-muted-foreground/60 italic mt-1">
                Estandarizado según el Currículo Nacional de la Educación Básica (CNEB).
              </DialogDescription>
            )}
          </div>

          {/* Body: Lista de Capacidades */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2.5 max-h-[50vh]">
            {competencia.capacidades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
                  <IconListCheck className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Sin capacidades registradas
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                  Esta competencia aún no cuenta con capacidades articuladas. Agregue una para iniciar.
                </p>
              </div>
            ) : (
              competencia.capacidades.map((cap, idx) => (
                <div
                  key={cap.id}
                  className="group flex items-start justify-between gap-3 p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/30 hover:border-border/80 transition-all duration-150"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className="size-5 rounded-md bg-muted/60 text-muted-foreground text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug break-words">
                        {cap.nombre}
                      </p>
                      {cap.descripcion ? (
                        <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                          {cap.descripcion}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/40 italic">
                          Sin descripción adicional
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg cursor-pointer"
                      onClick={() => setEditingCapacity(cap)}
                      title="Editar capacidad"
                    >
                      <IconEdit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                      onClick={() => setDeletingCapacity(cap)}
                      title="Eliminar capacidad"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between px-5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <IconInfoCircle className="size-3.5 text-primary/70" />
              Criterio de evaluación oficial para registro de notas y conclusiones descriptivas
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Crear Capacidad */}
      <FormModal
        title="Nueva Capacidad"
        description={`Añadir capacidad a: ${competencia.nombre}`}
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        className="sm:max-w-md"
      >
        <CapacityForm
          competenciaId={competencia.id}
          onSuccess={() => {
            setShowAddModal(false);
            router.refresh();
          }}
        />
      </FormModal>

      {/* Modal para Editar Capacidad */}
      {editingCapacity && (
        <FormModal
          title="Editar Capacidad"
          description={`Modificar capacidad de: ${competencia.nombre}`}
          isOpen={!!editingCapacity}
          onOpenChange={(open) => !open && setEditingCapacity(null)}
          className="sm:max-w-md"
        >
          <CapacityForm
            id={editingCapacity.id}
            competenciaId={competencia.id}
            initialData={editingCapacity}
            onSuccess={() => {
              setEditingCapacity(null);
              router.refresh();
            }}
          />
        </FormModal>
      )}

      {/* Confirmar Eliminación */}
      <ConfirmModal
        isOpen={!!deletingCapacity}
        onClose={() => setDeletingCapacity(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Eliminar Capacidad"
        description={`¿Estás seguro de eliminar la capacidad "${deletingCapacity?.nombre}"? Se perderán las relaciones asociadas a criterios de evaluación.`}
      />
    </>
  );
}
