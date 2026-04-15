"use client";

import React, { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { AddAreaButton } from "@/components/gestion/academico/areas/add-area-button";
import { AddCompetencyButton } from "@/components/gestion/academico/competencias/add-competency-button";
import { CompetencyList } from "./components/competency-list";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconTarget,
  IconSearch,
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconLayersSubtract,
} from "@tabler/icons-react";
import { deleteAreaAction } from "@/actions/academic";
import { AreaForm } from "@/components/gestion/academico/areas/area-form";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { toast } from "sonner";
import { getIconComponent } from "@/components/ui/icon-picker";

interface Nivel {
  id: string;
  nombre: string;
  descripcion?: string | null;
  institucionId: string;
  activo: boolean;
  [key: string]: any;
}

interface AreaWithNivel {
  id: string;
  nombre: string;
  descripcion?: string | null;
  nivel?: Nivel | null;
  [key: string]: any;
}

interface MallaDashboardProps {
  niveles: Nivel[];
  areas: AreaWithNivel[];
  competencies: any[];
  institucionId: string;
}

/* ─── AreaCard ─── */
function AreaCard({
  area,
  isSelected,
  onClick,
  areaCompsCount,
  institucionId,
  niveles,
}: {
  area: AreaWithNivel;
  isSelected: boolean;
  onClick: () => void;
  areaCompsCount: number;
  institucionId: string;
  niveles: Nivel[];
}) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAreaAction(area.id);
      if (res.success) { toast.success(res.success); setShowConfirmModal(false); }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const IconComp = getIconComponent(area.icono);
  const areaColor = area.color || "#3b82f6";

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 border overflow-hidden relative group",
          isSelected ? "shadow-sm" : "hover:border-border hover:shadow-sm",
        )}
        style={{
          borderColor: isSelected ? areaColor : `${areaColor}35`,
          backgroundColor: isSelected ? `${areaColor}0D` : undefined,
        }}
        onClick={onClick}
      >
        {/* Background icon */}
        <div
          className="absolute right-[-10px] top-[-4px] transition-all duration-500 opacity-10 group-hover:opacity-20 group-hover:scale-105"
          style={{ color: areaColor }}
        >
          <IconComp className="w-24 h-24" />
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowEditDialog(true); }}
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowConfirmModal(true); }}
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>

        <CardContent className="p-4 relative z-0 space-y-2">
          <div className="pr-10">
            <h4 className="font-bold text-sm leading-snug text-foreground truncate">
              {area.nombre}
            </h4>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
              {area.descripcion || "Sin descripción"}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <Badge
              variant="outline"
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md gap-1 border-border/60"
              style={isSelected ? { borderColor: `${areaColor}50`, color: areaColor, backgroundColor: `${areaColor}10` } : {}}
            >
              <IconLayersSubtract className="size-2.5" />
              {areaCompsCount} {areaCompsCount === 1 ? "Competencia" : "Competencias"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Área Curricular"
        description={`¿Estás seguro de eliminar "${area.nombre}"? Si tiene cursos y competencias asociadas, podría fallar la eliminación.`}
      />
      <FormModal
        title="Editar Área Curricular"
        description="Modifica los detalles de esta área curricular."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-lg"
      >
        <AreaForm
          id={area.id}
          initialData={area}
          institucionId={institucionId}
          niveles={niveles}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>
    </>
  );
}

/* ─── MallaDashboard ─── */
export function MallaDashboard({ niveles, areas, competencies, institucionId }: MallaDashboardProps) {
  const defaultNivelId = niveles.length > 0 ? niveles[0].id : "all";

  const [nivelId, setNivelId] = useQueryState(
    "nivel",
    parseAsString.withDefault(defaultNivelId).withOptions({ shallow: false }),
  );

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAreas = useMemo(() => {
    let result = areas;
    if (nivelId && nivelId !== "all")
      result = result.filter(a => a.nivelId === nivelId || a.nivel?.id === nivelId);
    if (searchTerm.trim())
      result = result.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [areas, searchTerm, nivelId]);

  React.useEffect(() => {
    if (filteredAreas.length > 0 && (!selectedAreaId || !filteredAreas.find(a => a.id === selectedAreaId)))
      setSelectedAreaId(filteredAreas[0].id);
  }, [filteredAreas, selectedAreaId]);

  const selectedArea = useMemo(() => areas.find(a => a.id === selectedAreaId) || null, [areas, selectedAreaId]);

  const selectedAreaCompetencies = useMemo(() =>
    selectedAreaId ? competencies.filter(c => c.areaCurricularId === selectedAreaId) : [],
    [competencies, selectedAreaId],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] gap-4">

      {/* ── Top bar: nivel tabs + add button ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/60 bg-muted/30 flex-wrap">
          {niveles.map(nivel => {
            const isActive = nivelId === nivel.id;
            return (
              <button
                key={nivel.id}
                onClick={() => { setNivelId(nivel.id); setSelectedAreaId(null); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {nivel.nombre.toLowerCase()}
              </button>
            );
          })}
        </div>

        <AddAreaButton institucionId={institucionId} niveles={niveles} />
      </div>

      {/* ── Split pane ── */}
      <div className="flex flex-1 overflow-hidden min-h-0 gap-4">

        {/* ── Left: area list ── */}
        <div className="w-full md:w-[300px] lg:w-[340px] shrink-0 flex flex-col gap-3 h-full min-h-0">

          {/* List header */}
          <div className="flex items-center justify-between px-0.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Áreas Curriculares
            </span>
            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-md border-primary/25 text-primary bg-primary/5">
              {filteredAreas.length} {filteredAreas.length === 1 ? "área" : "áreas"}
            </Badge>
          </div>

          {/* Search */}
          <div className="relative shrink-0">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm rounded-xl bg-muted/30 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/40"
            />
          </div>

          {/* List */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2 pb-8 pr-1">
              {filteredAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/50 bg-muted/10">
                  <IconTarget className="size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No se encontraron áreas.</p>
                </div>
              ) : (
                filteredAreas.map(area => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    isSelected={selectedAreaId === area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    areaCompsCount={competencies.filter(c => c.areaCurricularId === area.id).length}
                    institucionId={institucionId}
                    niveles={niveles}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Right: competency detail ── */}
        <Card className="hidden md:flex flex-1 flex-col overflow-hidden min-h-0 border-border/50">
          {selectedArea ? (
            <div className="flex flex-col h-full min-h-0">

              {/* Detail header */}
              <div className="px-6 py-4 border-b border-border/50 shrink-0 flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <span>Malla Curricular</span>
                    <IconChevronRight className="size-3 shrink-0" />
                    <span className="text-primary font-semibold truncate">{selectedArea.nombre}</span>
                  </div>
                  <h2 className="text-base font-bold text-foreground leading-tight">
                    Registro de Competencias
                  </h2>
                </div>
                <AddCompetencyButton areaId={selectedArea.id} nivelId={nivelId} />
              </div>

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
                <div className="size-14 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mx-auto">
                  <IconTarget className="size-7 text-muted-foreground/40" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Selecciona un Área</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Elige un área curricular para configurar sus competencias, capacidades y desempeños.
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