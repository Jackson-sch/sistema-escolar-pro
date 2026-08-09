"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconBulb,
  IconPlus,
  IconClock,
  IconBuildingBank,
  IconBookmark,
} from "@tabler/icons-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ViewEventDialog } from "./view-event-dialog";
import { getPeruvianHolidays } from "@/lib/holidays";
import { FormModal } from "@/components/modals/form-modal";
import { EventForm } from "./event-form";
import { Badge } from "@/components/ui/badge";

interface EventCalendarProps {
  initialEventos: any[];
}

export function EventCalendar({ initialEventos }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [eventToView, setEventToView] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const holidays = useMemo(
    () => getPeruvianHolidays(currentMonth.getFullYear()),
    [currentMonth],
  );

  const getDayHolidays = (day: Date) =>
    holidays.filter((h) => isSameDay(h.date, day));

  const getDayEvents = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return initialEventos.filter((e) => {
      const eventDate = new Date(e.fechaInicio);
      return format(eventDate, "yyyy-MM-dd") === dayStr;
    });
  };

  const selectedDayEvents = getDayEvents(selectedDay);
  const selectedDayHolidays = getDayHolidays(selectedDay);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDay(today);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in animation-duration-">
      {/* Calendario Principal (8/12) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <IconCalendarEvent className="size-5" />
            </div>
            <h2 className="text-xl font-bold capitalize text-foreground tracking-tight">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 px-3 rounded-xl border-border/40 font-semibold text-xs bg-background/80 hover:bg-muted"
            >
              Hoy
            </Button>
            <div className="flex p-1 rounded-xl bg-background/80 border border-border/40">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="size-6 rounded-lg hover:bg-muted"
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="size-6 rounded-lg hover:bg-muted"
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border/40 bg-card/80 shadow-xl overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-border/30 bg-muted/20">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-border/40">
              {calendarDays.map((day) => {
                const dayEvents = getDayEvents(day);
                const dayHolidays = getDayHolidays(day);
                const hasHoliday = dayHolidays.length > 0;
                const isSelected = isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    role="button"
                    tabIndex={0}
                    aria-label={`Seleccionar día ${day.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Lima" })}`}
                    onClick={() => setSelectedDay(day)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedDay(day);
                      }
                    }}
                    className={cn(
                      "min-h-[95px] p-2 bg-background/60 transition-colors cursor-pointer hover:bg-indigo-500/5 group relative flex flex-col justify-between",
                      !isCurrentMonth && "bg-muted/10 opacity-30",
                      isSelected &&
                        "ring-2 ring-indigo-500/50 bg-indigo-500/10 shadow-xs z-10",
                      hasHoliday && "bg-rose-500/5",
                    )}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span
                        className={cn(
                          "text-xs font-bold size-6 flex items-center justify-center rounded-lg transition-[color,background-color,box-shadow] tabular-nums",
                          isDayToday &&
                            "bg-indigo-600 text-white shadow-md shadow-indigo-500/20",
                          isSelected &&
                            !isDayToday &&
                            "text-indigo-600 bg-indigo-500/20",
                          !isSelected &&
                            !isDayToday &&
                            isCurrentMonth &&
                            "text-foreground",
                          hasHoliday && !isDayToday && "text-rose-600 dark:text-rose-400 font-bold",
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {hasHoliday && (
                        <span className="size-2 rounded-full bg-rose-500 animate-pulse" title="Feriado" />
                      )}
                    </div>

                    <div className="mt-1 space-y-1 w-full overflow-hidden">
                      {/* Feriados */}
                      {dayHolidays.map((h) => (
                        <div
                          key={h.name}
                          className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded truncate"
                          title={h.name}
                        >
                          {h.name}
                        </div>
                      ))}

                      {/* Títulos de eventos en píldoras */}
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id ?? e.titulo}
                          className={cn(
                            "text-[9px] font-semibold px-1 py-0.5 rounded truncate text-white",
                            e.tipo === "ACADEMICO" ? "bg-indigo-600" : "bg-emerald-600"
                          )}
                          title={e.titulo}
                        >
                          {e.titulo}
                        </div>
                      ))}

                      {dayEvents.length > 2 && (
                        <div className="text-[9px] font-bold text-muted-foreground text-right pr-1">
                          +{dayEvents.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leyenda */}
        <div className="flex items-center gap-4 px-3.5 py-2.5 rounded-xl bg-background/50 border border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Leyenda:
          </span>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-indigo-600" />
            <span className="text-[11px] font-medium text-foreground">
              Académico
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-medium text-foreground">
              Institucional
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500" />
            <span className="text-[11px] font-medium text-foreground">
              Feriado Nacional
            </span>
          </div>
        </div>
      </div>

      {/* Agenda Lateral (4/12) */}
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
                    onClick={() => setEventToView(evento)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEventToView(evento);
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
                            : "bg-emerald-600 text-white"
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
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full rounded-xl h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
            >
              <IconPlus className="size-4" />
              <span>Programar Nuevo Evento</span>
            </Button>
          </div>
        </Card>
      </div>

      <ViewEventDialog
        evento={eventToView}
        open={!!eventToView}
        onOpenChange={(open) => !open && setEventToView(null)}
      />

      <FormModal
        title="Programar Actividad"
        description="Agregue un nuevo evento al calendario escolar interactivo."
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        className="sm:max-w-[550px]"
      >
        <EventForm
          onSuccess={() => setIsCreateModalOpen(false)}
          initialData={{ fechaInicio: selectedDay, fechaFin: selectedDay }}
        />
      </FormModal>
    </div>
  );
}
