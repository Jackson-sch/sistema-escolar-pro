"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventCalendarGridProps {
  currentMonth: Date;
  selectedDay: Date;
  calendarDays: Date[];
  onSelectDay: (day: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  getDayEvents: (day: Date) => any[];
  getDayHolidays: (day: Date) => any[];
}

export function EventCalendarGrid({
  currentMonth,
  selectedDay,
  calendarDays,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToday,
  getDayEvents,
  getDayHolidays,
}: EventCalendarGridProps) {
  return (
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
            onClick={onToday}
            className="h-8 px-3 rounded-xl border-border/40 font-semibold text-xs bg-background/80 hover:bg-muted"
          >
            Hoy
          </Button>
          <div className="flex p-1 rounded-xl bg-background/80 border border-border/40">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevMonth}
              aria-label="Mes anterior"
              className="size-6 rounded-lg hover:bg-muted"
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMonth}
              aria-label="Mes siguiente"
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
                  onClick={() => onSelectDay(day)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDay(day);
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
  );
}
