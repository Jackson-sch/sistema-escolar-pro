"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconCircleX,
  IconInfoCircle,
  IconCalendar,
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

  const handleCurrentMonth = () => {
    const now = new Date();
    handleMonthChange(now);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for starting day (Monday = 1, Sunday = 0)
  const startDay = getDay(monthStart);
  const paddingDays = Array.from({ length: startDay === 0 ? 6 : startDay - 1 });

  const getAttendanceForDay = (day: Date) => {
    return asistencias.find((a) => isSameDay(new Date(a.fecha), day));
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/40 bg-card/80 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/30 p-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <IconCalendar className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold capitalize text-foreground">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Calendario mensual de registro en aula
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-xl border-border/40 cursor-pointer"
              onClick={() => handleMonthChange(subMonths(currentDate, 1))}
              title="Mes Anterior"
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-border/40 font-semibold text-xs px-2.5 cursor-pointer"
              onClick={handleCurrentMonth}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-xl border-border/40 cursor-pointer"
              onClick={() => handleMonthChange(addMonths(currentDate, 1))}
              title="Mes Siguiente"
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Leyenda Estandarizada EduNova Pro */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase gap-1.5 px-2.5 py-0.5 rounded-md">
            <span className="size-2 rounded-full bg-emerald-500" />
            Asistencia
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold uppercase gap-1.5 px-2.5 py-0.5 rounded-md">
            <span className="size-2 rounded-full bg-amber-500" />
            Tardanza
          </Badge>
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase gap-1.5 px-2.5 py-0.5 rounded-md">
            <span className="size-2 rounded-full bg-rose-500" />
            Inasistencia
          </Badge>
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] font-bold uppercase gap-1.5 px-2.5 py-0.5 rounded-md">
            <span className="size-2 rounded-full bg-sky-500" />
            Justificada
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Cabecera Días de la Semana */}
        <div className="grid grid-cols-7 border-b border-border/30 bg-muted/30">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Grid de Días */}
        <div className="grid grid-cols-7">
          {paddingDays.map((_, i) => (
            <div
              key={`padding-${i}`}
              className="h-20 sm:h-24 border-r border-b border-border/20 bg-muted/5 last:border-r-0"
            />
          ))}

          {daysInMonth.map((day) => {
            const attendance = getAttendanceForDay(day);
            const isWeekDay = getDay(day) !== 0 && getDay(day) !== 6;

            return (
              <div
                key={day.toString()}
                className={cn(
                  "relative h-20 sm:h-24 border-r border-b border-border/20 p-2 transition-colors last:border-r-0 hover:bg-muted/30",
                  !isSameMonth(day, monthStart) && "text-muted-foreground/30",
                  isToday(day) && "bg-indigo-500/10 border-indigo-500/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-mono font-bold",
                      isToday(day)
                        ? "flex size-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs"
                        : "text-muted-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {attendance && (
                    <div className="animate-in fade-in zoom-in animation-duration-">
                      {attendance.presente &&
                        !attendance.tardanza &&
                        !attendance.justificada && (
                          <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <IconCircleCheck className="size-4" />
                          </div>
                        )}
                      {attendance.tardanza && (
                        <div className="size-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                          <IconClock className="size-4" />
                        </div>
                      )}
                      {!attendance.presente && !attendance.justificada && (
                        <div className="size-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                          <IconCircleX className="size-4" />
                        </div>
                      )}
                      {attendance.justificada && (
                        <div className="size-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                          <IconInfoCircle className="size-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {attendance?.justificada && (
                  <div className="mt-2 group relative">
                    <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[9px] font-bold uppercase px-1.5 py-0 rounded gap-1 w-full truncate">
                      <IconInfoCircle className="size-2.5 shrink-0" />
                      <span className="truncate">Justificada</span>
                    </Badge>
                    {attendance.justificacion && (
                      <div className="invisible group-hover:visible absolute bottom-full left-0 z-30 mb-2 w-48 rounded-xl bg-card border border-border/40 p-2.5 text-xs text-foreground shadow-xl">
                        <p className="font-bold text-[10px] uppercase text-sky-600 dark:text-sky-400 mb-0.5">Motivo de Justificación</p>
                        <p className="text-[11px] leading-snug text-muted-foreground">{attendance.justificacion}</p>
                      </div>
                    )}
                  </div>
                )}

                {!isWeekDay && !attendance && (
                  <div className="mt-3 text-[9px] font-bold text-muted-foreground/30 text-center uppercase tracking-widest">
                    Fin de Semana
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
