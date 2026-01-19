"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconPin, IconAlertTriangle, IconEye, IconCalendar } from "@tabler/icons-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/formats"
import Image from "next/image"

interface ViewAnnouncementDialogProps {
  anuncio: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewAnnouncementDialog({ anuncio, open, onOpenChange }: ViewAnnouncementDialogProps) {
  if (!anuncio) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/40">
        <ScrollArea className="max-h-[90vh]">
          {anuncio.imagen && (
            <div className="w-full aspect-video relative overflow-hidden">
              <Image
                src={anuncio.imagen}
                alt={anuncio.titulo}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <DialogHeader className="sr-only">
              <DialogTitle>{anuncio.titulo}</DialogTitle>
              <DialogDescription>{anuncio.resumen}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-2 items-center flex-wrap">
                  {anuncio.fijado && (
                    <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      <IconPin className="size-3.5 mr-1.5" /> Fijado
                    </Badge>
                  )}
                  {anuncio.urgente && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      <IconAlertTriangle className="size-3.5 mr-1.5" /> Urgente
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] font-bold px-3 py-1 uppercase tracking-widest border-border/40 text-muted-foreground/60">
                    Dirigido a: {anuncio.dirigidoA}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar className="size-3.5" /> {formatDate(anuncio.fechaPublicacion, "dd 'de' MMMM, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconEye className="size-3.5" /> {anuncio.vistas}
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tight text-primary leading-none">
                {anuncio.titulo}
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground font-medium leading-relaxed italic border-l-4 border-violet-500/50 pl-4 bg-violet-500/5 py-4 rounded-r-xl">
                {anuncio.resumen}
              </p>

              <div className="mt-8 text-base text-foreground/90 leading-loose whitespace-pre-wrap font-medium">
                {anuncio.contenido}
              </div>
            </div>

            <div className="pt-8 border-t border-border/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border-2 border-violet-500/20">
                  <AvatarImage src={anuncio.autor?.image} />
                  <AvatarFallback className="bg-violet-500/10 text-violet-500 font-bold">
                    {anuncio.autor?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-wider text-primary">
                    {anuncio.autor?.name} {anuncio.autor?.apellidoPaterno}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                    Autor de la publicación
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
