"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconMapPin,
  IconBulb,
  IconPlus,
  IconClock,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventDailyAgendaProps {
  selectedDay: Date;
  selectedDayEvents: any[];
  selectedDayHolidays: any[];
  onSelectEvent: (event: any) => void;
  onOpenCreateModal: () => void;
}

export function EventDailyAgenda({
  selectedDay,
  selectedDayEvents,
  selectedDayHolidays,
  onSelectEvent,
  onOpenCreateModal,
}: EventDailyAgendaProps) {
  return (
    <div className="lg:col-span-4 h-full">
      <Card className="border-border/40 bg-card/80 shadow-xl h-full flex flex-col rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 p-4 border-b border-border/30">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Agenda del Día
            </p>
            <h3 className="text-base font-bold text-foreground capitalize">
              {format(selectedDay, "EEEE, d 'de' MMMM", { locale: es })}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[300px]">
          {/* Feriados */}
          {selectedDayHolidays.length > 0 && (
            <div className="space-y-2">
              {selectedDayHolidays.map((holiday) => (
                <div
                  key={holiday.name}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Feriado Nacional
                  </p>
                  <h4 className="text-xs font-bold text-foreground mt-0.5">
                    {holiday.name}
                  </h4>
                </div>
              ))}
            </div>
          )}

          {/* Eventos */}
          {selectedDayEvents.length === 0 &&
          selectedDayHolidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60 space-y-2">
              <div className="size-12 rounded-2xl bg-muted/20 flex items-center justify-center">
                <IconBulb className="size-6 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                Sin eventos agendados
              </p>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                No hay actividades registradas para este día.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDayEvents.map((evento) => (
                <div
                  key={evento.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver evento ${evento.titulo}`}
                  onClick={() => onSelectEvent(evento)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectEvent(evento);
                    }
                  }}
                  className="p-3 rounded-xl border border-border/40 hover:border-indigo-500/40 bg-background/50 hover:bg-background transition-[background-color,border-color] cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      className={cn(
                        "text-[9px] font-bold uppercase px-2 py-0.5 rounded-md",
                        evento.tipo === "ACADEMICO"
                          ? "bg-indigo-600 text-white"
                          : "bg-emerald-600 text-white",
                      )}
                    >
                      {evento.tipo || "EVENTO"}
                    </Badge>
                    <span className="text-[10px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                      <IconClock className="size-3" />
                      {evento.horaInicio} - {evento.horaFin}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-foreground line-clamp-2">
                    {evento.titulo}
                  </h4>

                  {evento.ubicacion && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium truncate">
                      <IconMapPin className="size-3 text-indigo-500" />
                      {evento.ubicacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="p-4 bg-muted/10 border-t border-border/30">
          <Button
            onClick={onOpenCreateModal}
            className="w-full rounded-xl h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
          >
            <IconPlus className="size-4" />
            <span>Programar Nuevo Evento</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
