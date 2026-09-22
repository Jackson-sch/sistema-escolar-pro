"use client";

import {
  IconSchool,
  IconUserCheck,
  IconClipboardCheck,
  IconClock,
  IconBook2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAreaTheme } from "@/components/dashboard/teacher/teacher-area-theme";

interface TeacherTabCursosProps {
  cursos?: any[];
}

export function TeacherTabCursos({ cursos }: TeacherTabCursosProps) {
  if (!cursos || cursos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center bg-card/60 space-y-3">
        <div className="mx-auto size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
          <IconSchool size={28} />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          No hay asignaturas asignadas
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Actualmente no cuentas con cursos o secciones programadas en el periodo académico vigente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Total de <span className="font-bold text-foreground">{cursos.length}</span> asignaturas vinculadas a tu plan docente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cursos.map((curso: any) => {
          const theme = getAreaTheme(curso.areaCurricular?.nombre);
          const AreaIcon = theme.icon || IconBook2;
          const nivelName = curso.nivelAcademico?.nivel?.nombre || "Nivel";
          const gradoName = curso.nivelAcademico?.grado?.nombre || "Grado";
          const seccion = curso.nivelAcademico?.seccion || "—";
          const aula = curso.nivelAcademico?.aulaAsignada || "Aula Asignada";

          return (
            <Card
              key={curso.id}
              className={cn(
                "group relative rounded-3xl border transition-all duration-200 bg-card/80 backdrop-blur-md overflow-hidden shadow-xs hover:shadow-md",
                theme.border,
                theme.hoverBorder,
              )}
            >
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div
                    className={cn(
                      "size-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs",
                      theme.badgeBg,
                      theme.badgeBorder,
                      theme.text,
                    )}
                  >
                    <AreaIcon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full text-[9px] font-bold uppercase px-2 py-0",
                          theme.badgeBg,
                          theme.badgeBorder,
                          theme.badgeText,
                        )}
                      >
                        {nivelName}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full text-[9px] font-semibold border-border/60 bg-muted/30 px-2 py-0 text-muted-foreground"
                      >
                        {gradoName} &ldquo;{seccion}&rdquo;
                      </Badge>
                    </div>

                    <h4
                      className={cn(
                        "text-sm font-bold text-foreground truncate uppercase mt-1 transition-colors",
                        theme.text,
                      )}
                      title={curso.nombre}
                    >
                      {curso.nombre}
                    </h4>

                    {curso.areaCurricular?.nombre && (
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide truncate">
                        Área: {curso.areaCurricular.nombre}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <IconSchool size={13} className="text-muted-foreground/70" />
                    <span className="truncate max-w-[120px]">{aula}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10 rounded-xl cursor-pointer gap-1"
                      asChild
                    >
                      <Link href={`/asistencia?seccion=${curso.nivelAcademico?.id || ""}`}>
                        <IconUserCheck size={12} />
                        <span>Asistencia</span>
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] font-semibold text-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-xl cursor-pointer"
                      asChild
                    >
                      <Link href="/evaluaciones">
                        <IconClipboardCheck size={12} className="mr-1 text-muted-foreground" />
                        <span>Notas</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
