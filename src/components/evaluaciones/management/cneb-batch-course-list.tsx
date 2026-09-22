"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { BatchPlanCourseItem } from "@/actions/evaluations/batch-cneb-types";
import { IconAlertCircle, IconCheck, IconBook } from "@tabler/icons-react";

interface CnebBatchCourseListProps {
  cursos: BatchPlanCourseItem[];
  selectedMap: Record<string, string[]>; // cursoId -> array of selected competenciaIds
  onToggleCompetencia: (cursoId: string, competenciaId: string) => void;
  onToggleCourseAll: (cursoId: string, allIds: string[], checked: boolean) => void;
}

export function CnebBatchCourseList({
  cursos,
  selectedMap,
  onToggleCompetencia,
  onToggleCourseAll,
}: CnebBatchCourseListProps) {
  if (!cursos.length) {
    return (
      <div className="p-8 text-center border border-dashed rounded-2xl text-muted-foreground text-xs">
        No se encontraron cursos activos asignados a esta sección.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
      {cursos.map((curso) => {
        const compIds = curso.competencias.map((c) => c.id);
        const currentSelected = selectedMap[curso.id] || [];
        const isAllSelected =
          compIds.length > 0 && compIds.every((id) => currentSelected.includes(id));
        const isSomeSelected =
          currentSelected.length > 0 && !isAllSelected;

        return (
          <div
            key={curso.id}
            className="border rounded-2xl p-3.5 bg-card/60 hover:bg-card/90 transition-colors space-y-2.5"
          >
            {/* Cabecera del Curso */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Checkbox
                  id={`course-${curso.id}`}
                  checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) =>
                    onToggleCourseAll(curso.id, compIds, checked === true)
                  }
                  className="rounded-md"
                />
                <label
                  htmlFor={`course-${curso.id}`}
                  className="text-xs font-bold tracking-tight cursor-pointer truncate flex items-center gap-1.5"
                >
                  <IconBook className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{curso.nombre}</span>
                </label>
                {curso.profesorNombre && (
                  <span className="text-[10px] text-muted-foreground hidden sm:inline truncate">
                    ({curso.profesorNombre})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {curso.existingEvaluacionesCount > 0 ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold"
                  >
                    <IconAlertCircle className="size-3" />
                    <span>{curso.existingEvaluacionesCount} ya creadas</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                  >
                    Sin evaluaciones
                  </Badge>
                )}
                <span className="text-[10px] font-bold text-muted-foreground">
                  {currentSelected.length}/{compIds.length}
                </span>
              </div>
            </div>

            {/* Lista de Competencias CNEB */}
            <div className="pl-6 space-y-1.5 border-l-2 border-border/40 ml-2">
              {curso.competencias.length > 0 ? (
                curso.competencias.map((comp, idx) => {
                  const isChecked = currentSelected.includes(comp.id);
                  return (
                    <div
                      key={comp.id}
                      onClick={() => onToggleCompetencia(curso.id, comp.id)}
                      className="flex items-start gap-2 text-xs py-1 px-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggleCompetencia(curso.id, comp.id)}
                        className="rounded mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs leading-tight text-foreground/90">
                          <span className="text-primary font-bold mr-1">C{idx + 1}:</span>
                          {comp.nombre}
                        </p>
                        {comp.capacidades.length > 0 && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {comp.capacidades.length} capacidades vinculadas
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                  Este curso no tiene competencias CNEB configuradas en la malla curricular.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
