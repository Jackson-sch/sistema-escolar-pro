"use client";

import { IconFilter } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BatchCardsFiltersProps {
  selectedNivel: string;
  selectedGrado: string;
  selectedSeccionId: string;
  availableNiveles: string[];
  availableGrados: { id: string; nombre: string }[];
  availableSecciones: any[];
  onNivelChange: (val: string) => void;
  onGradoChange: (val: string) => void;
  onSeccionChange: (val: string) => void;
}

export function BatchCardsFilters({
  selectedNivel,
  selectedGrado,
  selectedSeccionId,
  availableNiveles,
  availableGrados,
  availableSecciones,
  onNivelChange,
  onGradoChange,
  onSeccionChange,
}: BatchCardsFiltersProps) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <IconFilter className="size-3.5 text-primary" />
        Filtros de Selección
      </label>

      {/* Selector de Nivel */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          Nivel Académico
        </span>
        <Select value={selectedNivel} onValueChange={onNivelChange}>
          <SelectTrigger className="h-9 w-full rounded-xl text-xs font-semibold">
            <SelectValue placeholder="Seleccione un nivel..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            {availableNiveles.map((n) => (
              <SelectItem
                key={n}
                value={n}
                className="text-xs font-medium cursor-pointer"
              >
                {n}
              </SelectItem>
            ))}
            <SelectItem
              value="ALL"
              className="text-xs font-semibold border-t border-border/40 mt-1 cursor-pointer"
            >
              Todos los niveles (Toda la I.E.)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Grado (Filtrado por Nivel) */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          Grado Escolar
        </span>
        <Select value={selectedGrado} onValueChange={onGradoChange}>
          <SelectTrigger className="h-9 w-full rounded-xl text-xs font-semibold">
            <SelectValue placeholder="Seleccione un grado..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem
              value="ALL"
              className="text-xs font-semibold cursor-pointer"
            >
              {selectedNivel && selectedNivel !== "ALL"
                ? `Todos los grados de ${selectedNivel}`
                : "Todos los grados"}
            </SelectItem>
            {availableGrados.map((g) => (
              <SelectItem
                key={g.id}
                value={g.id}
                className="text-xs font-medium cursor-pointer"
              >
                {g.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Sección / Aula (Filtrado por Grado y Nivel) */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          Sección / Aula
        </span>
        <Select
          value={selectedSeccionId}
          onValueChange={onSeccionChange}
          disabled={availableSecciones.length === 0}
        >
          <SelectTrigger className="h-9 w-full rounded-xl text-xs font-semibold">
            <SelectValue
              placeholder={
                availableSecciones.length === 0
                  ? "No hay secciones en esta selección"
                  : "Seleccione una sección..."
              }
            />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs max-h-56">
            <SelectItem
              value="ALL"
              className="text-xs font-semibold cursor-pointer"
            >
              {availableSecciones.length > 0
                ? `Todas las secciones (${availableSecciones.length})`
                : "Todas las secciones"}
            </SelectItem>
            {availableSecciones.map((s) => (
              <SelectItem
                key={s.id}
                value={s.id}
                className="text-xs font-medium cursor-pointer"
              >
                {s.grado?.nombre} &quot;{s.seccion}&quot;
                {s.sede?.nombre ? ` (${s.sede.nombre})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

