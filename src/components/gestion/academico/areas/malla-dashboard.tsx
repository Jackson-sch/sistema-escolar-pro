"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { AddAreaButton } from "@/components/gestion/academico/areas/add-area-button";
import { SeedCnebButton } from "@/components/gestion/academico/areas/seed-cneb-button";
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
  IconBooks,
  IconSparkles,
} from "@tabler/icons-react";
import { deleteAreaAction } from "@/actions/academic";
import { AreaForm } from "@/components/gestion/academico/areas/area-form";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { toast } from "sonner";
import { getIconComponent } from "@/components/ui/icon-utils";

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
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const IconComp = getIconComponent(area.icono);
  const areaColor = area.color || "#4f46e5";

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 rounded-2xl border overflow-hidden relative group shadow-xs",
          isSelected
            ? "border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/40 shadow-sm"
            : "bg-card/70 border-border/40 hover:bg-card hover:border-indigo-500/30 hover:shadow-sm",
        )}
        onClick={onClick}
      >
        {/* Background watermark icon */}
        <div
          className="absolute right-[-8px] bottom-[-8px] transition-all duration-500 opacity-[0.06] group-hover:opacity-15 group-hover:scale-110 pointer-events-none"
          style={{ color: areaColor }}
        >
          <IconComp className="w-20 h-20" />
        </div>

        {/* Hover actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-0.5 rounded-lg border border-border/40 shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditDialog(true);
            }}
            title="Editar área"
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmModal(true);
            }}
            title="Eliminar área"
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>

        <CardContent className="p-3.5 relative z-0 space-y-2">
          <div className="flex items-start gap-2.5 pr-10">
            <div
              className="size-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5"
              style={{
                backgroundColor: `${areaColor}15`,
                color: areaColor,
                border: `1px solid ${areaColor}30`,
              }}
            >
              <IconComp className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-foreground truncate leading-snug">
                {area.nombre}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {area.descripcion || "Sin descripción asignada"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full gap-1 uppercase tracking-wider",
                isSelected
                  ? "bg-indigo-600 text-white border-none shadow-xs"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              )}
            >
              <IconLayersSubtract className="size-3" />
              {areaCompsCount} {areaCompsCount === 1 ? "Competencia" : "Competencias"}
            </Badge>
            <IconChevronRight
              className={cn(
                "size-3.5 transition-transform duration-300",
                isSelected
                  ? "text-indigo-500 translate-x-0.5"
                  : "text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5",
              )}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Área Curricular"
        description={`¿Estás seguro de eliminar "${area.nombre}"? Si tiene competencias asociadas, podría fallar.`}
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

  const filteredAreas = useMemo(() => {
    let result = areas;
    if (nivelId && nivelId !== "all")
      result = result.filter(
        (a) => a.nivelId === nivelId || a.nivel?.id === nivelId,
      );
    if (searchTerm.trim())
      result = result.filter((a) =>
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      );
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

  const SelectedAreaIcon = selectedArea ? getIconComponent(selectedArea.icono) : IconBooks;
  const selectedAreaColor = selectedArea?.color || "#4f46e5";

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] gap-4 animate-in fade-in animation-duration-">
      {/* ── Top Bar: Selector de Nivel + Botones de Acción ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 p-4 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border/40 bg-muted/40 flex-wrap">
          {niveles.map((nivel) => {
            const isActive = nivelId === nivel.id;
            return (
              <button
                key={nivel.id}
                onClick={() => {
                  setNivelId(nivel.id);
                  setSelectedAreaId(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer flex items-center gap-2",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/80",
                )}
              >
                <span>{nivel.nombre.toLowerCase()}</span>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <SeedCnebButton nivelId={nivelId !== "all" ? nivelId : undefined} />
          <AddAreaButton institucionId={institucionId} niveles={niveles} />
        </div>
      </div>

      {/* ── Split Pane: Lista de Áreas (Izquierda) + Detalle de Competencias (Derecha) ── */}
      <div className="flex flex-1 overflow-hidden min-h-0 gap-4">
        {/* ── Panel Izquierdo: Lista de Áreas Curriculares ── */}
        <div className="w-full md:w-[320px] lg:w-90 shrink-0 flex flex-col gap-3 h-full min-h-0 p-4 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-xs">
          {/* List Header */}
          <div className="flex items-center justify-between px-0.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconBooks className="size-3.5 text-indigo-500" />
              Áreas Curriculares
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 uppercase"
            >
              {filteredAreas.length} {filteredAreas.length === 1 ? "Área" : "Áreas"}
            </Badge>
          </div>

          {/* Search Input */}
          <div className="relative shrink-0">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar área curricular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl bg-background/80 border-border/40 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>

          {/* List de Áreas */}
          <ScrollArea className="flex-1 min-h-0 pr-1">
            <div className="space-y-2.5 pb-4">
              {filteredAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border/40 bg-card/80 p-4">
                  <IconTarget className="size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-bold text-foreground">
                    No se encontraron áreas
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Añade un área curricular o ajusta los filtros de búsqueda.
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
        <Card className="hidden md:flex flex-1 flex-col overflow-hidden min-h-0 p-0 rounded-2xl border-border/40 bg-card/80 backdrop-blur-md shadow-xl">
          {selectedArea ? (
            <div className="flex flex-col h-full min-h-0">
              {/* Detail Banner Header */}
              <div className="px-6 py-4 border-b border-border/30 shrink-0 flex items-center justify-between bg-linear-to-r from-muted/30 via-transparent to-transparent">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="size-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                    style={{
                      backgroundColor: `${selectedAreaColor}20`,
                      color: selectedAreaColor,
                      border: `1.5px solid ${selectedAreaColor}40`,
                    }}
                  >
                    <SelectedAreaIcon className="size-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span>Malla Curricular</span>
                      <IconChevronRight className="size-3 shrink-0" />
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate">
                        {selectedArea.nombre}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-tight flex items-center gap-2">
                      <span>Competencias y Capacidades Curriculares</span>
                      <Badge variant="outline" className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 border-indigo-500/20 rounded-full">
                        {selectedAreaCompetencies.length}
                      </Badge>
                    </h2>
                  </div>
                </div>

                <AddCompetencyButton
                  areaId={selectedArea.id}
                  nivelId={nivelId}
                />
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
                <div className="size-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                  <IconSparkles className="size-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Selecciona un Área Curricular
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Elige un área de la lista para gestionar sus competencias, capacidades y estándares CNEB.
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