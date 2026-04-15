"use client";

import { IconPlus, IconSeparator, IconPencil, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SectionItemCard } from "./section-item-card";

interface GradeTimelineItemProps {
  grado: {
    id: string;
    nombre: string;
    codigo: string;
  };
  secciones: any[];
  onAddSection: () => void;
  onEditSection: (seccion: any) => void;
  onDeleteSection: (id: string) => void;
  onAssignTutor: (seccion: any) => void;
  onEditGrade: () => void;
  onDeleteGrade: () => void;
  isLast?: boolean;
}

export function GradeTimelineItem({ 
  grado, 
  secciones, 
  onAddSection, 
  onEditSection, 
  onDeleteSection,
  onAssignTutor,
  onEditGrade,
  onDeleteGrade,
  isLast = false 
}: GradeTimelineItemProps) {
  return (
    <div className="relative pl-14 pb-12 group/timeline">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[33px] top-12 bottom-0 w-0.5 bg-linear-to-b from-primary/30 via-primary/10 to-transparent" />
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 top-0 size-10 rounded-full border-2 border-primary/20 bg-background flex items-center justify-center shadow-sm group-hover/timeline:border-primary/50 transition-colors duration-300">
        <div className="size-3 rounded-full bg-primary/40 group-hover/timeline:scale-125 group-hover/timeline:bg-primary transition-all duration-500" />
      </div>

      {/* Grade Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight text-foreground/90">
              {grado.nombre}
            </h3>
            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-widest border border-primary/20">
              {grado.codigo}
            </span>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Gestión de secciones y capacidad de aula.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditGrade}
            className="h-8 rounded-full px-3 text-xs font-bold tracking-tighter hover:bg-primary/10 hover:text-primary"
          >
            <IconPencil className="size-3.5 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteGrade}
            className="h-8 rounded-full px-3 text-xs font-bold tracking-tighter hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
          >
            <IconTrash className="size-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {secciones.map((seccion) => (
          <SectionItemCard
            key={seccion.id}
            seccion={seccion}
            onEdit={() => onEditSection(seccion)}
            onDelete={() => onDeleteSection(seccion.id)}
            onAssignTutor={() => onAssignTutor(seccion)}
          />
        ))}

        {/* Add Section Card */}
        <button
          onClick={onAddSection}
          className="h-full min-h-[160px] border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group/add"
        >
          <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center group-hover/add:bg-primary/10 group-hover/add:scale-110 transition-all duration-300">
            <IconPlus className="size-6 transition-transform group-hover/add:rotate-90 duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Añadir Sección</span>
        </button>
      </div>
    </div>
  );
}
