"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSchool, IconCalendar, IconLayersSubtract } from "@tabler/icons-react";

interface SeccionItem {
  id: string;
  seccion: string;
  nivelId?: string;
  gradoId?: string;
  grado?: { id?: string; nombre: string };
  nivel?: { id?: string; nombre: string };
}

interface CnebBatchHeaderSelectorsProps {
  secciones: SeccionItem[];
  selectedSeccionId: string;
  onSeccionChange: (id: string) => void;
  periodos: Array<{ id: string; nombre: string }>;
  selectedPeriodoId: string;
  onPeriodoChange: (id: string) => void;
}

export function CnebBatchHeaderSelectors({
  secciones,
  selectedSeccionId,
  onSeccionChange,
  periodos,
  selectedPeriodoId,
  onPeriodoChange,
}: CnebBatchHeaderSelectorsProps) {
  // 1. Extraer niveles únicos
  const niveles = React.useMemo(() => {
    const map = new Map<string, string>();
    secciones.forEach((s) => {
      const id = s.nivel?.id || s.nivelId || s.nivel?.nombre || "";
      const nombre = s.nivel?.nombre || "";
      if (id && nombre && !map.has(id)) {
        map.set(id, nombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [secciones]);

  // Identificar la sección actual para sincronizar el nivel y grado activo
  const activeSection = React.useMemo(() => {
    return secciones.find((s) => s.id === selectedSeccionId) || secciones[0];
  }, [secciones, selectedSeccionId]);

  const [selectedNivelId, setSelectedNivelId] = React.useState<string>(() => {
    return activeSection?.nivel?.id || activeSection?.nivelId || activeSection?.nivel?.nombre || niveles[0]?.id || "";
  });

  const [selectedGradoId, setSelectedGradoId] = React.useState<string>(() => {
    return activeSection?.grado?.id || activeSection?.gradoId || activeSection?.grado?.nombre || "";
  });

  // Mantener sincronizado si la sección activa cambia externamente
  React.useEffect(() => {
    if (activeSection) {
      const nId = activeSection.nivel?.id || activeSection.nivelId || activeSection.nivel?.nombre || "";
      const gId = activeSection.grado?.id || activeSection.gradoId || activeSection.grado?.nombre || "";
      if (nId && nId !== selectedNivelId) setSelectedNivelId(nId);
      if (gId && gId !== selectedGradoId) setSelectedGradoId(gId);
    }
  }, [activeSection]);

  // 2. Grados disponibles para el nivel seleccionado
  const gradosDisponibles = React.useMemo(() => {
    const map = new Map<string, string>();
    secciones
      .filter((s) => {
        if (!selectedNivelId) return true;
        const nId = s.nivel?.id || s.nivelId || s.nivel?.nombre || "";
        return nId === selectedNivelId;
      })
      .forEach((s) => {
        const id = s.grado?.id || s.gradoId || s.grado?.nombre || "";
        const nombre = s.grado?.nombre || "";
        if (id && nombre && !map.has(id)) {
          map.set(id, nombre);
        }
      });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [secciones, selectedNivelId]);

  // 3. Secciones disponibles para el nivel y grado seleccionados
  const seccionesDisponibles = React.useMemo(() => {
    return secciones.filter((s) => {
      const nId = s.nivel?.id || s.nivelId || s.nivel?.nombre || "";
      const gId = s.grado?.id || s.gradoId || s.grado?.nombre || "";
      const matchNivel = !selectedNivelId || nId === selectedNivelId;
      const matchGrado = !selectedGradoId || gId === selectedGradoId;
      return matchNivel && matchGrado;
    });
  }, [secciones, selectedNivelId, selectedGradoId]);

  // Manejar cambio de Nivel
  const handleNivelChange = (newNivelId: string) => {
    setSelectedNivelId(newNivelId);
    const validGrados = secciones
      .filter((s) => {
        const nId = s.nivel?.id || s.nivelId || s.nivel?.nombre || "";
        return nId === newNivelId;
      })
      .map((s) => s.grado?.id || s.gradoId || s.grado?.nombre || "");
    const firstValidGradoId = validGrados[0] || "";
    setSelectedGradoId(firstValidGradoId);

    const firstValidSeccion = secciones.find((s) => {
      const nId = s.nivel?.id || s.nivelId || s.nivel?.nombre || "";
      const gId = s.grado?.id || s.gradoId || s.grado?.nombre || "";
      return nId === newNivelId && (!firstValidGradoId || gId === firstValidGradoId);
    });

    if (firstValidSeccion) {
      onSeccionChange(firstValidSeccion.id);
    }
  };

  // Manejar cambio de Grado
  const handleGradoChange = (newGradoId: string) => {
    setSelectedGradoId(newGradoId);
    const firstValidSeccion = secciones.find((s) => {
      const nId = s.nivel?.id || s.nivelId || s.nivel?.nombre || "";
      const gId = s.grado?.id || s.gradoId || s.grado?.nombre || "";
      const matchNivel = !selectedNivelId || nId === selectedNivelId;
      return matchNivel && gId === newGradoId;
    });

    if (firstValidSeccion) {
      onSeccionChange(firstValidSeccion.id);
    }
  };

  return (
    <div className="space-y-2.5 bg-muted/20 p-3 rounded-2xl border border-border/40">
      {/* Fila 1: Nivel Académico y Grado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1.5">
            <IconLayersSubtract className="size-3.5 text-primary" />
            <span>1. Nivel Académico</span>
          </Label>
          <Select value={selectedNivelId} onValueChange={handleNivelChange}>
            <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border/50 bg-background font-medium">
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {niveles.map((n) => (
                <SelectItem key={n.id} value={n.id} className="text-xs font-semibold">
                  {n.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1.5">
            <IconSchool className="size-3.5 text-primary" />
            <span>2. Grado</span>
          </Label>
          <Select
            value={selectedGradoId}
            onValueChange={handleGradoChange}
            disabled={gradosDisponibles.length === 0}
          >
            <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border/50 bg-background font-medium">
              <SelectValue placeholder="Seleccionar grado" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {gradosDisponibles.map((g) => (
                <SelectItem key={g.id} value={g.id} className="text-xs font-semibold">
                  {g.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fila 2: Sección y Periodo Académico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1.5">
            <IconSchool className="size-3.5 text-primary" />
            <span>3. Sección</span>
          </Label>
          <Select
            value={selectedSeccionId}
            onValueChange={onSeccionChange}
            disabled={seccionesDisponibles.length === 0}
          >
            <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border/50 bg-background font-medium">
              <SelectValue placeholder="Seleccionar sección" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {seccionesDisponibles.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs font-semibold">
                  Sección "{s.seccion}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-foreground/80 flex items-center gap-1.5">
            <IconCalendar className="size-3.5 text-primary" />
            <span>Periodo Académico</span>
          </Label>
          <Select value={selectedPeriodoId} onValueChange={onPeriodoChange}>
            <SelectTrigger className="w-full text-xs h-9 rounded-xl border-border/50 bg-background font-medium">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {periodos.map((per) => (
                <SelectItem key={per.id} value={per.id} className="text-xs font-medium">
                  {per.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
