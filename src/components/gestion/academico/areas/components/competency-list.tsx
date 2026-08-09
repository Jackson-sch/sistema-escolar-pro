"use client";

import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconPointFilled,
  IconGripVertical,
  IconSparkles,
  IconLayersSubtract,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { toast } from "sonner";
import { deleteCompetencyAction, deleteCapacityAction } from "@/actions/competencies";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { CompetencyForm } from "@/components/gestion/academico/competencias/competency-form";
import { CapacityForm } from "@/components/gestion/academico/cursos/capacity-form";

// Types
interface CapacidadWithRelations {
  id: string;
  nombre: string;
  descripcion?: string | null;
  [key: string]: any;
}

interface CompetenciaWithCapacidades {
  id: string;
  nombre: string;
  descripcion?: string | null;
  capacidades: CapacidadWithRelations[];
  [key: string]: any;
}

interface CompetencyListProps {
  competencies: CompetenciaWithCapacidades[];
  areaId: string;
}

function CapacityItem({ cap, compId }: { cap: CapacidadWithRelations; compId: string }) {
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
      <div className="flex items-center gap-3 bg-background/80 border border-border/40 p-3 rounded-xl text-xs transition-[border-color] hover:border-indigo-500/30 group/cap relative shadow-xs">
        <div className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground shrink-0">
          <IconGripVertical className="size-4" />
        </div>
        <div className="flex-1 space-y-0.5 min-w-0 pr-16">
          <p className="font-bold text-foreground truncate">{cap.nombre}</p>
          {cap.descripcion && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{cap.descripcion}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 opacity-0 group-hover/cap:opacity-100 transition-opacity rounded-lg p-0.5 border border-border/40">
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-6 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md transition-colors"
            onClick={() => setShowEditDialog(true)}
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-6 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors"
            onClick={() => setShowConfirmModal(true)}
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

function CompetencyItem({ comp, index }: { comp: CompetenciaWithCapacidades; index: number }) {
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
        <div className="size-9 rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
          C{index + 1}
        </div>
        
        {/* Card Content */}
        <Card className="flex-1 rounded-2xl border border-border/40 bg-card/80 shadow-xs transition-[border-color,box-shadow] duration-300 hover:border-indigo-500/30 hover:shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground flex items-start gap-1.5 leading-snug">
                  <IconPointFilled className="size-4 text-indigo-500 mt-0.5 shrink-0" />
                  <span>{comp.nombre}</span>
                </h4>
                {comp.descripcion && (
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {comp.descripcion}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-7 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                  onClick={() => setShowEditDialog(true)}
                >
                  <IconEdit className="size-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </div>

            {/* Capacidades Wrapper */}
            <div className="space-y-2.5 bg-muted/30 p-3.5 rounded-xl border border-border/30">
              <div className="flex justify-between items-center px-0.5">
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                  <IconLayersSubtract className="size-3 text-indigo-500" />
                  Capacidades Asociadas
                </h5>
                <Badge variant="outline" className="text-[9px] font-mono font-bold bg-background border-border/40 text-muted-foreground">
                  {comp.capacidades?.length || 0} Capacidades
                </Badge>
              </div>
              
              {comp.capacidades && comp.capacidades.length > 0 ? (
                <div className="space-y-2">
                  {comp.capacidades.map((cap) => (
                    <CapacityItem key={cap.id} cap={cap} compId={comp.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 bg-background/50 rounded-xl border border-dashed border-border/30">
                  <p className="text-xs text-muted-foreground/60 italic">
                    Sin capacidades definidas aún.
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-semibold h-8 border-dashed border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-lg transition-[background-color,border-color] gap-1.5 cursor-pointer mt-1"
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

export function CompetencyList({ competencies, areaId }: CompetencyListProps) {
  if (!competencies || competencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3">
          <IconSparkles className="size-7" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Sin competencias registradas</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Esta área curricular aún no tiene competencias registradas. Puedes agregar la primera competencia o cargar el estándar CNEB.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {competencies.map((comp, index) => (
        <CompetencyItem key={comp.id} comp={comp} index={index} />
      ))}
    </div>
  );
}
