"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeccionPromocion, EstudiantePromocion } from "./promociones-types";
import { MappingConnectionBridge } from "./mapping-connection-bridge";
import { MappingStudentList } from "./mapping-student-list";

interface MappingStepProps {
  anioOrigen: number;
  anioDestino: number;
  onBack: () => void;
  niveles: Array<{ id: string; nombre: string }>;
  selectedLevelId: string;
  onLevelChange: (val: string) => void;
  sourceSeccionId: string;
  onSourceChange: (val: string) => void;
  filteredSourceSecciones: SeccionPromocion[];
  targetSeccionId: string;
  onTargetChange: (val: string) => void;
  filteredTargetSecciones: SeccionPromocion[];
  isAutoSelectedTarget: boolean;
  sourceSeccionObj?: SeccionPromocion;
  targetSeccionObj?: SeccionPromocion;
  loadingStudents: boolean;
  filteredStudents: EstudiantePromocion[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedIds: string[];
  onToggleStudent: (id: string) => void;
  onToggleAll: () => void;
  isPending: boolean;
  onPromote: () => void;
}

export function MappingStep({
  anioOrigen,
  anioDestino,
  onBack,
  niveles,
  selectedLevelId,
  onLevelChange,
  sourceSeccionId,
  onSourceChange,
  filteredSourceSecciones,
  targetSeccionId,
  onTargetChange,
  filteredTargetSecciones,
  isAutoSelectedTarget,
  sourceSeccionObj,
  targetSeccionObj,
  loadingStudents,
  filteredStudents,
  searchQuery,
  onSearchChange,
  selectedIds,
  onToggleStudent,
  onToggleAll,
  isPending,
  onPromote,
}: MappingStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in animation-duration-">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/80 p-4 rounded-2xl border border-border/40 backdrop-blur-md shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <IconArrowLeft size={14} />
          Volver a Auditoría
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Transferencia de Alumnos:
          </span>
          <Badge className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
            {anioOrigen} ➔ {anioDestino}
          </Badge>
        </div>
      </div>

      {/* Control de Conexión de Secciones */}
      <MappingConnectionBridge
        anioOrigen={anioOrigen}
        anioDestino={anioDestino}
        niveles={niveles}
        selectedLevelId={selectedLevelId}
        onLevelChange={onLevelChange}
        sourceSeccionId={sourceSeccionId}
        onSourceChange={onSourceChange}
        filteredSourceSecciones={filteredSourceSecciones}
        targetSeccionId={targetSeccionId}
        onTargetChange={onTargetChange}
        filteredTargetSecciones={filteredTargetSecciones}
        isAutoSelectedTarget={isAutoSelectedTarget}
        sourceSeccionObj={sourceSeccionObj}
        studentCount={filteredStudents.length}
      />

      {/* Nómina y Selección de Alumnos */}
      <MappingStudentList
        sourceSeccionId={sourceSeccionId}
        sourceSeccionObj={sourceSeccionObj}
        targetSeccionId={targetSeccionId}
        targetSeccionObj={targetSeccionObj}
        anioOrigen={anioOrigen}
        loadingStudents={loadingStudents}
        filteredStudents={filteredStudents}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedIds={selectedIds}
        onToggleStudent={onToggleStudent}
        onToggleAll={onToggleAll}
        isPending={isPending}
        onPromote={onPromote}
      />
    </div>
  );
}
