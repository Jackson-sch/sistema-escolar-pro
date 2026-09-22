"use client";

import { useState } from "react";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconPointFilled,
  IconLayersSubtract,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { deleteCompetencyAction } from "@/actions/competencies";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { CompetencyForm } from "@/components/gestion/academico/competencias/competency-form";
import { CapacityForm } from "@/components/gestion/academico/cursos/capacity-form";
import { CapacityItem, type CapacidadWithRelations } from "./capacity-item";

export interface CompetenciaWithCapacidades {
  id: string;
  nombre: string;
  descripcion?: string | null;
  capacidades: CapacidadWithRelations[];
  [key: string]: any;
}

interface CompetencyItemProps {
  comp: CompetenciaWithCapacidades;
  index: number;
}

export function CompetencyItem({ comp, index }: CompetencyItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCapacityDialog, setShowCapacityDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className="relative flex flex-col md:flex-row items-start gap-4 group">
        {/* Timeline Index Badge */}
        <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 border border-indigo-400/30">
          C{index + 1}
        </div>

        {/* Card Content */}
        <Card className="flex-1 rounded-2xl border border-border/50 bg-card shadow-xs transition-[border-color,box-shadow] duration-300 hover:border-indigo-500/30 hover:shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-bold text-sm text-foreground flex items-start gap-2 leading-snug">
                  <IconPointFilled className="size-4 text-indigo-500 mt-0.5 shrink-0" />
                  <span>{comp.nombre}</span>
                </h4>
                {comp.descripcion && (
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {comp.descripcion}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded-xl border border-border/40">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                  onClick={() => setShowEditDialog(true)}
                  title="Editar competencia"
                >
                  <IconEdit className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                  onClick={() => setShowConfirmModal(true)}
                  title="Eliminar competencia"
                >
                  <IconTrash className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Capacidades Wrapper */}
            <div className="space-y-3 bg-muted/20 dark:bg-background/40 p-4 rounded-xl border border-border/40">
              <div className="flex justify-between items-center px-0.5">
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconLayersSubtract className="size-3.5 text-indigo-500" />
                  Capacidades Asociadas
                </h5>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono font-bold bg-background/80 border-border/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full"
                >
                  {comp.capacidades?.length || 0}{" "}
                  {comp.capacidades?.length === 1 ? "Capacidad" : "Capacidades"}
                </Badge>
              </div>

              {comp.capacidades && comp.capacidades.length > 0 ? (
                <div className="space-y-2">
                  {comp.capacidades.map((cap) => (
                    <CapacityItem key={cap.id} cap={cap} compId={comp.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-background/50 rounded-xl border border-dashed border-border/40">
                  <p className="text-xs text-muted-foreground/70 italic">
                    Sin capacidades definidas aún.
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold h-8.5 border-dashed border-indigo-500/40 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors duration-200 gap-1.5 cursor-pointer mt-1"
                onClick={() => setShowCapacityDialog(true)}
              >
                <IconPlus className="size-3.5" />
                <span>Añadir Capacidad</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
        description="Añada una capacidad asociada a esta competencia curricular."
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
