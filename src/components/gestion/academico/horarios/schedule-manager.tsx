"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getHorariosBySeccionAction,
  deleteHorarioAction,
} from "@/actions/schedules";
import { Card } from "@/components/ui/card";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryState, parseAsString } from "nuqs";
import { ScheduleGrid } from "./schedule-grid";
import { AddScheduleDialog } from "./add-schedule-dialog";
import {
  Section,
  Horario,
  ScheduleCourse,
  ScheduleManagerProps,
} from "./components/schedule-types";
import { useScheduleDnd } from "./components/use-schedule-dnd";
import { ScheduleToolbar } from "./components/schedule-toolbar";
import { ScheduleSelectorsRow } from "./components/schedule-selectors-row";
import { SchedulePrintHeader } from "./components/schedule-print-header";
import {
  ScheduleLoadingState,
  ScheduleEmptyState,
} from "./components/schedule-feedback-states";

export function ScheduleManager({
  secciones,
  allCourses,
  selectedYear,
}: ScheduleManagerProps) {
  const router = useRouter();

  const [selectedNivelId, setSelectedNivelId] = useQueryState(
    "nivelId",
    parseAsString.withDefault(""),
  );
  const [selectedGradoId, setSelectedGradoId] = useQueryState(
    "gradoId",
    parseAsString.withDefault(""),
  );
  const [selectedSeccionId, setSelectedSeccionId] = useQueryState(
    "seccionId",
    parseAsString.withDefault(""),
  );
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const niveles = useMemo<Array<{ id: string; nombre: string }>>(() => {
    const map = new Map<string, { id: string; nombre: string }>();
    secciones.forEach((s) => {
      if (!map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel);
    });
    return Array.from(map.values());
  }, [secciones]);

  const grados = useMemo<Array<{ id: string; nombre: string }>>(() => {
    if (!selectedNivelId) return [];
    const map = new Map<string, { id: string; nombre: string }>();
    secciones.forEach((s) => {
      if (s.nivel.id === selectedNivelId && !map.has(s.grado.id)) {
        map.set(s.grado.id, s.grado);
      }
    });
    return Array.from(map.values());
  }, [secciones, selectedNivelId]);

  const filteredSecciones = useMemo(() => {
    if (!selectedGradoId) return [];
    return secciones.filter((s) => s.grado.id === selectedGradoId);
  }, [secciones, selectedGradoId]);

  // Auto-selección en cascada al cargar o cambiar niveles
  useEffect(() => {
    if (niveles.length > 0 && !selectedNivelId) {
      setSelectedNivelId(niveles[0].id);
    }
  }, [niveles, selectedNivelId, setSelectedNivelId]);

  useEffect(() => {
    if (
      grados.length > 0 &&
      (!selectedGradoId || !grados.some((g) => g.id === selectedGradoId))
    ) {
      setSelectedGradoId(grados[0].id);
    }
  }, [grados, selectedGradoId, setSelectedGradoId]);

  useEffect(() => {
    if (
      filteredSecciones.length > 0 &&
      (!selectedSeccionId ||
        !filteredSecciones.some((s) => s.id === selectedSeccionId))
    ) {
      setSelectedSeccionId(filteredSecciones[0].id);
    }
  }, [filteredSecciones, selectedSeccionId, setSelectedSeccionId]);

  useEffect(() => {
    let ignore = false;
    if (selectedSeccionId) {
      setLoading(true);
      getHorariosBySeccionAction(selectedSeccionId)
        .then((res) => {
          if (ignore) return;
          if (res.data) setHorarios(res.data);
          else toast.error(res.error);
        })
        .catch(() => {
          if (!ignore) toast.error("Error al cargar horarios");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    } else {
      setHorarios([]);
    }
    return () => {
      ignore = true;
    };
  }, [selectedSeccionId]);

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const res = await getHorariosBySeccionAction(selectedSeccionId);
      if (res.data) setHorarios(res.data);
      else toast.error(res.error);
    } finally {
      setLoading(false);
    }
  };

  const { activeId, sensors, handleDragStart, handleDragEnd, handleDuplicate } =
    useScheduleDnd({
      horarios,
      setHorarios,
      onRefetch: fetchHorarios,
    });

  const sectionCourses = allCourses.filter(
    (c) => c.nivelAcademicoId === selectedSeccionId,
  );

  // Breadcrumb info
  const selectedNivel = niveles.find((n) => n.id === selectedNivelId);
  const selectedGrado = grados.find((g) => g.id === selectedGradoId);
  const selectedSeccion = filteredSecciones.find(
    (s) => s.id === selectedSeccionId,
  );

  const handleYearChange = (year: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("anio", year);
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  const handleNivelChange = (val: string) => {
    setSelectedNivelId(val);
    setSelectedGradoId("");
    setSelectedSeccionId("");
  };

  const handleGradoChange = (val: string) => {
    setSelectedGradoId(val);
    setSelectedSeccionId("");
  };

  const handlePrint = () => {
    if (!selectedSeccionId) {
      toast.error("Selecciona nivel, grado y sección para imprimir.");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* ── Filter Panel ── */}
      <Card className="border-border/50 overflow-hidden p-0">
        <ScheduleToolbar
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          nivelName={selectedNivel?.nombre}
          gradoName={selectedGrado?.nombre}
          seccionName={selectedSeccion?.seccion}
          hasSeccion={!!selectedSeccionId}
          horariosCount={horarios.length}
          onPrint={handlePrint}
          onAdd={() => setIsDialogOpen(true)}
        />

        <ScheduleSelectorsRow
          niveles={niveles}
          selectedNivelId={selectedNivelId}
          onNivelChange={handleNivelChange}
          grados={grados}
          selectedGradoId={selectedGradoId}
          onGradoChange={handleGradoChange}
          filteredSecciones={filteredSecciones}
          selectedSeccionId={selectedSeccionId}
          onSeccionChange={setSelectedSeccionId}
        />
      </Card>

      {/* ── Content area ── */}
      {selectedSeccionId ? (
        loading ? (
          <ScheduleLoadingState />
        ) : (
          <div
            id="printable-schedule-area"
            className="printable-area space-y-4"
          >
            <SchedulePrintHeader
              nivelName={selectedNivel?.nombre}
              gradoName={selectedGrado?.nombre}
              seccionName={selectedSeccion?.seccion}
              year={selectedYear}
            />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <ScheduleGrid
                horarios={horarios}
                onDelete={async (id: string) => {
                  const res = await deleteHorarioAction(id);
                  if (res.success) {
                    toast.success(res.success);
                    fetchHorarios();
                  }
                }}
                onDuplicate={handleDuplicate}
              />
              <DragOverlay
                dropAnimation={{
                  duration: 250,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
              >
                {activeId ? (
                  <div className="p-3 rounded-lg border border-primary/20 bg-background/90 shadow-lg w-32 cursor-grabbing ring-2 ring-primary ring-offset-2 ring-offset-background/50 scale-105 opacity-90">
                    <p className="text-[10px] font-black uppercase text-primary animate-pulse">
                      Moviendo bloque...
                    </p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )
      ) : (
        <ScheduleEmptyState
          nivelSelected={!!selectedNivelId}
          gradoSelected={!!selectedGradoId}
          seccionSelected={!!selectedSeccionId}
        />
      )}

      <AddScheduleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courses={sectionCourses}
        existingSchedules={horarios}
        onSuccess={fetchHorarios}
      />
    </div>
  );
}
export type { Section, Horario, ScheduleCourse, ScheduleManagerProps };
