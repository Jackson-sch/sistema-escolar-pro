"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconSpeakerphone } from "@tabler/icons-react"
import { AnnouncementForm } from "@/components/comunicaciones/anuncios/announcement-form"
import { FormModal } from "@/components/modals/form-modal"

export function AddAnnouncementButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full transition-all active:scale-95"
      >
        <IconSpeakerphone className="mr-2 h-4 w-4" /> Crear Anuncio
      </Button>

      <FormModal
        title="Nuevo Anuncio Institucional"
        description="Publique información relevante para la comunidad educativa."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[600px]"
      >
        <AnnouncementForm
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  )
}
