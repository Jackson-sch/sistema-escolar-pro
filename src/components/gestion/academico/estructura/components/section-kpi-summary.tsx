"use client";

import {
  IconUserCheck,
  IconUsers,
  IconClock,
  IconSparkles,
  IconUserCircle,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Tutor {
  id: string;
  name: string;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  image?: string | null;
}

interface SectionKpiSummaryProps {
  tutor?: Tutor | null;
  enrollment: number;
  capacity: number;
  totalCourses: number;
  totalHours: number;
  assignedTeachersCount: number;
  onAssignTutor: () => void;
  onSelectStudentsTab?: () => void;
  onSelectScheduleTab?: () => void;
}

export function SectionKpiSummary({
  tutor,
  enrollment,
  capacity,
  totalCourses,
  totalHours,
  assignedTeachersCount,
  onAssignTutor,
  onSelectStudentsTab,
  onSelectScheduleTab,
}: SectionKpiSummaryProps) {
  const vacantes = Math.max(0, capacity - enrollment);
  const occupancyRate = capacity > 0 ? Math.min(100, Math.round((enrollment / capacity) * 100)) : 0;
  const tutorFullName = tutor
    ? `${tutor.name} ${tutor.apellidoPaterno || ""}`.trim()
    : "Sin Tutor Asignado";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Tutor */}
      <div className="flex flex-col justify-between p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 border border-border/60 shadow-xs shrink-0">
            <AvatarImage src={tutor?.image ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
              {tutor ? tutor.name.charAt(0) : <IconUserCircle className="size-5 text-muted-foreground" />}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tutor / Responsable
            </span>
            <p className="text-xs font-bold text-foreground truncate" title={tutorFullName}>
              {tutorFullName}
            </p>
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {tutor ? "Lidera aula" : "Pendiente"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAssignTutor}
            className="h-7 px-2.5 text-[11px] font-bold rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
          >
            {tutor ? "Cambiar" : "Asignar"}
          </Button>
        </div>
      </div>

      {/* 2. Estudiantes & Vacantes */}
      <div
        onClick={onSelectStudentsTab}
        className="flex flex-col justify-between p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs transition-colors hover:border-primary/40 cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Estudiantes & Vacantes
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-foreground">{enrollment}</span>
              <span className="text-xs text-muted-foreground">/ {capacity} alumnos</span>
            </div>
          </div>
          <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <IconUsers className="size-4" />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <Progress value={occupancyRate} className="h-1.5" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {vacantes === 0 ? "Cupo Completo" : `${vacantes} vacantes libres`}
            </span>
            <span className="group-hover:text-primary font-semibold transition-colors">
              Ver nómina →
            </span>
          </div>
        </div>
      </div>

      {/* 3. Carga Horaria & Cobertura */}
      <div
        onClick={onSelectScheduleTab}
        className="flex flex-col justify-between p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs transition-colors hover:border-primary/40 cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Carga Horaria Semanal
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {totalHours} hrs
              </span>
              <span className="text-xs text-muted-foreground">({totalCourses} cursos)</span>
            </div>
          </div>
          <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <IconClock className="size-4" />
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">
            Docentes: <strong className="text-foreground">{assignedTeachersCount}/{totalCourses}</strong>
          </span>
          <span className="group-hover:text-primary font-bold transition-colors">
            Ver horario →
          </span>
        </div>
      </div>
    </div>
  );
}
