"use client"

import { useState } from "react"
import { IconFilePlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EnrollmentForm } from "./enrollment-form"
import { FormModal } from "@/components/modals/form-modal"

interface AddEnrollmentButtonProps {
  nivelesAcademicos: any[]
}

export function AddEnrollmentButton({ nivelesAcademicos }: AddEnrollmentButtonProps) {
  const [open, setOpen] = useState(false)
  const year = new Date().getFullYear()

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              className="h-9 w-9 sm:w-auto sm:px-4 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
            >
              <IconFilePlus className="sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Nueva Matrícula</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Nueva Matrícula</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <FormModal
        title={`Inscripción Académica ${year}`}
        description="Complete los datos para formalizar la vacante del estudiante en el nuevo periodo lectivo."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-4xl"
      >
        <EnrollmentForm
          onSuccess={() => setOpen(false)}
          nivelesAcademicos={nivelesAcademicos}
        />
      </FormModal>
    </>
  )
}
