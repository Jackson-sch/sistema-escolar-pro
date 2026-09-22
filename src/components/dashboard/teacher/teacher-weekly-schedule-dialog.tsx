"use client";

import { useState } from "react";
import {
  IconCalendarEvent,
  IconClock,
  IconSchool,
  IconUserCheck,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HorarioDocente } from "./teacher-types";
import { getAreaTheme } from "./teacher-area-theme";

interface TeacherWeeklyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weeklySchedule: HorarioDocente[];
}

const WEEK_DAYS = [
  { id: 1, name: "Lunes", short: "Lun" },
  { id: 2, name: "Martes", short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves", short: "Jue" },
  { id: 5, name: "Viernes", short: "Vie" },
  { id: 6, name: "Sábado", short: "Sáb" },
];

export function TeacherWeeklyScheduleDialog({
  open,
  onOpenChange,
  weeklySchedule,
}: TeacherWeeklyScheduleDialogProps) {
  const [activeDay, setActiveDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today >= 1 && today <= 5 ? today : 1;
  });

  // Filtrar sábados si no hay ninguna clase los sábados
  const hasSaturdayClasses = weeklySchedule.some((item) => item.diaSemana === 6);
  const displayDays = hasSaturdayClasses
    ? WEEK_DAYS
    : WEEK_DAYS.filter((d) => d.id !== 6);

  const activeDaySessions = weeklySchedule
    .filter((item) => item.diaSemana === activeDay)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl p-6 border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <IconCalendarEvent size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight">
                Horario Semanal del Docente
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Distribución completa de horas pedagógicas de lunes a viernes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Selector de Día */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/40 overflow-x-auto">
          {displayDays.map((d) => {
            const sessionsCount = weeklySchedule.filter(
              (item) => item.diaSemana === d.id
            ).length;
            const isActive = activeDay === d.id;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDay(d.id)}
                className={cn(
                  "flex-1 min-w-[85px] py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center",
                  isActive
                    ? "bg-background text-foreground shadow-xs border border-border/40 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span>{d.name}</span>
                <span
                  className={cn(
                    "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                    isActive
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {sessionsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Sesiones del Día Seleccionado */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {activeDaySessions.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border/50 rounded-2xl bg-muted/10 space-y-2">
              <IconClock size={24} className="mx-auto text-muted-foreground/40" />
              <p className="text-xs font-bold text-foreground">
                Sin clases asignadas este día
              </p>
              <p className="text-[11px] text-muted-foreground">
                No tienes sesiones lectivas programadas para este día de la semana.
              </p>
            </div>
          ) : (
            activeDaySessions.map((session) => {
              const theme = getAreaTheme(session.curso.areaCurricular?.nombre);
              const AreaIcon = theme.icon;

              return (
                <div
                  key={session.id}
                  className={cn(
                    "p-3.5 rounded-2xl border bg-card/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                    theme.border
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border bg-muted/30 border-border/50 font-mono text-xs font-bold shrink-0">
                      <span>{session.horaInicio}</span>
                      <span className="text-[9px] text-muted-foreground font-sans font-normal">
                        a {session.horaFin}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 border",
                        theme.badgeBg,
                        theme.badgeBorder,
                        theme.text
                      )}
                    >
                      <AreaIcon size={18} />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <h4
                        className={cn(
                          "text-xs font-bold uppercase truncate",
                          theme.text
                        )}
                      >
                        {session.curso.nombre || session.curso.areaCurricular.nombre}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-semibold px-1.5 py-0 border-border/50"
                        >
                          {session.curso.nivelAcademico.grado.nombre} &ldquo;
                          {session.curso.nivelAcademico.seccion}&rdquo;
                        </Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <IconSchool size={12} />
                          {session.aula ||
                            session.curso.nivelAcademico.aulaAsignada ||
                            "Aula asignada"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10 rounded-xl cursor-pointer gap-1.5"
                      asChild
                    >
                      <Link
                        href={`/asistencia?seccion=${session.curso.nivelAcademico.id || ""}`}
                        onClick={() => onOpenChange(false)}
                      >
                        <IconUserCheck size={13} />
                        <span>Asistencia</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumen del Horario */}
        <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Total de sesiones semanales:{" "}
            <strong className="text-foreground">{weeklySchedule.length}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
