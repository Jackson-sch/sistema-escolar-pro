"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormModal } from "@/components/modals/form-modal";
import { EvaluacionForm } from "./evaluacion-form";

interface AddEvaluacionButtonProps {
  tipos: any[];
  periodos: any[];
  cursos: any[];
}

export function AddEvaluacionButton({
  tipos,
  periodos,
  cursos,
}: AddEvaluacionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="rounded-full shadow-lg transition-all active:scale-95"
          >
            <IconPlus className="mr-2 size-4" />
            Nueva Evaluación
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-pretty">
          Planifica una nueva actividad académica definiendo su peso y fecha
          para el registro de calificaciones.
        </TooltipContent>
      </Tooltip>

      <FormModal
        title="Programar Evaluación"
        description="Planifica una nueva actividad académica definiendo su peso y fecha para el registro de calificaciones."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[600px]"
      >
        <EvaluacionForm
          tipos={tipos}
          periodos={periodos}
          cursos={cursos}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  );
}
