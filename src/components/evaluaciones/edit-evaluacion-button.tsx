"use client"

import { useState } from "react"
import { IconEdit } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { FormModal } from "../modals/form-modal"
import { EvaluacionForm } from "./evaluacion-form"

interface EditEvaluacionButtonProps {
  evaluacion: any
  tipos: any[]
  periodos: any[]
  cursos: any[]
}

export function EditEvaluacionButton({
  evaluacion,
  tipos,
  periodos,
  cursos
}: EditEvaluacionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setOpen(true)}
          >
            <IconEdit className="size-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Editar evaluación
        </TooltipContent>
      </Tooltip>

      <FormModal
        title="Editar Evaluación"
        description="Modifica los detalles de la actividad académica seleccionada."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[600px]"
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
  )
}
