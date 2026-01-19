"use client"

import { useState } from "react"
import { IconUsers } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FormModal } from "@/components/modals/form-modal"
import { SeccionForm } from "./seccion-form"

interface AddSeccionButtonProps {
  grados: { id: string; nombre: string; nivel: { nombre: string } }[]
  tutores: { id: string; name: string; apellidoPaterno: string; apellidoMaterno: string }[]
  institucionId: string
}

export function AddSeccionButton({ grados, tutores, institucionId }: AddSeccionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              className="h-9 w-9 sm:w-auto sm:px-4"
            >
              <IconUsers className="sm:mr-2 size-4" />
              <span className="hidden sm:inline">Nueva Sección</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Registrar Nueva Sección Académica</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <FormModal
        title="Nueva Sección"
        description="Crea una sección (A, B, C...) para un grado específico."
        isOpen={open}
        onOpenChange={setOpen}
        className="max-w-md"
      >
        <SeccionForm
          grados={grados}
          tutores={tutores}
          institucionId={institucionId}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  )
}
