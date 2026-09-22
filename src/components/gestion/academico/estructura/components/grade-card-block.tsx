"use client";

import { useState } from "react";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconChevronDown,
  IconUsers,
  IconDoor,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionItemCard } from "./section-item-card";
import { getGradeTheme } from "./grade-theme-palette";
import { cn } from "@/lib/utils";

interface GradeCardBlockProps {
  grado: {
    id: string;
    nombre: string;
    codigo: string;
    orden?: number;
  };
  index?: number;
  secciones: any[];
  onAddSection: () => void;
  onEditSection: (seccion: any) => void;
  onDeleteSection: (id: string) => void;
  onAssignTutor: (seccion: any) => void;
  onSelectSection?: (seccion: any) => void;
  onEditGrade: () => void;
  onDeleteGrade: () => void;
}

export function GradeCardBlock({
  grado,
  index = 0,
  secciones,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onAssignTutor,
  onSelectSection,
  onEditGrade,
  onDeleteGrade,
}: GradeCardBlockProps) {
  const [isOpen, setIsOpen] = useState(true);
  const theme = getGradeTheme(index, grado.orden);

  // Métricas agregadas del grado
  const totalAlumnos = secciones.reduce(
    (sum, s) => sum + (s._count?.matriculas ?? s._count?.students ?? 0),
    0,
  );
  const totalCapacidad = secciones.reduce((sum, s) => sum + (s.capacidad || 30), 0);
  const totalVacantes = Math.max(0, totalCapacidad - totalAlumnos);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/90 shadow-2xs overflow-hidden transition-all duration-200",
        theme.borderAccent,
      )}
    >
      {/* Grade Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-linear-to-r transition-colors cursor-pointer select-none border-b border-border/40",
          theme.headerGradient,
        )}
      >
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {/* Color pill indicator */}
          <div className={cn("w-1.5 h-6 rounded-full shrink-0 shadow-xs", theme.indicator)} />

          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-transform"
            aria-label={isOpen ? "Colapsar grado" : "Expandir grado"}
          >
            <IconChevronDown
              size={18}
              className={cn("transition-transform duration-200", !isOpen && "-rotate-90")}
            />
          </button>

          <h3 className="text-base font-bold tracking-tight text-foreground">
            {grado.nombre}
          </h3>

          <span
            className={cn(
              "text-xxs font-black px-2 py-0.5 rounded-md uppercase tracking-wider border",
              theme.badge,
            )}
          >
            {grado.codigo}
          </span>

          <div className="flex items-center gap-1.5 ml-1 flex-wrap">
            <Badge variant="outline" className="text-xxs font-medium text-muted-foreground border-border/60">
              {secciones.length} {secciones.length === 1 ? "sección" : "secciones"}
            </Badge>

            {secciones.length > 0 && (
              <>
                <Badge variant="secondary" className="text-xxs font-medium gap-1 bg-muted/60">
                  <IconUsers size={11} className="opacity-60" />
                  {totalAlumnos}/{totalCapacidad} alumnos
                </Badge>
                <span className="text-xxs font-semibold text-emerald-600 dark:text-emerald-400">
                  {totalVacantes} vacantes
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons on the right */}
        <div className="flex items-center gap-1 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSection}
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-bold gap-1 shadow-2xs",
              theme.buttonText,
              theme.buttonBorder,
            )}
          >
            <IconPlus size={13} strokeWidth={3} />
            <span>Sección</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onEditGrade}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Editar grado"
          >
            <IconPencil size={13} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteGrade}
            className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
            title="Eliminar grado"
          >
            <IconTrash size={13} />
          </Button>
        </div>
      </div>

      {/* Sections Grid (Collapsible) */}
      {isOpen && (
        <div className="p-4 bg-muted/20 dark:bg-background/40 border-t border-border/30">
          {secciones.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {secciones.map((seccion) => (
                <SectionItemCard
                  key={seccion.id}
                  seccion={seccion}
                  onSelectSection={() => onSelectSection?.(seccion)}
                  onEdit={() => onEditSection(seccion)}
                  onDelete={() => onDeleteSection(seccion.id)}
                  onAssignTutor={() => onAssignTutor(seccion)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border/60 rounded-xl bg-background/50 gap-2">
              <IconDoor size={22} className="text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground font-medium">
                No hay secciones registradas en {grado.nombre}.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddSection}
                className={cn("h-7 text-xs font-bold rounded-lg mt-1", theme.buttonText, theme.buttonBorder)}
              >
                <IconPlus size={13} className="mr-1" />
                Crear Sección
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
