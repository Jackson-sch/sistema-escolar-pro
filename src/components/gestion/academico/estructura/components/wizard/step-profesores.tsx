"use client";

import {
  IconChevronLeft,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardCourse } from "./wizard-types";

interface StepProfesoresProps {
  selectedCourses: WizardCourse[];
  seccionNombre: string;
  tutores: any[];
  onUpdateTeacher: (index: number, profId: string | null) => void;
  onBack: () => void;
  onFinish: () => void;
  loading: boolean;
}

export function StepProfesores({
  selectedCourses,
  seccionNombre,
  tutores,
  onUpdateTeacher,
  onBack,
  onFinish,
  loading,
}: StepProfesoresProps) {
  const activeCourses = selectedCourses.filter((c) => c.selected);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
        ✨ Salón listo para crearse: Se configurarán{" "}
        <strong>{activeCourses.length} cursos</strong> para la Sección{" "}
        <strong>&quot;{seccionNombre}&quot;</strong>.
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {activeCourses.map((curso) => {
          const courseIndex = selectedCourses.indexOf(curso);
          return (
            <div
              key={curso.codigo ?? curso.nombre}
              className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase truncate text-foreground">
                  {curso.nombre}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  {curso.horasSemanales} hrs/semana
                </p>
              </div>

              <div className="w-56 shrink-0">
                <Select
                  value={curso.profesorId || "NONE"}
                  onValueChange={(val) =>
                    onUpdateTeacher(courseIndex, val === "NONE" ? null : val)
                  }
                >
                  <SelectTrigger className="h-8 text-xs rounded-xl bg-muted/30">
                    <SelectValue placeholder="Seleccionar docente..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-48 z-[80]">
                    <SelectItem
                      value="NONE"
                      className="text-xs italic text-muted-foreground"
                    >
                      Sin Docente Específico
                    </SelectItem>
                    {tutores.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="text-xs font-medium"
                      >
                        {t.name} {t.apellidoPaterno || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

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
          onClick={onFinish}
          disabled={loading}
          className="rounded-xl text-xs font-bold gap-1.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          {loading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconCheck className="size-4" />
          )}
          Crear y Configurar Salón Completo
        </Button>
      </div>
    </div>
  );
}
