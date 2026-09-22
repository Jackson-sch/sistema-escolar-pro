"use client";

import {
  IconSchool,
  IconRocket,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import { SeccionPromocion } from "./promociones-types";

interface MappingConnectionBridgeProps {
  anioOrigen: number;
  anioDestino: number;
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
  studentCount: number;
}

export function MappingConnectionBridge({
  anioOrigen,
  anioDestino,
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
  studentCount,
}: MappingConnectionBridgeProps) {
  return (
    <Card className="p-4 rounded-2xl border-border/40 bg-card/80 backdrop-blur-md shadow-xs space-y-4">
      {/* Level Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-border/30">
        <LevelSegmentedControl
          levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
          value={selectedLevelId || (niveles[0]?.id ?? "")}
          onChange={onLevelChange}
          label="Nivel Educativo"
        />
      </div>

      {/* Dynamic Transfer Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Section Origen Box */}
        <div className="md:col-span-5 p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <IconSchool className="size-3.5" />
              1. Sección Origen ({anioOrigen})
            </span>
            {sourceSeccionObj && (
              <Badge
                variant="outline"
                className="text-[9px] font-bold bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-2 py-0.5 rounded-full"
              >
                {studentCount} Alumnos
              </Badge>
            )}
          </div>
          <Select value={sourceSeccionId} onValueChange={onSourceChange}>
            <SelectTrigger className="rounded-xl border-border/50 bg-background h-10 text-xs font-semibold">
              <SelectValue placeholder="Seleccionar aula de origen..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-background shadow-lg z-[80]">
              {filteredSourceSecciones.map((s) => (
                <SelectItem
                  key={s.id}
                  value={s.id}
                  className="text-xs font-medium"
                >
                  {s.grado?.nombre} &quot;{s.seccion}&quot;
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transfer Arrow Indicator */}
        <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
          <div className="size-9 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <IconArrowRight
              className="size-4.5 rotate-90 md:rotate-0"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Section Destino Box */}
        <div className="md:col-span-5 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <IconRocket className="size-3.5" />
              2. Sección Destino ({anioDestino})
            </span>
            {isAutoSelectedTarget && (
              <Badge
                variant="outline"
                className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-2 py-0.5 gap-1 rounded-full animate-pulse"
              >
                <IconSparkles className="size-3" />
                Correlativo
              </Badge>
            )}
          </div>
          <Select value={targetSeccionId} onValueChange={onTargetChange}>
            <SelectTrigger className="rounded-xl border-emerald-500/40 bg-emerald-500/10 h-10 text-xs font-bold text-foreground">
              <SelectValue placeholder="Seleccionar aula de destino..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-background shadow-lg z-[80]">
              {filteredTargetSecciones.map((s) => (
                <SelectItem
                  key={s.id}
                  value={s.id}
                  className="text-xs font-medium"
                >
                  {s.grado?.nombre} &quot;{s.seccion}&quot;
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
