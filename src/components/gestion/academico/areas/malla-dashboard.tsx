"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { CompetencyList } from "./components/competency-list";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconTarget,
  IconSearch,
  IconBooks,
  IconSparkles,
} from "@tabler/icons-react";
import { AreaCard, type AreaWithNivel } from "./components/area-card";
import { MallaTopBar } from "./components/malla-top-bar";
import { AreaDetailHeader } from "./components/area-detail-header";

interface Nivel {
  id: string;
  nombre: string;
  descripcion?: string | null;
  institucionId: string;
  activo: boolean;
  [key: string]: any;
}

interface MallaDashboardProps {
  niveles: Nivel[];
  areas: AreaWithNivel[];
  competencies: any[];
  institucionId: string;
}

export function MallaDashboard({
  niveles,
  areas,
  competencies,
  institucionId,
}: MallaDashboardProps) {
  const defaultNivelId = niveles.length > 0 ? niveles[0].id : "all";

  const [nivelId, setNivelId] = useQueryState(
    "nivel",
    parseAsString.withDefault(defaultNivelId).withOptions({ shallow: false }),
  );

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar y desduplicar áreas curriculares por nivel (evitar duplicados globales si hay específicas del nivel)
  const filteredAreas = useMemo(() => {
    let result = areas;
    if (nivelId && nivelId !== "all") {
      result = result.filter(
        (a) =>
          a.nivelId === nivelId ||
          (!a.nivelId &&
            !areas.some(
              (other) =>
                other.nivelId === nivelId &&
                other.nombre.toLowerCase().trim() ===
                  a.nombre.toLowerCase().trim(),
            )),
      );
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.nombre.toLowerCase().includes(q) ||
          (a.descripcion && a.descripcion.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [areas, searchTerm, nivelId]);

  const effectiveSelectedAreaId =
    selectedAreaId && filteredAreas.some((a) => a.id === selectedAreaId)
      ? selectedAreaId
      : filteredAreas.length > 0
        ? (filteredAreas[0]?.id ?? null)
        : selectedAreaId;

  const selectedArea = useMemo(
    () => areas.find((a) => a.id === effectiveSelectedAreaId) || null,
    [areas, effectiveSelectedAreaId],
  );

  const selectedAreaCompetencies = useMemo(
    () =>
      effectiveSelectedAreaId
        ? competencies.filter(
            (c) => c.areaCurricularId === effectiveSelectedAreaId,
          )
        : [],
    [competencies, effectiveSelectedAreaId],
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[600px]">
      {/* ── Top Bar: Selector de Nivel + Botones de Acción ── */}
      <MallaTopBar
        niveles={niveles}
        activeNivelId={nivelId}
        onNivelChange={(id) => {
          setNivelId(id);
          setSelectedAreaId(null);
        }}
        institucionId={institucionId}
      />

      {/* ── Split Pane: Lista de Áreas (Izquierda) + Detalle de Competencias (Derecha) ── */}
      <div className="flex flex-1 overflow-hidden min-h-0 gap-4">
        {/* ── Panel Izquierdo: Lista de Áreas Curriculares ── */}
        <div className="w-full md:w-[320px] lg:w-90 shrink-0 flex flex-col gap-3 h-full min-h-0 p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
          {/* List Header */}
          <div className="flex items-center justify-between px-0.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconBooks className="size-3.5 text-primary" />
              Áreas Curriculares
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border-primary/20 text-primary bg-primary/10 uppercase"
            >
              {filteredAreas.length}{" "}
              {filteredAreas.length === 1 ? "Área" : "Áreas"}
            </Badge>
          </div>

          {/* Search Input */}
          <div className="relative shrink-0">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar área curricular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl bg-background/80 border-border/40 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* List de Áreas */}
          <ScrollArea className="flex-1 min-h-0 pr-1">
            <div className="space-y-2.5 pb-4">
              {filteredAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border/40 bg-card/40 p-4">
                  <IconTarget className="size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-bold text-foreground">
                    No se encontraron áreas
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                    Cambia el nivel o crea una nueva área curricular para
                    comenzar.
                  </p>
                </div>
              ) : (
                filteredAreas.map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    isSelected={effectiveSelectedAreaId === area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    areaCompsCount={
                      competencies.filter((c) => c.areaCurricularId === area.id)
                        .length
                    }
                    institucionId={institucionId}
                    niveles={niveles}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Panel Derecho: Competencias y Capacidades ── */}
        <Card className="hidden md:flex flex-1 flex-col overflow-hidden min-h-0 p-0 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
          {selectedArea ? (
            <div className="flex flex-col h-full min-h-0">
              <AreaDetailHeader
                selectedArea={selectedArea}
                competenciesCount={selectedAreaCompetencies.length}
                nivelId={nivelId}
              />

              {/* Detail body */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-6 pt-5 pb-8">
                  <CompetencyList
                    competencies={selectedAreaCompetencies}
                    areaId={selectedArea.id}
                  />
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="space-y-3 max-w-xs">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-inner">
                  <IconSparkles className="size-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Selecciona un Área Curricular
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Elige un área de la lista para gestionar sus competencias,
                    capacidades y estándares CNEB.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}