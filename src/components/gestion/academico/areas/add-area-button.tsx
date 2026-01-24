"use client"

import { useState } from "react"
import { IconBooks } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FormModal } from "@/components/modals/form-modal"
import { AreaForm } from "./area-form"

interface AddAreaButtonProps {
  institucionId: string
}

export function AddAreaButton({ institucionId }: AddAreaButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              className="h-9 w-9 sm:w-auto sm:px-4 rounded-full"
            >
              <IconBooks className="sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Nueva Área</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Registrar Nueva Área Académica</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <FormModal
        title="Configuración de Malla"
        description="Defina una nueva categoría pedagógica para organizar los cursos de la institución."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-md"
      >
        <AreaForm
          institucionId={institucionId}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  )
}
