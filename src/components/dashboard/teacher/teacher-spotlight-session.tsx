"use client";

import {
  IconCalendarTime,
  IconClock,
  IconSchool,
  IconUserCheck,
  IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HorarioDocente } from "./teacher-types";

interface TeacherSpotlightSessionProps {
  spotlightSession: HorarioDocente;
  isCurrentlyActive: boolean;
}

export function TeacherSpotlightSession({
  spotlightSession,
  isCurrentlyActive,
}: TeacherSpotlightSessionProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 md:p-6 border transition-all shadow-sm",
        isCurrentlyActive
          ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-card border-emerald-500/30"
          : "bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-card border-indigo-500/30",
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={cn(
              "size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner",
              isCurrentlyActive
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-indigo-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
            )}
          >
            {isCurrentlyActive ? (
              <span className="relative flex size-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-4 bg-emerald-500"></span>
              </span>
            ) : (
              <IconCalendarTime size={26} />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full",
                  isCurrentlyActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
                )}
              >
                {isCurrentlyActive
                  ? "● Clase en Curso Ahora"
                  : "⏳ Próxima Sesión de Hoy"}
              </Badge>
              <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1">
                <IconClock size={13} />
                {spotlightSession.horaInicio} - {spotlightSession.horaFin}
              </span>
            </div>

            <h3
              className="text-base sm:text-lg font-extrabold text-foreground tracking-tight uppercase truncate"
              title={spotlightSession.curso.nombre || spotlightSession.curso.areaCurricular.nombre}
            >
              {spotlightSession.curso.nombre || spotlightSession.curso.areaCurricular.nombre}
            </h3>

            <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
              <span>
                {spotlightSession.curso.nivelAcademico.grado.nombre} &ldquo;
                {spotlightSession.curso.nivelAcademico.seccion}&rdquo;
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IconSchool size={13} className="text-primary" />
                {spotlightSession.curso.nivelAcademico.aulaAsignada ||
                  "Aula Asignada"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
          <Button
            className={cn(
              "rounded-xl font-bold text-xs h-9.5 px-4 gap-2 shadow-sm cursor-pointer",
              isCurrentlyActive
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white",
            )}
            asChild
          >
            <Link
              href={`/asistencia?seccion=${spotlightSession.curso.nivelAcademico.id || ""}`}
            >
              <IconUserCheck size={16} />
              <span>Tomar Asistencia</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9.5 px-3 text-xs font-semibold border-border/60 hover:bg-muted cursor-pointer"
            asChild
          >
            <Link href="/evaluaciones">
              <span>Notas</span>
              <IconChevronRight size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
