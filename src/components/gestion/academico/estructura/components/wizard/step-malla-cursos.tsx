"use client";

import {
  IconLoader2,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { WizardCourse } from "./wizard-types";

interface StepMallaCursosProps {
  selectedGrado: any;
  seccionNombre: string;
  selectedNivel: any;
  selectedCourses: WizardCourse[];
  loadingAreas: boolean;
  onToggleCourse: (index: number) => void;
  onUpdateHours: (index: number, hours: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepMallaCursos({
  selectedGrado,
  seccionNombre,
  selectedNivel,
  selectedCourses,
  loadingAreas,
  onToggleCourse,
  onUpdateHours,
  onBack,
  onNext,
}: StepMallaCursosProps) {
  const selectedCount = selectedCourses.filter((c) => c.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-primary/5 p-3 rounded-2xl border border-primary/20">
        <div>
          <p className="text-xs font-bold text-foreground">
            Cursos de la Malla — {selectedGrado?.nombre} Sección &quot;
            {seccionNombre}&quot;
          </p>
          <p className="text-[11px] text-muted-foreground">
            {selectedCount} de {selectedCourses.length} cursos seleccionados
          </p>
        </div>
        <Badge className="bg-primary/20 text-primary border-none text-xs font-bold">
          {selectedNivel?.nombre || "Nivel"}
        </Badge>
      </div>

      {loadingAreas ? (
        <div className="py-12 text-center">
          <IconLoader2 className="size-6 mx-auto animate-spin text-primary mb-2" />
          <p className="text-xs text-muted-foreground">
            Cargando malla curricular del nivel...
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {selectedCourses.map((curso, idx) => (
            <div
              key={curso.codigo ?? curso.nombre}
              className={`flex items-center justify-between p-3 rounded-xl border transition-[background-color,border-color,box-shadow,opacity] ${
                curso.selected
                  ? "border-primary/30 bg-card shadow-sm"
                  : "border-border/30 bg-muted/20 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox
                  checked={curso.selected}
                  onCheckedChange={() => onToggleCourse(idx)}
                  className="size-4"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-foreground">
                    {curso.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Código: {curso.codigo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Label className="text-[10px] text-muted-foreground">
                  Hrs/sem:
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={curso.horasSemanales}
                  onChange={(e) =>
                    onUpdateHours(idx, parseInt(e.target.value) || 2)
                  }
                  disabled={!curso.selected}
                  className="h-7 w-16 text-xs text-center rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-xl text-xs gap-1.5"
        >
          <IconChevronLeft size={14} />
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={selectedCount === 0}
          className="rounded-xl text-xs font-bold gap-1.5 px-5 shadow-md shadow-primary/10"
        >
          Siguiente: Asignar Profesores
          <IconChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
