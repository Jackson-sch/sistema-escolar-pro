"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconClock
} from "@tabler/icons-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EditEventButton } from "./edit-event-button"
import { ViewEventDialog } from "./view-event-dialog"

interface EventCalendarProps {
  initialEventos: any[]
}

export function EventCalendar({ initialEventos }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [eventToView, setEventToView] = useState<any>(null)

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const dayEvents = initialEventos.filter(e => isSameDay(new Date(e.fechaInicio), selectedDay))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <Card className="lg:col-span-2 border-border/40 bg-background/95 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <IconCalendarEvent className="size-6 text-violet-500" />
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <IconChevronLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <IconChevronRight className="size-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border/20 rounded-lg overflow-hidden border border-border/40">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
              <div key={d} className="bg-muted/50 p-3 text-center text-[10px] font-bold uppercase tracking-tighter text-muted-foreground opacity-60">
                {d}
              </div>
            ))}
            {days.map((day, idx) => {
              const hasEvents = initialEventos.some(e => isSameDay(new Date(e.fechaInicio), day))
              const isSelected = isSameDay(day, selectedDay)

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-[100px] p-2 bg-background transition-all cursor-pointer hover:bg-muted/30 group relative",
                    !isSameMonth(day, currentMonth) && "opacity-20 pointer-events-none",
                    isSelected && "ring-2 ring-violet-500/50 z-10 bg-violet-500/5"
                  )}
                >
                  <span className={cn(
                    "text-xs font-bold",
                    isSelected ? "text-violet-500" : "text-muted-foreground/70"
                  )}>
                    {format(day, "d")}
                  </span>

                  <div className="mt-2 space-y-1">
                    {initialEventos
                      .filter(e => isSameDay(new Date(e.fechaInicio), day))
                      .slice(0, 2)
                      .map(e => (
                        <div key={e.id} className="text-[9px] font-extrabold uppercase p-1 rounded bg-violet-500/10 text-violet-500 truncate border border-violet-500/20">
                          {e.titulo}
                        </div>
                      ))}
                    {initialEventos.filter(e => isSameDay(new Date(e.fechaInicio), day)).length > 2 && (
                      <div className="text-[8px] font-bold text-muted-foreground/60 pl-1">
                        + {initialEventos.filter(e => isSameDay(new Date(e.fechaInicio), day)).length - 2} más
                      </div>
                    )}
                  </div>

                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-2 right-2 size-1.5 rounded-full bg-violet-500 animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalles del día */}
      <div className="space-y-6">
        <Card className="border-border/40 bg-background/95 backdrop-blur-xl shadow-xl h-full">
          <CardHeader className="border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex flex-col gap-1">
              <span className="text-muted-foreground/60 text-[10px]">Eventos del día</span>
              <span className="text-secondary">{format(selectedDay, "EEEE, d 'de' MMMM", { locale: es })}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/40">
                <IconCalendarEvent className="size-12 mb-2 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest italic">Sin actividades</p>
              </div>
            ) : (
              dayEvents.map(evento => (
                <div
                  key={evento.id}
                  onClick={() => setEventToView(evento)}
                  className="p-4 rounded-xl border border-border/40 bg-muted/5 group hover:border-violet-500/50 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 text-[9px] font-bold uppercase tracking-widest">
                      {evento.tipo}
                    </Badge>
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditEventButton evento={evento} />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold mb-3 leading-tight uppercase group-hover:text-violet-500 transition-colors">
                    {evento.titulo}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                      <IconClock className="size-3.5 text-violet-500/70" />
                      {evento.horaInicio} - {evento.horaFin}
                    </div>
                    {evento.ubicacion && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <IconMapPin className="size-3.5 text-violet-500/70" />
                        {evento.ubicacion}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ViewEventDialog
        evento={eventToView}
        open={!!eventToView}
        onOpenChange={(open) => !open && setEventToView(null)}
      />
    </div>
  )
}
