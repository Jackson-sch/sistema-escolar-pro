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
  IconDotsVertical,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Calendario Principal (8/12) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <IconCalendarEvent className="size-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold capitalize tracking-tighter text-foreground font-display">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-9 px-4 rounded-full border-border/40 bg-muted/20 font-bold text-[10px] uppercase tracking-widest hover:bg-muted/40 transition-all"
            >
              Hoy
            </Button>
            <div className="flex p-1 rounded-full bg-muted/20 border border-border/40">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="size-7 rounded-full hover:bg-background shadow-none"
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="size-7 rounded-full hover:bg-background shadow-none"
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border/40 bg-card p-0 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div
                  key={d}
                  className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-border/50">
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
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-h-[100px] p-3 bg-card/40 transition-all cursor-pointer hover:bg-primary/5 group relative flex flex-col items-end",
                      !isCurrentMonth && "bg-muted/5 opacity-30",
                      isSelected &&
                        "bg-primary/5 ring-inset ring-2 ring-primary/40 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]",
                      hasHoliday && "bg-holiday/5",
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all tabular-nums",
                        isDayToday &&
                          "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                        isSelected &&
                          !isDayToday &&
                          "text-primary bg-primary/10",
                        !isSelected &&
                          !isDayToday &&
                          isCurrentMonth &&
                          "text-foreground",
                        hasHoliday && !isDayToday && "text-holiday",
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    <div className="mt-auto w-full space-y-1.5 pb-1">
                      {/* Holidays indicators */}
                      {dayHolidays.map((h, i) => (
                        <div
                          key={i}
                          className="h-1 w-full bg-holiday/40 rounded-full"
                        />
                      ))}

                      {/* Events Dots */}
                      <div className="flex flex-wrap gap-1 justify-end">
                        {dayEvents.map((e, i) => {
                          const color =
                            e.tipo === "ACADEMICO"
                              ? "bg-academic"
                              : "bg-institutional";
                          return (
                            <div
                              key={i}
                              className={cn(
                                "size-1.5 rounded-full shadow-sm",
                                color,
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-6 px-4 py-3 rounded-2xl bg-muted/10 border border-border/40 mt-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">
            Categorías:
          </span>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-academic" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground/80">
              Académico
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-institutional" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground/80">
              Institucional
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-holiday" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground/80">
              Feriado / Festivo
            </span>
          </div>
        </div>
      </div>

      {/* Agenda Lateral (4/12) */}
      <div className="lg:col-span-4 h-full">
        <Card className="border-border/40 p-0 bg-card/40 backdrop-blur-xl shadow-2xl h-full flex flex-col rounded-3xl overflow-hidden border-2">
          <CardHeader className="bg-muted/10 p-6 border-b border-border/40">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                Agenda del día
              </p>
              <h3 className="text-xl font-bold font-display text-foreground leading-none">
                {format(selectedDay, "EEEE, d 'de' MMMM", { locale: es })}
              </h3>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Holidays Section */}
            {selectedDayHolidays.length > 0 && (
              <div className="space-y-3">
                {selectedDayHolidays.map((holiday, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-holiday/10 border border-holiday/20 relative overflow-hidden group transition-all hover:bg-holiday/15"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-holiday" />
                    <p className="text-[9px] font-black text-holiday uppercase tracking-widest mb-1">
                      Feriado Nacional
                    </p>
                    <h4 className="text-sm font-bold text-foreground">
                      {holiday.name}
                    </h4>
                  </div>
                ))}
              </div>
            )}

            {/* Events Section */}
            {selectedDayEvents.length === 0 &&
            selectedDayHolidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 group">
                <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <IconBulb className="size-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  Sin Actividades
                </p>
                <p className="text-xs italic text-muted-foreground">
                  "La organización es la clave del éxito académico."
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-10 rounded-full border-dashed border-border/60 hover:border-primary/50 text-[10px] uppercase font-bold tracking-widest gap-2"
                >
                  <IconPlus className="size-3" /> Crear primer evento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((evento) => (
                  <div
                    key={evento.id}
                    onClick={() => setEventToView(evento)}
                    className="group relative flex gap-4 p-4 rounded-2xl border border-transparent hover:border-border/40 hover:bg-muted/10 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center py-1">
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          evento.tipo === "ACADEMICO"
                            ? "bg-academic ring-4 ring-academic/10"
                            : "bg-institutional ring-4 ring-institutional/10",
                        )}
                      />
                      <div className="w-px flex-1 bg-border/40 mt-2" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black text-muted-foreground/60 tracking-wider">
                          {evento.horaInicio} - {evento.horaFin}
                        </span>
                        <IconDotsVertical className="size-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1 leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                        {evento.titulo}
                      </h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                        <IconMapPin className="size-3 text-primary/60" />
                        {evento.ubicacion || "Virtual / Por definir"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <div className="p-6 bg-muted/10 border-t border-border/40">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full rounded-full h-11 font-bold text-xs uppercase tracking-[0.15em] shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <IconPlus className="mr-2 size-4" /> Crear Nuevo Evento
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
