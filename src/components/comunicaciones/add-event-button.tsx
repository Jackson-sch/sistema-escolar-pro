"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconCalendar } from "@tabler/icons-react"
import { EventForm } from "./event-form"
import { FormModal } from "../modals/form-modal"

export function AddEventButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-border/40 hover:bg-muted/50 transition-all active:scale-95 text-foreground font-bold"
      >
        <IconCalendar className="mr-2 h-4 w-4" /> Nuevo Evento
      </Button>

      <FormModal
        title="Programar Actividad"
        description="Agregue un nuevo evento al calendario escolar interactivo."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[550px]"
      >
        <EventForm
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  )
}
