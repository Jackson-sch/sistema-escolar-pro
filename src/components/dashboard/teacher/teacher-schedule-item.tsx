"use client";

import { IconSchool, IconUserCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HorarioDocente } from "./teacher-types";

interface TeacherScheduleItemProps {
  item: HorarioDocente;
  isCurrent: boolean;
  isPassed: boolean;
}

export function TeacherScheduleItem({
  item,
  isCurrent,
  isPassed,
}: TeacherScheduleItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl bg-card/90 border transition-all duration-200 shadow-xs gap-3",
        isCurrent
          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : isPassed
          ? "border-border/40 opacity-75"
          : "border-border/60 hover:border-indigo-500/30",
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            "flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold shrink-0",
            isCurrent
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : isPassed
              ? "bg-muted/40 border-border/40 text-muted-foreground"
              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
          )}
        >
          <span>{item.horaInicio}</span>
          <span className="text-[9px] text-muted-foreground font-sans font-medium">
            a {item.horaFin}
          </span>
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className="font-extrabold text-xs sm:text-sm text-foreground truncate uppercase"
              title={item.curso.nombre || item.curso.areaCurricular.nombre}
            >
              {item.curso.nombre || item.curso.areaCurricular.nombre}
            </h4>
            {isCurrent && (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] font-bold uppercase px-2 py-0">
                En Curso
              </Badge>
            )}
            {isPassed && (
              <Badge
                variant="outline"
                className="text-[9px] text-muted-foreground border-border/40 px-2 py-0"
              >
                Finalizada
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="text-[10px] font-semibold border-border/50 bg-muted/30 px-2 py-0"
            >
              {item.curso.nivelAcademico.grado.nombre} &ldquo;
              {item.curso.nivelAcademico.seccion}&rdquo;
            </Badge>
            <span>•</span>
            <span className="text-[11px] font-medium flex items-center gap-1">
              <IconSchool size={12} className="text-muted-foreground/70" />
              {item.curso.nivelAcademico.aulaAsignada || "Aula asignada"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <Button
          variant={isCurrent ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-xl h-8.5 px-3 text-xs font-bold cursor-pointer gap-1.5",
            isCurrent
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10",
          )}
          asChild
        >
          <Link
            href={`/asistencia?seccion=${item.curso.nivelAcademico.id || ""}`}
          >
            <IconUserCheck size={14} />
            <span>Asistencia</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
