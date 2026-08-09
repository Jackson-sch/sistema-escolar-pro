"use client";

import { useEffect, useState } from "react";
import { format, isAfter, isBefore, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconMapPin,
  IconUser,
  IconCheck,
  IconClock,
  IconSparkles,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  aula?: string;
  curso: {
    nombre: string;
    areaCurricular: { nombre: string; color?: string };
    profesor?: { name: string; apellidoPaterno: string };
  };
}

interface DailyTimelineProps {
  horarios: Horario[];
  currentDate?: Date;
}

export function DailyTimeline({
  horarios,
  currentDate = new Date(),
}: DailyTimelineProps) {
  const [now, setNow] = useState(currentDate);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentDayOfWeek = now.getDay();
  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

  const activeDay = isWeekend ? 1 : currentDayOfWeek;

  const todaySchedule = horarios
    .filter((h) => h.diaSemana === activeDay)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const getClassStatus = (horaInicio: string, horaFin: string) => {
    const todayStr = format(now, "yyyy-MM-dd");
    const start = parse(`${todayStr} ${horaInicio}`, "yyyy-MM-dd HH:mm", now);
    const end = parse(`${todayStr} ${horaFin}`, "yyyy-MM-dd HH:mm", now);

    if (isBefore(now, start)) return "future";
    if (isAfter(now, end)) return "past";
    return "active";
  };

  const getProgress = (horaInicio: string, horaFin: string) => {
    const todayStr = format(now, "yyyy-MM-dd");
    const start = parse(`${todayStr} ${horaInicio}`, "yyyy-MM-dd HH:mm", now);
    const end = parse(`${todayStr} ${horaFin}`, "yyyy-MM-dd HH:mm", now);

    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / totalDuration) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      {/* Header Date Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/80 border border-border/40 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground capitalize flex items-center gap-2">
            <IconClock className="size-5 text-indigo-500" />
            {format(now, "EEEE, dd 'de' MMMM", { locale: es })}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isWeekend
              ? "Fin de semana (Mostrando programación del Lunes)"
              : "Programación de clases para la jornada de hoy"}
          </p>
        </div>

        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-xl w-fit">
          {todaySchedule.length} materias hoy
        </Badge>
      </div>

      {todaySchedule.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 p-12 text-center bg-card/80">
          <p className="text-sm font-bold text-muted-foreground">
            No hay clases programadas para hoy
          </p>
        </div>
      ) : (
        <div className="relative pl-4 md:pl-6">
          {/* Vertical Line */}
          <div className="absolute top-4 bottom-4 left-[15px] md:left-[23px] w-px bg-border/40" />

          <div className="space-y-4">
            {todaySchedule.map((item) => {
              const realStatus = getClassStatus(item.horaInicio, item.horaFin);
              const progress = getProgress(item.horaInicio, item.horaFin);

              const isPast = realStatus === "past";
              const isActive = realStatus === "active";

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-4 md:-left-6 top-6 -translate-y-1/2 flex items-center justify-center">
                    <div
                      className={cn(
                        "size-3.5 rounded-full border-2 bg-background z-10 transition-[background-color,border-color,box-shadow]",
                        isActive
                          ? "border-indigo-600 bg-indigo-600 shadow-md shadow-indigo-500/40 size-4"
                          : isPast
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-border/60 bg-card",
                      )}
                    />
                  </div>

                  {/* Card Content */}
                  <div
                    className={cn(
                      "ml-6 md:ml-8 rounded-2xl border transition-[background-color,border-color,box-shadow,opacity,padding,margin] duration-300 overflow-hidden relative p-5",
                      isActive
                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-md"
                        : isPast
                          ? "bg-card/80 border-border/30 opacity-75"
                          : "bg-card/80 border-border/40 hover:bg-card shadow-xs",
                    )}
                  >
                    {/* Active State Progress Line */}
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-indigo-600 rounded-r-full transition-[width] duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground flex items-center gap-1">
                            <IconClock className="size-3.5 text-indigo-500" />
                            {item.horaInicio} - {item.horaFin}
                          </span>
                          {isActive && (
                            <Badge className="bg-indigo-600 text-white border-none text-[9px] font-bold uppercase px-2 py-0 rounded-md animate-pulse">
                              En Curso ({progress}%)
                            </Badge>
                          )}
                          {isPast && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold uppercase px-2 py-0 rounded-md">
                              Concluida
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                          {item.curso.nombre}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                          {item.curso.profesor && (
                            <div className="flex items-center gap-1.5 font-medium">
                              <IconUser className="size-3.5 text-indigo-500" />
                              <span className="capitalize">
                                Prof. {item.curso.profesor.name.toLowerCase()}{" "}
                                {item.curso.profesor.apellidoPaterno.toLowerCase()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 font-medium">
                            <IconMapPin className="size-3.5 text-indigo-500" />
                            <span>{item.aula || "Aula General"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Area Tag */}
                      <div className="shrink-0">
                        <Badge variant="outline" className="bg-background/80 text-foreground border-border/40 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-xl">
                          {item.curso.areaCurricular.nombre}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
