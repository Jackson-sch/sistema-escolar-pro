"use client";

import { SelectItem } from "@/components/ui/select";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import { SelectField } from "./select-field";

interface SectionItem {
  id: string;
  seccion: string;
}

interface ScheduleFiltersProps {
  niveles: { id: string; nombre: string }[];
  selectedNivelId: string;
  onNivelChange: (nivelId: string) => void;
  grados: { id: string; nombre: string }[];
  selectedGradoId: string;
  onGradoChange: (gradoId: string) => void;
  secciones: SectionItem[];
  selectedSeccionId: string;
  onSeccionChange: (seccionId: string) => void;
}

export function ScheduleFilters({
  niveles,
  selectedNivelId,
  onNivelChange,
  grados,
  selectedGradoId,
  onGradoChange,
  secciones,
  selectedSeccionId,
  onSeccionChange,
}: ScheduleFiltersProps) {
  return (
    <div className="px-4 sm:px-5 py-4 bg-muted/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <div className="md:col-span-5">
        <LevelSegmentedControl
          levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
          value={selectedNivelId}
          onChange={onNivelChange}
          label="1. Nivel"
        />
      </div>

      <div className="md:col-span-4 lg:col-span-3">
        <SelectField
          label="2. Grado / Año"
          placeholder="Selecciona grado"
          value={selectedGradoId}
          onValueChange={onGradoChange}
          disabled={!selectedNivelId}
          step={2}
          completed={!!selectedGradoId}
        >
          {grados.map((g: any) => (
            <SelectItem key={g.id} value={g.id} className="rounded-lg text-sm">
              {g.nombre}
            </SelectItem>
          ))}
        </SelectField>
      </div>

      <div className="md:col-span-3 lg:col-span-4">
        <SelectField
          label="3. Sección"
          placeholder="Selecciona sección"
          value={selectedSeccionId}
          onValueChange={onSeccionChange}
          disabled={!selectedGradoId}
          step={3}
          completed={!!selectedSeccionId}
        >
          {secciones.map((s) => (
            <SelectItem key={s.id} value={s.id} className="rounded-lg text-sm">
              Sección {s.seccion}
            </SelectItem>
          ))}
        </SelectField>
      </div>
    </div>
  );
}
