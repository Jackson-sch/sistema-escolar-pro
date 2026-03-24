"use client";

import { useEffect, useState } from "react";
import { format, isAfter, isBefore, isWithinInterval, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconMapPin,
  IconUser,
  IconCheck,
  IconUsersGroup,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string; // ej: "08:00"
  horaFin: string; // ej: "09:30"
  aula?: string;
  curso: {
    nombre: string;
    areaCurricular: { nombre: string; color?: string };
    profesor?: { name: string; apellidoPaterno: string };
  };
}

interface DailyTimelineProps {
  horarios: Horario[];
  currentDate?: Date; // Opcional, por defecto new Date()
}

export function DailyTimeline({
  horarios,
  currentDate = new Date(),
}: DailyTimelineProps) {
  const [now, setNow] = useState(currentDate);

  // Update time every minute (optional for real-time progress)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentDayOfWeek = now.getDay(); // 0 (Domingo) - 6 (Sábado)
  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

  // Mapeamos el día (Lunes = 1 en la BD, etc.)
  const activeDay = isWeekend ? 1 : currentDayOfWeek; // Si es finde, mostramos lunes as fallback

  const todaySchedule = horarios
    .filter((h) => h.diaSemana === activeDay)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  // Determine the status of a class
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

  // Real status (removed demo mock logic)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Date Info */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2 capitalize">
          {format(now, "EEEE, dd 'de' MMMM", { locale: es })}
        </h2>
        <p className="text-sm font-medium text-muted-foreground/60">
          Programación del día • Semestre Regular
        </p>
      </div>

      {todaySchedule.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/40 p-12 text-center bg-card/20">
          <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
            No hay clases programadas para hoy
          </p>
        </div>
      ) : (
        <div className="relative pl-4 md:pl-8">
          {/* Vertical Timeline Line */}
          <div className="absolute top-4 bottom-4 left-[15px] md:left-[31px] w-px bg-border/40" />

          <div className="space-y-6">
            {todaySchedule.map((item, index) => {
              const realStatus = getClassStatus(item.horaInicio, item.horaFin);

              const status = realStatus;
              const progress = getProgress(item.horaInicio, item.horaFin);

              const isPast = status === "past";
              const isActive = status === "active";

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div
                      className={cn(
                        "size-3 rounded-full border-2 bg-background z-10 transition-colors duration-300",
                        isActive
                          ? "border-primary bg-primary shadow-[0_0_12px_rgba(59,130,246,0.5)] size-3.5"
                          : isPast
                            ? "border-muted-foreground/30 bg-muted-foreground/30"
                            : "border-border/50 bg-muted/50",
                      )}
                    />
                  </div>

                  {/* Card Content */}
                  <div
                    className={cn(
                      "ml-6 md:ml-8 rounded-2xl border transition-all duration-300 overflow-hidden relative",
                      isActive
                        ? "bg-primary/10 border-primary/40 shadow-[0_8px_32px_-12px_rgba(59,130,246,0.3)]"
                        : "bg-card/60 border-border/60 hover:bg-card/80 hover:border-border/80 dark:bg-card/40 dark:border-border/30 dark:hover:bg-card/60 dark:hover:border-border/50",
                    )}
                  >
                    {/* Active State Progress Line */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full" />
                    )}
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-primary rounded-r-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <div className="p-5 md:p-6 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Time and Details */}
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[11px] font-black tracking-widest uppercase",
                              isActive
                                ? "text-primary"
                                : isPast
                                  ? "text-muted-foreground/50"
                                  : "text-muted-foreground/80",
                            )}
                          >
                            <IconClock className="inline-block size-3.5 mr-1" />
                            {item.horaInicio} - {item.horaFin}
                            {isActive && " • AHORA"}
                          </span>
                        </div>

                        <h3
                          className={cn(
                            "text-xl md:text-2xl font-black tracking-tight leading-tight",
                            isPast
                              ? "text-muted-foreground/60"
                              : "text-foreground dark:text-white",
                          )}
                        >
                          {item.curso.nombre}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                          {item.curso.profesor && (
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-bold",
                                isPast
                                  ? "text-muted-foreground/40"
                                  : "text-muted-foreground/70",
                              )}
                            >
                              <IconUser className="size-4 opacity-70" />
                              <span className="capitalize">
                                {item.curso.profesor.name.toLowerCase()}{" "}
                                {item.curso.profesor.apellidoPaterno.toLowerCase()}
                              </span>
                            </div>
                          )}

                          {item.aula ? (
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-bold",
                                isPast
                                  ? "text-muted-foreground/40"
                                  : "text-muted-foreground/70",
                              )}
                            >
                              <IconMapPin className="size-4 opacity-70" />
                              <span>{item.aula}</span>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-bold",
                                isPast
                                  ? "text-muted-foreground/40"
                                  : "text-warning",
                              )}
                            >
                              <IconMapPin className="size-4 opacity-70" />
                              <span>
                                {isPast ? "Clase Culminada" : "Aula Pendiente"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Indicators */}
                      <div className="flex items-center shrink-0">
                        {isActive && (
                          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest mb-0.5">
                              Progreso
                            </span>
                            <span className="text-lg font-black text-primary tabular-nums leading-none">
                              {progress}%
                            </span>
                          </div>
                        )}

                        {isPast && (
                          <div className="size-10 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center">
                            <IconCheck className="size-5 text-muted-foreground/40" />
                          </div>
                        )}

                        {!isActive && !isPast && (
                          <div className="size-10 rounded-full bg-card/50 border border-border/40 flex items-center justify-center hover:bg-card transition-colors cursor-pointer group-hover:border-primary/30">
                            <IconUsersGroup className="size-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                          </div>
                        )}
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
