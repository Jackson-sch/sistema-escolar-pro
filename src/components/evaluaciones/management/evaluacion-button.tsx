"use client";

import { useState } from "react";
import { IconPlus, IconEdit } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormModal } from "@/components/modals/form-modal";
import { EvaluacionForm } from "./evaluacion-form";

interface EvaluacionButtonProps {
  evaluacion?: any;
  tipos: any[];
  periodos: any[];
  cursos: any[];
  mode?: "add" | "edit";
}

export function EvaluacionButton({
  evaluacion,
  tipos,
  periodos,
  cursos,
  mode = evaluacion ? "edit" : "add",
}: EvaluacionButtonProps) {
  const [open, setOpen] = useState(false);
  const isEdit = mode === "edit";

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          {isEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setOpen(true)}
            >
              <IconEdit className="size-4" />
              <span className="sr-only">Editar</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="rounded-full shadow-lg transition-transform active:scale-95"
            >
              <IconPlus className="mr-2 size-4" />
              Nueva Evaluación
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent className={isEdit ? undefined : "max-w-50 text-pretty"}>
          {isEdit
            ? "Editar evaluación"
            : "Planifica una nueva actividad académica definiendo su peso y fecha para el registro de calificaciones."}
        </TooltipContent>
      </Tooltip>

      <FormModal
        title={isEdit ? "Editar Evaluación" : "Programar Evaluación"}
        description={
          isEdit
            ? "Modifica los detalles de la actividad académica seleccionada."
            : "Planifica una nueva actividad académica definiendo su peso y fecha para el registro de calificaciones."
        }
        isOpen={open}
        onOpenChange={setOpen}
        className={isEdit ? "sm:max-w-[600px]" : "sm:max-w-lg"}
      >
        <EvaluacionForm
          initialData={evaluacion}
          tipos={tipos}
          periodos={periodos}
          cursos={cursos}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  );
}

export { EvaluacionButton as AddEvaluacionButton, EvaluacionButton as EditEvaluacionButton };
