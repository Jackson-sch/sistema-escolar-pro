"use client";

import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { FormModal } from "@/components/modals/form-modal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ProspectoForm } from "@/components/gestion/admisiones/management/prospecto-form";
import { AdmisionFlow } from "@/components/gestion/admisiones/management/admision-flow";
import {
  updateProspectoStatusAction,
  convertProspectoToAdmisionAction,
  updateAdmisionResultAction,
  convertProspectoToEstudianteAction,
} from "@/actions/admissions";

import { COLUMNS } from "./kanban/kanban-types";
import { KanbanToolbar } from "./kanban/kanban-toolbar";
import { KanbanColumn } from "./kanban/kanban-column";

interface ProspectoKanbanProps {
  data: any[];
  grados: any[];
  instituciones: any[];
}

const EMPTY_DATA: any[] = [];
const EMPTY_GRADOS: any[] = [];
const EMPTY_INSTITUCIONES: any[] = [];

export function ProspectoKanban({
  data = EMPTY_DATA,
  grados = EMPTY_GRADOS,
  instituciones = EMPTY_INSTITUCIONES,
}: ProspectoKanbanProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showEditId, setShowEditId] = useState<string | null>(null);
  const [showFlowId, setShowFlowId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  // Filtros locales
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("ALL");

  // Filtrado de prospectos
  const filteredData = useMemo(() => {
    return data.filter((p) => {
      if (selectedGradeId !== "ALL" && p.gradoInteresId !== selectedGradeId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text =
          `${p.nombre} ${p.apellidoPaterno || ""} ${p.apellidoMaterno || ""} ${p.dni || ""} ${p.telefono || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [data, selectedGradeId, searchQuery]);

  // Modales
  const activeEditProspecto = data.find((p) => p.id === showEditId);
  const activeFlowProspecto = data.find((p) => p.id === showFlowId);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    draggedIdRef.current = id;
  };

  const handleDragEnd = () => {
    draggedIdRef.current = null;
    setHoveredCol(null);
  };

  const handleMove = async (id: string, newStatus: string) => {
    const prospecto = data.find((p) => p.id === id);
    if (!prospecto) return;

    const oldStatus = prospecto.estado;
    if (oldStatus === newStatus) return;

    setLoadingId(id);
    try {
      if (newStatus === "EVALUANDO") {
        const res = await convertProspectoToAdmisionAction({
          prospectoId: id,
        });
        if (res.success) toast.success(res.success);
        else toast.error(res.error);
      } else if (
        (newStatus === "ADMITIDO" || newStatus === "RECHAZADO") &&
        oldStatus === "EVALUANDO"
      ) {
        const admisionId = prospecto.admision?.id;
        if (admisionId) {
          const res = await updateAdmisionResultAction({
            admisionId,
            values: { resultadoExamen: "Actualizado vía CRM Kanban" },
            finalStatus: newStatus as any,
          });
          if (res.success) toast.success(res.success);
          else toast.error(res.error);
        } else {
          const res = await updateProspectoStatusAction({
            id,
            estado: newStatus,
          });
          if (res.success) toast.success(res.success);
          else toast.error(res.error);
        }
      } else if (newStatus === "MATRICULADO" && oldStatus === "ADMITIDO") {
        const res = await convertProspectoToEstudianteAction({
          prospectoId: id,
        });
        if (res.success) toast.success(res.success);
        else toast.error(res.error);
      } else {
        const res = await updateProspectoStatusAction({
          id,
          estado: newStatus,
        });
        if (res.success) toast.success(res.success);
        else toast.error(res.error);
      }
    } catch {
      toast.error("Ocurrió un error inesperado al mover el prospecto");
    } finally {
      setLoadingId(null);
    }
  };

  const onStartEvaluation = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await convertProspectoToAdmisionAction({
        prospectoId: id,
      });
      if (res.success) toast.success(res.success);
      else toast.error(res.error);
    } finally {
      setLoadingId(null);
    }
  };

  const onEnrollStudent = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await convertProspectoToEstudianteAction({
        prospectoId: id,
      });
      if (res.success) toast.success(res.success);
      else toast.error(res.error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-200">
      {/* BARRA DE FILTROS DEL KANBAN */}
      <KanbanToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedGradeId={selectedGradeId}
        onSelectedGradeIdChange={setSelectedGradeId}
        grados={grados}
        onClearFilters={() => {
          setSearchQuery("");
          setSelectedGradeId("ALL");
        }}
      />

      {/* TABLERO KANBAN DE 5 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start w-full overflow-x-auto pb-4 scrollbar-hide">
        {COLUMNS.map((col) => {
          const colProspectos = filteredData.filter(
            (p) => p.estado === col.id,
          );
          const isHovered = hoveredCol === col.id;

          return (
            <KanbanColumn
              key={col.id}
              column={col}
              prospectos={colProspectos}
              grados={grados}
              isHovered={isHovered}
              loadingId={loadingId}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setHoveredCol(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setHoveredCol(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const idFromData =
                  e.dataTransfer.getData("text/plain") ||
                  e.dataTransfer.getData("text");
                const targetId = idFromData || draggedIdRef.current;
                if (targetId) {
                  handleMove(targetId, col.id);
                }
                setHoveredCol(null);
                draggedIdRef.current = null;
              }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onShowEdit={setShowEditId}
              onShowFlow={setShowFlowId}
              onMove={handleMove}
              onStartEvaluation={onStartEvaluation}
              onEnrollStudent={onEnrollStudent}
            />
          );
        })}
      </div>

      {/* Modales de Edición y Flujo */}
      <FormModal
        isOpen={!!showEditId}
        onOpenChange={(open) => !open && setShowEditId(null)}
        title="Editar Ficha de Postulante"
        description="Actualiza la información del postulante o apoderado"
      >
        {activeEditProspecto && (
          <ProspectoForm
            initialData={activeEditProspecto}
            grados={grados}
            instituciones={instituciones}
            onSuccess={() => setShowEditId(null)}
          />
        )}
      </FormModal>

      <Sheet
        open={!!showFlowId}
        onOpenChange={(open) => !open && setShowFlowId(null)}
      >
        <SheetContent className="w-full sm:max-w-xl p-0 border-l border-border/60 bg-background flex flex-col">
          <SheetHeader className="p-6 pb-2 border-b border-border/40">
            <SheetTitle className="text-base font-extrabold">
              Expediente de Admisión
            </SheetTitle>
            <SheetDescription className="text-xs">
              Evaluación psicológica y validación de vacante
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {activeFlowProspecto && (
              <AdmisionFlow
                prospecto={activeFlowProspecto}
                onSuccess={() => setShowFlowId(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
