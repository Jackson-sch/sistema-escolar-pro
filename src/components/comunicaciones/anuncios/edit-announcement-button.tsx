"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPencil } from "@tabler/icons-react"
import { AnnouncementForm } from "@/components/comunicaciones/anuncios/announcement-form"
import { FormModal } from "@/components/modals/form-modal"

interface EditAnnouncementButtonProps {
  anuncio: any
}

export function EditAnnouncementButton({ anuncio }: EditAnnouncementButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="size-8 rounded-full transition-colors"
      >
        <IconPencil className="size-4" />
      </Button>

      <FormModal
        title="Editar Anuncio"
        description="Actualice los detalles del comunicado institucional."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[600px]"
      >
        <AnnouncementForm
          id={anuncio.id}
          initialData={anuncio}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  )
}
