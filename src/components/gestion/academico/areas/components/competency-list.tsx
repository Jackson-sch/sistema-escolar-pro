"use client";

import { format } from "date-fns";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconCheck, 
  IconPointFilled,
  IconGripVertical
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

function CapacityItem({ cap, compId }: { cap: CapacidadWithRelations, compId: string }) {
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
      <div className="flex gap-3 bg-background border border-border/50 p-3 rounded-lg text-sm transition-colors hover:border-border group/cap relative">
        <div className="mt-0.5 cursor-grab text-muted-foreground/30 hover:text-muted-foreground shrink-0">
           <IconGripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1 min-w-0 pr-16">
          <p className="font-medium truncate">{cap.nombre}</p>
          {cap.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-2">{cap.descripcion}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="absolute top-2.5 right-2 flex gap-1 bg-background/80 backdrop-blur-sm opacity-0 group-hover/cap:opacity-100 transition-opacity rounded-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-primary"
            onClick={() => setShowEditDialog(true)}
          >
            <IconEdit className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => setShowConfirmModal(true)}
          >
            <IconTrash className="w-3.5 h-3.5" />
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

function CompetencyItem({ comp, index }: { comp: CompetenciaWithCapacidades, index: number }) {
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
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
        {/* Timeline Node */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted-foreground/20 text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/30">
          <span className="text-xs font-bold leading-none">C{index + 1}</span>
        </div>
        
        {/* Card Content */}
        <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm border bg-background/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
          <CardContent className="p-5">
             <div className="flex justify-between items-start mb-3 gap-4">
                <div>
                  <h4 className="font-bold text-base leading-tight flex items-start gap-2">
                     <span className="text-primary mt-0.5"><IconPointFilled className="w-4 h-4" /></span> 
                     {comp.nombre}
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {comp.descripcion || "Sin descripción proporcionada."}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <IconEdit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    <IconTrash className="w-4 h-4" />
                  </Button>
                </div>
             </div>

             {/* Capacidades Wrapper */}
             <div className="mt-5 space-y-3 bg-muted/30 p-4 rounded-xl border border-dashed">
               <div className="flex justify-between items-center mb-1">
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Capacidades Asociadas</h5>
                  <Badge variant="outline" className="text-[10px] bg-background border-border/50">
                    {comp.capacidades?.length || 0} Registros
                  </Badge>
               </div>
               
               {comp.capacidades && comp.capacidades.length > 0 ? (
                 comp.capacidades.map((cap, capIdx) => (
                   <CapacityItem key={cap.id} cap={cap} compId={comp.id} />
                 ))
               ) : (
                 <p className="text-xs text-muted-foreground/70 italic p-2 text-center">
                   No se han definido capacidades para esta competencia.
                 </p>
               )}
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="w-full text-xs h-8 border border-dashed hover:border-primary/50 hover:bg-primary/5 mt-2"
                 onClick={() => setShowCapacityDialog(true)}
               >
                 <IconPlus className="w-3 h-3 mr-1" />
                 Añadir Capacidad
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
      <div className="flex flex-col items-center justify-center py-16 text-center h-full">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <IconPlus className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">Sin competencias registradas</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Esta área curricular aún no tiene competencias. Puedes agregar la primera desde el botón superior.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pb-32 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border/60 before:to-transparent">
      {competencies.map((comp, index) => (
        <CompetencyItem key={comp.id} comp={comp} index={index} />
      ))}
    </div>
  );
}
