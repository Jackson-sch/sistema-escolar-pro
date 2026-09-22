"use client";

import {
  IconBook,
  IconPlus,
  IconTrash,
  IconPencil,
  IconUserCircle,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SeccionCurso {
  id: string;
  nombre: string;
  horasSemanales?: number;
  profesor?: {
    id: string;
    name: string;
    apellidoPaterno?: string | null;
    image?: string | null;
  } | null;
  areaCurricular?: {
    id: string;
    nombre: string;
    color?: string | null;
  } | null;
}

interface SectionCoursesTabProps {
  cursos: SeccionCurso[];
  onAddCourse?: () => void;
  onAssignTeacher: (curso: SeccionCurso) => void;
  onDeleteCourse: (cursoId: string) => void;
}

export function SectionCoursesTab({
  cursos,
  onAddCourse,
  onAssignTeacher,
  onDeleteCourse,
}: SectionCoursesTabProps) {
  const totalHoras = cursos.reduce((acc, c) => acc + (c.horasSemanales || 2), 0);

  return (
    <div className="space-y-4">
      {/* Tab Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconBook className="size-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Malla Curricular del Aula
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {cursos.length} asignaturas • {totalHoras} horas pedagógicas semanales
            </p>
          </div>
        </div>

        {onAddCourse && (
          <Button
            size="sm"
            onClick={onAddCourse}
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <IconPlus className="size-3.5" />
            <span>Asignar Cursos</span>
          </Button>
        )}
      </div>

      {/* Courses Grid */}
      {cursos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed rounded-2xl p-6 text-center">
          <IconBook className="size-10 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-bold text-foreground">No hay cursos registrados en esta sección</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
            Haga clic en Asignar Cursos para incorporar las áreas de la malla curricular a este salón.
          </p>
          {onAddCourse && (
            <Button
              size="sm"
              onClick={onAddCourse}
              className="mt-4 h-8 px-4 rounded-xl text-xs font-bold cursor-pointer"
            >
              <IconPlus className="size-3.5 mr-1" />
              Asignar Cursos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {cursos.map((curso) => {
            const areaColor = curso.areaCurricular?.color || "#6366f1";
            const prof = curso.profesor;
            const profName = prof ? `${prof.name} ${prof.apellidoPaterno || ""}`.trim() : null;

            return (
              <div
                key={curso.id}
                className="group relative overflow-hidden rounded-xl border border-border/40 bg-card p-3 flex flex-col justify-between gap-2.5 hover:border-border/80 hover:shadow-xs transition-all"
              >
                {/* Top: Area badge & Course Name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: areaColor }}
                      />
                      {curso.areaCurricular && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[130px]"
                          style={{ color: areaColor }}
                        >
                          {curso.areaCurricular.nombre}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-extrabold h-4.5 px-1.5 bg-muted/60 text-muted-foreground border-border/40"
                      >
                        {curso.horasSemanales || 2} hrs/sem
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-foreground truncate" title={curso.nombre}>
                      {curso.nombre}
                    </h4>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteCourse(curso.id)}
                    className="size-7 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                    title="Eliminar curso del aula"
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>

                {/* Bottom: Teacher chip */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onAssignTeacher(curso)}
                    className="flex items-center gap-1.5 text-left min-w-0 flex-1 group/teacher hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    {prof ? (
                      <>
                        <Avatar className="size-5 border border-border/40 shrink-0">
                          <AvatarImage src={prof.image ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-black">
                            {prof.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-semibold text-foreground truncate max-w-[170px]">
                          {profName}
                        </span>
                        <IconPencil className="size-3 text-muted-foreground opacity-0 group-hover/teacher:opacity-100 transition-opacity shrink-0" />
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <IconAlertCircle className="size-3" />
                        Sin docente asignado
                      </span>
                    )}
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignTeacher(curso)}
                    className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                  >
                    {prof ? "Cambiar" : "Asignar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
