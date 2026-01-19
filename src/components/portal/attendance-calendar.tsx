"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClockFilled,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

interface Asistencia {
  id: string;
  fecha: string;
  presente: boolean;
  tardanza: boolean;
  justificada: boolean;
  justificacion?: string;
}

interface AttendanceCalendarProps {
  asistencias: Asistencia[];
  currentDate: Date;
}

export function AttendanceCalendar({
  asistencias,
  currentDate,
}: AttendanceCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleMonthChange = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", newDate.getMonth().toString());
    params.set("anio", newDate.getFullYear().toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for starting day
  const startDay = getDay(monthStart);
  const paddingDays = Array.from({ length: startDay === 0 ? 6 : startDay - 1 });

  const getAttendanceForDay = (day: Date) => {
    return asistencias.find((a) => isSameDay(new Date(a.fecha), day));
  };

  return (
    <Card className="border-border/50 bg-card/50 shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-black tracking-tight capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => handleMonthChange(subMonths(currentDate, 1))}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => handleMonthChange(addMonths(currentDate, 1))}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-emerald-500" />
            <span>Asistencia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-amber-500" />
            <span>Tardanza</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500" />
            <span>Falta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-blue-500" />
            <span>Justificada</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {paddingDays.map((_, i) => (
            <div
              key={`padding-${i}`}
              className="h-28 border-r border-b border-border/50 bg-muted/10 last:border-r-0"
            />
          ))}

          {daysInMonth.map((day, i) => {
            const attendance = getAttendanceForDay(day);
            const isWeekDay = getDay(day) !== 0 && getDay(day) !== 6;

            return (
              <div
                key={day.toString()}
                className={cn(
                  "relative h-28 border-r border-b border-border/50 p-2 transition-colors last:border-r-0 hover:bg-muted/30",
                  !isSameMonth(day, monthStart) && "text-muted-foreground/30",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      isToday(day) &&
                        "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {attendance && (
                    <div className="animate-in fade-in zoom-in duration-300">
                      {attendance.presente &&
                        !attendance.tardanza &&
                        !attendance.justificada && (
                          <IconCircleCheckFilled className="size-5 text-emerald-500" />
                        )}
                      {attendance.tardanza && (
                        <IconClockFilled className="size-5 text-amber-500" />
                      )}
                      {!attendance.presente && !attendance.justificada && (
                        <IconCircleXFilled className="size-5 text-red-500" />
                      )}
                      {attendance.justificada && (
                        <IconCircleCheckFilled className="size-5 text-blue-500" />
                      )}
                    </div>
                  )}
                </div>

                {attendance?.justificada && attendance.justificacion && (
                  <div className="mt-2 group relative">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      <IconInfoCircle className="size-2.5" />
                      <span className="truncate">Justificada</span>
                    </div>
                    {/* Tooltip simple */}
                    <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible w-32 p-2 bg-blue-500 text-white text-[10px] rounded shadow-xl z-20">
                      {attendance.justificacion}
                    </div>
                  </div>
                )}

                {!isWeekDay && !attendance && (
                  <div className="mt-2 text-[9px] font-bold text-muted-foreground/40 text-center">
                    Fines de Semana
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
