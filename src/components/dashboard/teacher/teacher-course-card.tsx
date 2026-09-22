"use client";

import {
  IconUsers,
  IconDotsVertical,
  IconUserCheck,
  IconPencil,
  IconSchool,
  IconChevronRight,
  IconClock,
  IconStarFilled,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CursoDocente } from "./teacher-types";
import { getAreaTheme, formatCourseHorarios } from "./teacher-area-theme";

export function TeacherCourseCard({ curso }: { curso: CursoDocente }) {
  const nivelName = curso.nivelAcademico.nivel?.nombre || "Nivel";
  const gradoNombre = curso.nivelAcademico.grado?.nombre || "Grado";
  const seccion = curso.nivelAcademico.seccion;
  const estudiantesCount = curso._count?.estudiantes || 0;
  const theme = getAreaTheme(curso.areaCurricular?.nombre);
  const AreaIcon = theme.icon;
  const horarioText = formatCourseHorarios(curso.horarios);

  return (
    <div
      className={cn(
        "group rounded-3xl p-5 border bg-card/90 backdrop-blur-md shadow-xs transition-all duration-200",
        "flex flex-col justify-between space-y-4 hover:shadow-md",
        theme.border,
        theme.hoverBorder
      )}
    >
      <div className="flex justify-between items-start gap-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "size-10 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5",
              theme.badgeBg,
              theme.badgeBorder,
              theme.text
            )}
          >
            <AreaIcon size={20} />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full text-[9px] font-bold uppercase px-2 py-0",
                  theme.badgeBg,
                  theme.badgeBorder,
                  theme.badgeText
                )}
              >
                {nivelName}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full text-[9px] font-semibold border-border/60 bg-muted/40 px-2 py-0 text-muted-foreground"
              >
                {gradoNombre} &ldquo;{seccion}&rdquo;
              </Badge>
              {curso.isTutor && (
                <Badge className="rounded-full text-[9px] font-extrabold uppercase border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0 gap-1">
                  <IconStarFilled size={9} className="text-amber-500" />
                  Tutor
                </Badge>
              )}
              {curso.attendanceStatusToday === "pending" && (
                <Badge className="rounded-full text-[9px] font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0 gap-1 animate-pulse">
                  <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
                  Pasa Lista Hoy
                </Badge>
              )}
              {curso.attendanceStatusToday === "completed" && (
                <Badge className="rounded-full text-[9px] font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0 gap-1">
                  <IconCheck size={10} className="text-emerald-500" />
                  Lista Tomada
                </Badge>
              )}
              {(curso.pendingGradesCount || 0) > 0 && (
                <Badge className="rounded-full text-[9px] font-bold border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0">
                  {curso.pendingGradesCount} {curso.pendingGradesCount === 1 ? "nota pendiente" : "notas pendientes"}
                </Badge>
              )}
            </div>

            <div>
              <h4
                className={cn(
                  "text-sm font-extrabold text-foreground tracking-tight truncate uppercase transition-colors",
                  theme.text
                )}
                title={curso.nombre || curso.areaCurricular.nombre}
              >
                {curso.nombre || curso.areaCurricular.nombre}
              </h4>
              {curso.nombre &&
                curso.areaCurricular?.nombre &&
                curso.nombre.toLowerCase().trim() !==
                  curso.areaCurricular.nombre.toLowerCase().trim() && (
                  <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wide block truncate">
                    Área: {curso.areaCurricular.nombre}
                  </span>
                )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <IconSchool size={12} className="text-muted-foreground/70" />
                <span>{curso.nivelAcademico.aulaAsignada || "Aula Asignada"}</span>
              </span>
              {horarioText && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-muted-foreground/80">
                    <IconClock size={11} />
                    <span>{horarioText}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Opciones de curso"
              className="rounded-xl size-8 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
            >
              <IconDotsVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-2xl p-1.5 shadow-xl border border-border/60 z-[80]"
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
              Opciones de Asignatura
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-xl text-xs font-medium cursor-pointer"
              asChild
            >
              <Link
                href={`/asistencia?seccion=${curso.nivelAcademico.id || ""}`}
              >
                <IconUserCheck size={14} className="mr-2 text-indigo-500" />
                <span>Tomar Asistencia</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl text-xs font-medium cursor-pointer"
              asChild
            >
              <Link href="/evaluaciones">
                <IconPencil size={14} className="mr-2 text-amber-500" />
                <span>Registrar Calificaciones</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl text-xs font-medium cursor-pointer"
              asChild
            >
              <Link href="/gestion/estudiantes">
                <IconUsers size={14} className="mr-2 text-blue-500" />
                <span>Ver Lista de Alumnos</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <IconUsers size={15} className="text-indigo-500" />
          <span>{estudiantesCount} Alumnos</span>
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant={curso.attendanceStatusToday === "pending" ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 px-2.5 text-[11px] font-bold rounded-xl cursor-pointer gap-1 transition-all",
              curso.attendanceStatusToday === "pending"
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                : curso.attendanceStatusToday === "completed"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                : "text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10"
            )}
            asChild
          >
            <Link
              href={`/asistencia?seccion=${curso.nivelAcademico.id || ""}`}
            >
              {curso.attendanceStatusToday === "completed" ? (
                <IconCheck size={13} />
              ) : (
                <IconUserCheck size={13} />
              )}
              <span>
                {curso.attendanceStatusToday === "pending"
                  ? "Pasar Lista"
                  : curso.attendanceStatusToday === "completed"
                  ? "Asistencia ✓"
                  : "Asistencia"}
              </span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-[11px] font-bold text-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-xl cursor-pointer gap-0.5"
            asChild
          >
            <Link href="/evaluaciones">
              <span>Notas</span>
              <IconChevronRight size={13} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
