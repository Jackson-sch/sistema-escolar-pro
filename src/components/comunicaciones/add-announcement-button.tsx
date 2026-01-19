"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconSpeakerphone } from "@tabler/icons-react"
import { AnnouncementForm } from "./announcement-form"
import { FormModal } from "../modals/form-modal"

export function AddAnnouncementButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/20 transition-all active:scale-95"
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
