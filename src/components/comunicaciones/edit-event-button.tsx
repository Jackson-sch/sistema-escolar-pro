"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPencil } from "@tabler/icons-react"
import { EventForm } from "./event-form"
import { FormModal } from "../modals/form-modal"

interface EditEventButtonProps {
  evento: any
}

export function EditEventButton({ evento }: EditEventButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="size-8 rounded-full hover:bg-violet-500/10 hover:text-violet-500 transition-colors"
      >
        <IconPencil className="size-4" />
      </Button>

      <FormModal
        title="Editar Evento"
        description="Actualice la programación del evento."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[500px]"
      >
        <EventForm
          id={evento.id}
          initialData={evento}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  )
}
