"use client"

import { AnnouncementCard } from "./announcement-card"
import { IconSpeakerphone } from "@tabler/icons-react"

interface AnnouncementListProps {
  initialAnuncios: any[]
}

export function AnnouncementList({ initialAnuncios }: AnnouncementListProps) {
  if (initialAnuncios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/40 rounded-2xl bg-muted/5 text-muted-foreground/40 p-12 text-center">
        <IconSpeakerphone className="size-16 mb-4 opacity-10" />
        <h3 className="text-xl font-bold mb-2 text-foreground/40 italic">No hay comunicados</h3>
        <p className="text-sm max-w-sm">No existen anuncios publicados recientemente para tu perfil o nivel académico.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialAnuncios.map((anuncio) => (
        <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
      ))}
    </div>
  )
}
