"use client";

import { IconFilter } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GradeCardBlock } from "./grade-card-block";

interface GradesTimelineProps {
  grados: any[];
  searchQuery: string;
  onClearSearch: () => void;
  getSectionsForGrade: (gradeId: string) => any[];
  onAddSection: (gradeId: string) => void;
  onSelectSection: (seccion: any) => void;
  onEditSection: (seccion: any) => void;
  onDeleteSection: (id: string) => void;
  onAssignTutor: (seccion: any) => void;
  onEditGrade: (grado: any) => void;
  onDeleteGrade: (gradoId: string) => void;
}

export function GradesTimeline({
  grados,
  searchQuery,
  onClearSearch,
  getSectionsForGrade,
  onAddSection,
  onSelectSection,
  onEditSection,
  onDeleteSection,
  onAssignTutor,
  onEditGrade,
  onDeleteGrade,
}: GradesTimelineProps) {
  return (
    <div className="flex-1 min-h-0 relative">
      <ScrollArea className="h-full w-full" type="always">
        <div className="p-4 max-w-5xl mx-auto space-y-3.5">
          {grados.length > 0 ? (
            grados.map((grado, index) => (
              <GradeCardBlock
                key={grado.id}
                grado={grado}
                index={index}
                secciones={getSectionsForGrade(grado.id)}
                onAddSection={() => onAddSection(grado.id)}
                onSelectSection={onSelectSection}
                onEditSection={onEditSection}
                onDeleteSection={onDeleteSection}
                onAssignTutor={onAssignTutor}
                onEditGrade={() => onEditGrade(grado)}
                onDeleteGrade={() => onDeleteGrade(grado.id)}
              />
            ))
          ) : (
            <EmptyGradesState
              hasSearch={!!searchQuery}
              onClearSearch={onClearSearch}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EmptyGradesState({
  hasSearch,
  onClearSearch,
}: {
  hasSearch: boolean;
  onClearSearch?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="size-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center">
        <IconFilter size={28} className="text-muted-foreground/40" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-muted-foreground">
          No se encontraron grados
        </h3>
        <p className="text-xs text-muted-foreground/60 max-w-xs leading-relaxed">
          Cambia el año lectivo o añade un nuevo grado a este nivel.
        </p>
      </div>
      {hasSearch && onClearSearch && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSearch}
          className="rounded-lg text-xs h-8 px-4"
        >
          Limpiar búsqueda
        </Button>
      )}
    </div>
  );
}
