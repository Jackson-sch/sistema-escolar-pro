"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["L", "M", "M", "J", "V", "S", "D"];

const UPCOMING_MILESTONES: Record<number, { day: number; title: string; tag: string }[]> = {
  8: [ // Septiembre (mes 8 en 0-indexed)
    { day: 23, title: "Día de la Juventud & Primavera", tag: "Celebración" },
    { day: 28, title: "Evaluaciones Bimestrales", tag: "Académico" },
  ],
  9: [ // Octubre
    { day: 8, title: "Combate de Angamos", tag: "Feriado" },
    { day: 21, title: "Jornada Pedagógica Docente", tag: "Institucional" },
  ],
  10: [ // Noviembre
    { day: 1, title: "Día de Todos los Santos", tag: "Feriado" },
    { day: 20, title: "Semana de la Educación Primaria", tag: "Académico" },
  ],
  11: [ // Diciembre
    { day: 8, title: "Inmaculada Concepción", tag: "Feriado" },
    { day: 18, title: "Clausura del Año Lectivo", tag: "Cierre" },
  ],
};

export function SidebarCalendarCard() {
  const [currentDate, setCurrentDate] = React.useState(() => new Date());
  const today = React.useMemo(() => new Date(), []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = React.useMemo(() => {
    return currentDate.toLocaleDateString("es-PE", { month: "long" });
  }, [currentDate]);

  const daysGrid = React.useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const firstCol = firstDay === 0 ? 6 : firstDay - 1;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      isCurrent: boolean;
      isToday: boolean;
      hasEvent?: boolean;
    }[] = [];

    // Días del mes anterior
    for (let i = firstCol - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, isCurrent: false, isToday: false });
    }

    // Días del mes actual
    const milestonesThisMonth = UPCOMING_MILESTONES[month] || [];
    for (let d = 1; d <= totalDays; d++) {
      const isToday =
        today.getDate() === d &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      const hasEvent = milestonesThisMonth.some((m) => m.day === d);
      cells.push({ day: d, isCurrent: true, isToday, hasEvent });
    }

    // Días del siguiente mes
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrent: false, isToday: false });
    }

    return cells;
  }, [year, month, today]);

  const nextMilestone = React.useMemo(() => {
    const milestones = UPCOMING_MILESTONES[month] || [];
    const upcoming = milestones.find((m) => m.day >= today.getDate());
    return upcoming || milestones[0] || null;
  }, [month, today]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      {/* Vista Colapsada (Icono Solo) */}
      <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2 px-1">
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-xl bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <IconCalendarEvent className="size-4 text-primary" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              Calendario Escolar ({monthName} {year})
            </TooltipContent>
          </Tooltip>
          <PopoverContent side="right" align="end" className="p-3 w-64 rounded-2xl shadow-xl">
            <CalendarWidgetContent
              monthName={monthName}
              year={year}
              daysGrid={daysGrid}
              nextMilestone={nextMilestone}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onGoToday={handleGoToday}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Vista Expandida (Tarjeta Completa en el Sidebar) */}
      <div className="group-data-[collapsible=icon]:hidden px-3 pt-2 pb-1 mt-auto">
        <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-card/50 backdrop-blur-xs p-3 shadow-2xs transition-all hover:border-primary/30">
          <CalendarWidgetContent
            monthName={monthName}
            year={year}
            daysGrid={daysGrid}
            nextMilestone={nextMilestone}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onGoToday={handleGoToday}
          />
        </div>
      </div>
    </>
  );
}

interface CalendarWidgetContentProps {
  monthName: string;
  year: number;
  daysGrid: { day: number; isCurrent: boolean; isToday: boolean; hasEvent?: boolean }[];
  nextMilestone: { day: number; title: string; tag: string } | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
}

function CalendarWidgetContent({
  monthName,
  year,
  daysGrid,
  nextMilestone,
  onPrevMonth,
  onNextMonth,
  onGoToday,
}: CalendarWidgetContentProps) {
  return (
    <div className="space-y-2.5 select-none">
      {/* Cabecera del Mes */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onGoToday}
          className="text-xs font-bold capitalize text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          title="Ir a Hoy"
        >
          <IconCalendarEvent className="size-3.5 text-primary" />
          <span>
            {monthName} <span className="font-mono text-[11px] text-muted-foreground">{year}</span>
          </span>
        </button>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <IconChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <IconChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS_OF_WEEK.map((d, i) => (
          <span
            key={i}
            className={cn(
              "text-[10px] font-bold text-muted-foreground/80",
              (i === 5 || i === 6) && "text-muted-foreground/40",
            )}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {daysGrid.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "relative size-6 flex items-center justify-center rounded-lg text-[11px] transition-colors mx-auto",
              !item.isCurrent && "text-muted-foreground/30",
              item.isCurrent && !item.isToday && "text-foreground hover:bg-muted/50 font-medium",
              item.isToday &&
                "bg-primary text-primary-foreground font-bold shadow-xs",
            )}
          >
            {item.day}
            {item.hasEvent && !item.isToday && (
              <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>

      {/* Próximo Hito Académico */}
      {nextMilestone && (
        <div className="pt-2 border-t border-border/30">
          <Link
            href="/comunicaciones"
            className="group flex items-start gap-2 p-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/15 transition-all text-left"
          >
            <div className="size-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <IconSparkles className="size-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold font-mono text-primary uppercase tracking-wider">
                  {nextMilestone.day} {monthName.slice(0, 3)}
                </span>
                <span className="text-[8px] px-1 py-0 rounded bg-background text-muted-foreground font-medium">
                  {nextMilestone.tag}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {nextMilestone.title}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
