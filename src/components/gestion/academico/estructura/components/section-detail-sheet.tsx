"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { IconSchool } from "@tabler/icons-react";
import { SectionMasterDetail } from "./section-master-detail";

interface SectionDetailSheetProps {
  selectedSeccionId: string | null;
  secciones: any[];
  grados: any[];
  nivel: any;
  tutores: any[];
  onClose: () => void;
  onEditSection: (seccion: any) => void;
  onDeleteSection: (id: string) => void;
  onAssignTutor: (seccion: any) => void;
  onAddCourse: (seccion: any) => void;
}

export function SectionDetailSheet({
  selectedSeccionId,
  secciones,
  grados,
  nivel,
  tutores,
  onClose,
  onEditSection,
  onDeleteSection,
  onAssignTutor,
  onAddCourse,
}: SectionDetailSheetProps) {
  const seccion = secciones.find((s) => s.id === selectedSeccionId);

  return (
    <Sheet
      open={!!selectedSeccionId}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 gap-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-md border-l border-border/50 shadow-2xl"
      >
        {/* Top Header */}
        <SheetHeader className="p-5 pb-4 border-b border-border/40 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <IconSchool className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Ficha de Aula y Gestión Integral
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Carga horaria, asignación de docentes, nómina de estudiantes y horario semanal.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        {seccion && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <SectionMasterDetail
              seccion={seccion}
              grado={grados.find((g) => g.id === seccion.gradoId)}
              nivel={nivel}
              tutores={tutores}
              onEditSection={() => onEditSection(seccion)}
              onDeleteSection={() => onDeleteSection(seccion.id)}
              onAssignTutor={() => onAssignTutor(seccion)}
              onAddCourse={() => onAddCourse(seccion)}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
