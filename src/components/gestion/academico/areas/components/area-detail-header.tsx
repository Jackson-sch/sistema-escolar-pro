"use client";

import { Badge } from "@/components/ui/badge";
import { IconChevronRight, IconBooks } from "@tabler/icons-react";
import { AddCompetencyButton } from "@/components/gestion/academico/competencias/add-competency-button";
import { getIconComponent } from "@/components/ui/icon-utils";
import type { AreaWithNivel } from "./area-card";

interface AreaDetailHeaderProps {
  selectedArea: AreaWithNivel;
  competenciesCount: number;
  nivelId: string;
}

export function AreaDetailHeader({
  selectedArea,
  competenciesCount,
  nivelId,
}: AreaDetailHeaderProps) {
  const IconComp = selectedArea ? getIconComponent(selectedArea.icono) : IconBooks;
  const areaColor = selectedArea.color || "#4f46e5";

  return (
    <div className="px-6 py-4 border-b border-border/40 shrink-0 flex items-center justify-between bg-linear-to-r from-muted/30 via-transparent to-transparent">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="size-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
          style={{
            backgroundColor: `${areaColor}20`,
            color: areaColor,
            border: `1.5px solid ${areaColor}40`,
          }}
        >
          <IconComp className="size-5" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Malla Curricular</span>
            <IconChevronRight className="size-3 shrink-0 opacity-60" />
            <span
              className="font-bold truncate"
              style={{ color: areaColor }}
            >
              {selectedArea.nombre}
            </span>
          </div>

          <h2 className="text-base font-bold text-foreground leading-tight flex items-center gap-2">
            <span>Competencias y Capacidades Curriculares</span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono font-bold bg-primary/10 text-primary border-primary/20 rounded-full"
            >
              {competenciesCount}
            </Badge>
          </h2>
        </div>
      </div>

      <AddCompetencyButton
        areaId={selectedArea.id}
        nivelId={nivelId}
      />
    </div>
  );
}
