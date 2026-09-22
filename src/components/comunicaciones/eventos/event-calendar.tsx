"use client";

import { useState, useMemo } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { ViewEventDialog } from "./view-event-dialog";
import { getPeruvianHolidays } from "@/lib/holidays";
import { FormModal } from "@/components/modals/form-modal";
import { EventForm } from "./event-form";
import { EventCalendarGrid } from "./event-calendar-grid";
import { EventDailyAgenda } from "./event-daily-agenda";

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
      <EventCalendarGrid
        currentMonth={currentMonth}
        selectedDay={selectedDay}
        calendarDays={calendarDays}
        onSelectDay={setSelectedDay}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        getDayEvents={getDayEvents}
        getDayHolidays={getDayHolidays}
      />

      {/* Agenda Lateral (4/12) */}
      <EventDailyAgenda
        selectedDay={selectedDay}
        selectedDayEvents={selectedDayEvents}
        selectedDayHolidays={selectedDayHolidays}
        onSelectEvent={setEventToView}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

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
