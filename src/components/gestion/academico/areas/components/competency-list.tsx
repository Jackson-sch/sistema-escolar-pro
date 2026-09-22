"use client";

import { useState } from "react";
import { IconSparkles, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { CompetencyForm } from "@/components/gestion/academico/competencias/competency-form";
import {
  CompetencyItem,
  type CompetenciaWithCapacidades,
} from "./competency-item";

export type { CompetenciaWithCapacidades };

interface CompetencyListProps {
  competencies: CompetenciaWithCapacidades[];
  areaId: string;
}

export function CompetencyList({ competencies, areaId }: CompetencyListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (competencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-2xl p-6 bg-muted/10 space-y-3">
        <div className="size-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <IconSparkles className="size-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-foreground">
            No hay competencias registradas
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Esta área curricular aún no tiene competencias asociadas. Puedes
            crear una manualmente o cargar la malla oficial CNEB.
          </p>
        </div>
        <Button
          size="sm"
          className="text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
          onClick={() => setShowAddDialog(true)}
        >
          <IconPlus className="size-3.5" />
          <span>Crear Competencia</span>
        </Button>

        <FormModal
          title="Nueva Competencia"
          description="Añada una competencia curricular para esta área."
          isOpen={showAddDialog}
          onOpenChange={setShowAddDialog}
          className="sm:max-w-md"
        >
          <CompetencyForm
            defaultAreaId={areaId}
            onSuccess={() => setShowAddDialog(false)}
          />
        </FormModal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {competencies.map((comp, index) => (
        <CompetencyItem key={comp.id} comp={comp} index={index} />
      ))}
    </div>
  );
}
