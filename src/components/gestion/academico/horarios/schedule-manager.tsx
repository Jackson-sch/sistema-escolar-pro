"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getHorariosBySeccionAction,
  deleteHorarioAction,
  upsertHorarioAction,
} from "@/actions/schedules";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  closestCenter, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor 
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { BLOQUES_HORARIO } from "@/lib/constants";
import {
  IconPlus,
  IconLoader2,
  IconClock,
  IconSchool,
  IconChevronRight,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ScheduleGrid } from "./schedule-grid";
import { AddScheduleDialog } from "./add-schedule-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";

interface Section {
  id: string;
  seccion: string;
  grado: { id: string; nombre: string };
  nivel: { id: string; nombre: string };
}

interface ScheduleManagerProps {
  secciones: Section[];
  allCourses: any[];
  selectedYear: number;
}

export function ScheduleManager({
  secciones,
  allCourses,
  selectedYear,
}: ScheduleManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedNivelId, setSelectedNivelId] = useState<string>("");
  const [selectedGradoId, setSelectedGradoId] = useState<string>("");
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("");
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // DnD States & Sensors
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const niveles = useMemo(() => {
    const map = new Map();
    secciones.forEach((s) => { if (!map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel); });
    return Array.from(map.values());
  }, [secciones]);

  const grados = useMemo(() => {
    if (!selectedNivelId) return [];
    const map = new Map();
    secciones
      .filter((s) => s.nivel.id === selectedNivelId)
      .forEach((s) => { if (!map.has(s.grado.id)) map.set(s.grado.id, s.grado); });
    return Array.from(map.values());
  }, [secciones, selectedNivelId]);

  const filteredSecciones = useMemo(() => {
    if (!selectedGradoId) return [];
    return secciones.filter((s) => s.grado.id === selectedGradoId);
  }, [secciones, selectedGradoId]);

  useEffect(() => {
    if (selectedSeccionId) fetchHorarios();
    else setHorarios([]);
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

  const sectionCourses = allCourses.filter(
    (c) => c.nivelAcademicoId === selectedSeccionId,
  );

  // Breadcrumb info
  const selectedNivel = niveles.find((n: any) => n.id === selectedNivelId);
  const selectedGrado = grados.find((g: any) => g.id === selectedGradoId);
  const selectedSeccion = filteredSecciones.find((s) => s.id === selectedSeccionId);

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("anio", year);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const draggedHorario = horarios.find(h => h.id === active.id);
    if (!draggedHorario) return;

    const overIdStr = String(over.id);
    const [diaStr, horaInicio] = overIdStr.split("-");
    const diaSemana = parseInt(diaStr);

    if (draggedHorario.diaSemana === diaSemana && draggedHorario.horaInicio === horaInicio) {
      return; // No change
    }

    const bloqueInfo = BLOQUES_HORARIO.find(b => b.inicio === horaInicio);
    if (!bloqueInfo || bloqueInfo.tipo === "receso") {
        toast.error("No se puede mover a este bloque");
        return;
    }
    const horaFin = bloqueInfo.fin;

    // Verificar si ya hay un bloque en la celda destino
    const targetOccupant = horarios.find(
      (h) => h.diaSemana === diaSemana && h.horaInicio === horaInicio && h.id !== active.id
    );

    const oldDia = draggedHorario.diaSemana;
    const oldHoraInicio = draggedHorario.horaInicio;
    const oldHoraFin = draggedHorario.horaFin;

    if (targetOccupant && targetOccupant.cursoId === draggedHorario.cursoId) {
      toast.error("El mismo curso ya está asignado en este bloque.");
      return;
    }

    // Optimistic Update: Swap si hay ocupante, o simplemente mover
    const previousHorarios = [...horarios];
    setHorarios(prev => prev.map(h => {
        if(h.id === active.id) {
            return { ...h, diaSemana, horaInicio, horaFin };
        }
        if (targetOccupant && h.id === targetOccupant.id) {
            return { ...h, diaSemana: oldDia, horaInicio: oldHoraInicio, horaFin: oldHoraFin };
        }
        return h;
    }));

    try {
        const resA = await upsertHorarioAction({
            diaSemana,
            horaInicio,
            horaFin,
            cursoId: draggedHorario.cursoId,
            aula: draggedHorario.aula
        }, draggedHorario.id);

        let resB: { error?: string | null } = { error: null };
        if (targetOccupant) {
             resB = await upsertHorarioAction({
                 diaSemana: oldDia,
                 horaInicio: oldHoraInicio,
                 horaFin: oldHoraFin,
                 cursoId: targetOccupant.cursoId,
                 aula: targetOccupant.aula
             }, targetOccupant.id);
        }

        if (resA.error || resB.error) {
            toast.error(resA.error || resB.error);
            setHorarios(previousHorarios); // Revert
        } else {
            toast.success(targetOccupant ? "Horarios intercambiados" : "Horario reasignado");
        }
    } catch(e) {
        toast.error("Error de conexión");
        setHorarios(previousHorarios); // Revert
    }
  };

  const handleDuplicate = async (slotToDuplicate: any) => {
    // Validar límite de horas
    const cursoId = slotToDuplicate.cursoId;
    const horasSemanales = slotToDuplicate.curso.horasSemanales || 0;
    
    if (horasSemanales > 0) {
        const toMin = (t: string) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };
        const horasRegistradas = horarios
            .filter((h) => h.cursoId === cursoId)
            .reduce((acc, curr) => {
                const duracionMin = toMin(curr.horaFin) - toMin(curr.horaInicio);
                return acc + Math.round(duracionMin / 45);
            }, 0);
            
        const duracionMinDuplicate = toMin(slotToDuplicate.horaFin) - toMin(slotToDuplicate.horaInicio);
        const horasNuevas = Math.round(duracionMinDuplicate / 45);

        if (horasRegistradas + horasNuevas > horasSemanales) {
            toast.error(`No se puede duplicar. El curso ya alcanzó sus ${horasSemanales} horas semanales.`);
            return;
        }
    }

    // Buscar el primer bloque libre
    let newDia = -1;
    let newHoraInicio = "";
    let newHoraFin = "";

    for (let dia = 1; dia <= 5; dia++) {
      for (const bloque of BLOQUES_HORARIO) {
        if (bloque.tipo === "receso") continue;
        
        // Verificar si está ocupado
        const isOccupied = horarios.some(h => h.diaSemana === dia && h.horaInicio === bloque.inicio);
        if (!isOccupied) {
            newDia = dia;
            newHoraInicio = bloque.inicio;
            newHoraFin = bloque.fin;
            break;
        }
      }
      if (newDia !== -1) break;
    }

    if (newDia === -1) {
       toast.error("No hay bloques libres en la semana para duplicar este curso.");
       return;
    }

    const newHorarioId = `temp-${Date.now()}`;
    const newHorario = {
        ...slotToDuplicate,
        id: newHorarioId,
        diaSemana: newDia,
        horaInicio: newHoraInicio,
        horaFin: newHoraFin
    };

    // Optimistic Update
    setHorarios(prev => [...prev, newHorario]);

    try {
        const res = await upsertHorarioAction({
            diaSemana: newDia,
            horaInicio: newHoraInicio,
            horaFin: newHoraFin,
            cursoId: slotToDuplicate.cursoId,
            aula: slotToDuplicate.aula
        });

        if (res.error) {
            toast.error(res.error);
            setHorarios(prev => prev.filter(h => h.id !== newHorarioId)); // Revert
        } else {
            toast.success("Bloque duplicado exitosamente");
            fetchHorarios(); // Refetch to get the real ID from DB
        }
    } catch(e) {
        toast.error("Error al duplicar el horario");
        setHorarios(prev => prev.filter(h => h.id !== newHorarioId)); // Revert
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Filter Panel ── */}
      <Card className="border-border/50 overflow-hidden p-0">
        {/* ── Toolbar: Year + Breadcrumb + Action ── */}
        <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-b border-border/30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Year Selector */}
            <Select
              key={selectedYear}
              defaultValue={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 w-auto min-w-[90px] gap-1.5 rounded-full border-border/60 bg-white/5 px-3 text-[12px] font-bold focus:ring-1 focus:ring-primary/40 shrink-0">
                <IconCalendarEvent size={13} className="text-primary/70" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-[#09090b] text-white">
                {[selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2].map((y) => (
                  <SelectItem key={y} value={y.toString()} className="text-[12px] rounded-lg">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Divider */}
            <div className="h-5 w-px bg-border/40 shrink-0 hidden sm:block" />

            {/* Breadcrumb */}
            <div className="min-w-0 hidden sm:block">
              {selectedNivel ? (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground truncate">
                  <IconSchool size={13} className="text-primary/60 shrink-0" />
                  <span className="text-foreground/80 font-semibold">{selectedNivel.nombre}</span>
                  {selectedGrado && (
                    <>
                      <IconChevronRight size={10} className="opacity-30 shrink-0" />
                      <span className="text-foreground/80 font-semibold">{selectedGrado.nombre}</span>
                    </>
                  )}
                  {selectedSeccion && (
                    <>
                      <IconChevronRight size={10} className="opacity-30 shrink-0" />
                      <Badge variant="outline" className="h-5 text-[10px] font-bold border-primary/30 text-primary bg-primary/5 px-2">
                        Sección {selectedSeccion.seccion}
                      </Badge>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground/50 italic">
                  Selecciona nivel, grado y sección
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="h-8 rounded-lg px-3.5 gap-1.5 text-[11px] font-bold shrink-0 shadow-md shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={!selectedSeccionId}
          >
            <IconPlus size={13} strokeWidth={3} />
            <span className="hidden sm:inline">Asignar Hora</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* ── Selectors Row ── */}
        <div className="px-4 sm:px-5 py-4 bg-muted/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* 1. Level Selector */}
          <div className="md:col-span-5">
            <LevelSegmentedControl
              levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
              value={selectedNivelId}
              onChange={(val) => {
                setSelectedNivelId(val);
                setSelectedGradoId("");
                setSelectedSeccionId("");
              }}
              label="1. Nivel"
            />
          </div>

          {/* 2. Grade Selector */}
          <div className="md:col-span-4 lg:col-span-3">
            <SelectField
              label="2. Grado / Año"
              placeholder="Selecciona grado"
              value={selectedGradoId}
              onValueChange={(val) => {
                setSelectedGradoId(val);
                setSelectedSeccionId("");
              }}
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

          {/* 3. Section Selector */}
          <div className="md:col-span-3 lg:col-span-4">
            <SelectField
              label="3. Sección"
              placeholder="Selecciona sección"
              value={selectedSeccionId}
              onValueChange={setSelectedSeccionId}
              disabled={!selectedGradoId}
              step={3}
              completed={!!selectedSeccionId}
            >
              {filteredSecciones.map((s) => (
                <SelectItem key={s.id} value={s.id} className="rounded-lg text-sm">
                  Sección {s.seccion}
                </SelectItem>
              ))}
            </SelectField>
          </div>
        </div>
      </Card>

      {/* ── Content area ── */}
      {selectedSeccionId ? (
        loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <IconLoader2 className="size-8 animate-spin text-primary/60" />
            <p className="text-xs font-semibold text-muted-foreground/60 tracking-wide">
              Cargando horario...
            </p>
          </div>
        ) : (
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
                if (res.success) { toast.success(res.success); fetchHorarios(); }
              }}
              onDuplicate={handleDuplicate}
            />
            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeId ? (
                <div className="p-3 rounded-lg border border-primary/20 bg-background/90 shadow-2xl backdrop-blur-xl w-32 cursor-grabbing ring-2 ring-primary ring-offset-2 ring-offset-background/50 scale-105 opacity-90">
                    <p className="text-[10px] font-black uppercase text-primary animate-pulse">Moviendo bloque...</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-dashed border-border/40 bg-muted/5 text-center p-10 gap-3">
          <div className="size-12 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-center">
            <IconClock className="size-6 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground/60">
              Sin horario seleccionado
            </h3>
            <p className="text-xs text-muted-foreground/50 max-w-xs leading-relaxed">
              Usa los filtros de arriba para elegir la sección cuyo horario deseas gestionar.
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-1">
            {["Nivel", "Grado", "Sección"].map((label, i) => {
              const filled = (i === 0 && !!selectedNivelId) || (i === 1 && !!selectedGradoId) || (i === 2 && !!selectedSeccionId);
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors",
                    filled
                      ? "bg-primary/10 border-primary/25 text-primary"
                      : "bg-muted/30 border-border/40 text-muted-foreground/40"
                  )}>
                    <span className={cn(
                      "size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold",
                      filled ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground/40"
                    )}>
                      {i + 1}
                    </span>
                    {label}
                  </div>
                  {i < 2 && <IconChevronRight size={10} className="text-muted-foreground/25 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
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

/* ─── SelectField helper ─── */
function SelectField({
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  step,
  completed,
  children,
}: {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (val: string) => void;
  disabled: boolean;
  step: number;
  completed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5">
        <span className={cn(
          "size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors",
          completed
            ? "bg-primary text-primary-foreground"
            : "bg-muted-foreground/15 text-muted-foreground/50"
        )}>
          {step}
        </span>
        <label className={cn(
          "text-[10px] font-bold uppercase transition-colors",
          completed ? "text-primary/80" : "text-muted-foreground/60"
        )}>
          {label}
        </label>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(
          "h-9 w-full rounded-lg border text-sm transition-all",
          completed
            ? "border-primary/30 bg-primary/5 text-foreground focus:ring-primary/30"
            : "border-border/60 bg-muted/30 focus:ring-primary/30",
          disabled && "opacity-40 cursor-not-allowed",
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}