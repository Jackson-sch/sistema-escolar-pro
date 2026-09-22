"use client";

import * as React from "react";
import { EscalaCalificacion } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCopy } from "@tabler/icons-react";

interface CnebBatchConfigPanelProps {
  tipos: Array<{ id: string; nombre: string; codigo: string }>;
  selectedTipoId: string;
  onTipoChange: (id: string) => void;
  escala: EscalaCalificacion;
  onEscalaChange: (escala: EscalaCalificacion) => void;
  seccionesParalelas: Array<{ id: string; seccion: string; gradoNombre: string }>;
  selectedParalelas: string[];
  onToggleParalela: (id: string) => void;
}

export function CnebBatchConfigPanel({
  tipos,
  selectedTipoId,
  onTipoChange,
  escala,
  onEscalaChange,
  seccionesParalelas,
  selectedParalelas,
  onToggleParalela,
}: CnebBatchConfigPanelProps) {
  return (
    <div className="space-y-3.5 pt-2 border-t border-border/40">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tipo de Evaluación */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground/80">
            Tipo de Evaluación
          </Label>
          <Select value={selectedTipoId} onValueChange={onTipoChange}>
            <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border/50">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {tipos.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs font-medium">
                  {t.nombre} ({t.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Escala de Calificación */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground/80">
            Escala de Calificación
          </Label>
          <Select
            value={escala}
            onValueChange={(v) => onEscalaChange(v as EscalaCalificacion)}
          >
            <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border/50">
              <SelectValue placeholder="Escala" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value={EscalaCalificacion.LITERAL} className="text-xs font-medium">
                Cualitativa / Literal (AD, A, B, C) · Inicial / Primaria
              </SelectItem>
              <SelectItem value={EscalaCalificacion.VIGESIMAL} className="text-xs font-medium">
                Vigesimal Cuantitativa (0 - 20) · Secundaria
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Replicación en Secciones Paralelas */}
      {seccionesParalelas.length > 0 && (
        <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/90">
            <IconCopy className="size-3.5 text-primary" />
            <span>Replicar automáticamente en secciones paralelas del mismo grado:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {seccionesParalelas.map((p) => {
              const isChecked = selectedParalelas.includes(p.id);
              return (
                <label
                  key={p.id}
                  className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none bg-background px-2.5 py-1 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggleParalela(p.id)}
                    className="rounded"
                  />
                  <span>Sección {p.seccion}</span>
                </label>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Creará las mismas evaluaciones por competencia para los cursos homónimos en las secciones seleccionadas.
          </p>
        </div>
      )}
    </div>
  );
}
