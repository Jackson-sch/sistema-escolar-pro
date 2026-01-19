"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { IconCalendar, IconMapPin, IconClock, IconUsers, IconInfoCircle } from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ViewEventDialogProps {
  evento: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewEventDialog({ evento, open, onOpenChange }: ViewEventDialogProps) {
  if (!evento) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/40">
        <div className="bg-violet-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <IconCalendar className="size-32 rotate-12" />
          </div>

          <div className="relative z-10 space-y-2">
            <Badge className="bg-white/20 text-white border-white/20 text-[10px] font-bold uppercase tracking-widest">
              {evento.tipo}
            </Badge>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-tight">
                {evento.titulo}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                <div className="size-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <IconCalendar className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Fecha</span>
                  <span className="text-sm font-bold uppercase">
                    {format(new Date(evento.fechaInicio), "eeee, dd 'de' MMMM", { locale: es })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                <div className="size-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <IconClock className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Horario</span>
                  <span className="text-sm font-bold uppercase">{evento.horaInicio} - {evento.horaFin}</span>
                </div>
              </div>

              {evento.ubicacion && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                  <div className="size-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <IconMapPin className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ubicación</span>
                    <span className="text-sm font-bold uppercase">{evento.ubicacion}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                <IconInfoCircle className="size-3.5" /> Descripción del Evento
              </div>
              <div className="p-4 rounded-xl bg-muted/10 border border-border/10 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium">
                {evento.descripcion || "Sin descripción adicional."}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconUsers className="size-4 text-violet-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {evento.publico ? "Evento Público" : "Evento Privado"}
                </span>
              </div>
              <Badge variant="outline" className="font-bold border-violet-500/20 text-violet-500">
                {evento.modalidad}
              </Badge>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
