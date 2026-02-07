"use client"

import { useState } from "react"
import { IconUsersPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ConceptoFormDialog } from "./concepto-form-dialog"

interface AddConceptoButtonProps {
  institucionId: string
}

export function AddConceptoButton({ institucionId }: AddConceptoButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full"
          >
            <IconUsersPlus className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Concepto</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Nuevo Concepto</p>
        </TooltipContent>
      </Tooltip>

      <ConceptoFormDialog
        open={open}
        onOpenChange={setOpen}
        institucionId={institucionId}
      />
    </>
  )
}
