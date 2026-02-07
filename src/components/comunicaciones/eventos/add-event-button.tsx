"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconCalendar } from "@tabler/icons-react"
import { EventForm } from "@/components/comunicaciones/eventos/event-form"
import { FormModal } from "@/components/modals/form-modal"

export function AddEventButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="rounded-full text-foreground font-bold"
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
