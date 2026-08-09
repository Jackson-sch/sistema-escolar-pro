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
  DragStartEvent,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
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
  IconPrinter,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScheduleGrid } from "./schedule-grid";
import { AddScheduleDialog } from "./add-schedule-dialog";
import { BrandIcon } from "@/components/common/brand-logo";
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

interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  cursoId: string;
  aula?: string | null;
  curso?: { id: string; horasSemanales?: number | null };
}

interface ScheduleCourse {
  id: string;
  nombre: string;
  nivelAcademicoId: string;
  horasSemanales?: number | null;
  profesor?: { name: string; apellidoPaterno: string } | null;
}

interface ScheduleManagerProps {
  secciones: Section[];
  allCourses: ScheduleCourse[];
  selectedYear: number;
}

/* ─── Hook: Lógica Drag & Drop de horarios ─── */

function useScheduleDnd({
  horarios,
  setHorarios,
  onRefetch,
}: {
  horarios: Horario[];
  setHorarios: React.Dispatch<React.SetStateAction<Horario[]>>;
  onRefetch: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const draggedHorario = horarios.find((h) => h.id === active.id);
    if (!draggedHorario) return;

    const overIdStr = String(over.id);
    const [diaStr, horaInicio] = overIdStr.split("-");
    const diaSemana = parseInt(diaStr);

    if (
      draggedHorario.diaSemana === diaSemana &&
      draggedHorario.horaInicio === horaInicio
    ) {
      return; // No change
    }

    const bloqueInfo = BLOQUES_HORARIO.find((b) => b.inicio === horaInicio);
    if (!bloqueInfo || bloqueInfo.tipo === "receso") {
      toast.error("No se puede mover a este bloque");
      return;
    }
    const horaFin = bloqueInfo.fin;

    // Verificar si ya hay un bloque en la celda destino
    const targetOccupant = horarios.find(
      (h) =>
        h.diaSemana === diaSemana &&
        h.horaInicio === horaInicio &&
        h.id !== active.id,
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
    setHorarios((prev) =>
      prev.map((h) => {
        if (h.id === active.id) {
          return { ...h, diaSemana, horaInicio, horaFin };
        }
        if (targetOccupant && h.id === targetOccupant.id) {
          return {
            ...h,
            diaSemana: oldDia,
            horaInicio: oldHoraInicio,
            horaFin: oldHoraFin,
          };
        }
        return h;
      }),
    );

    try {
      const resA = await upsertHorarioAction(
        {
          diaSemana,
          horaInicio,
          horaFin,
          cursoId: draggedHorario.cursoId,
          aula: draggedHorario.aula,
        },
        draggedHorario.id,
      );

      let resB: { error?: string | null } = { error: null };
      if (targetOccupant) {
        resB = await upsertHorarioAction(
          {
            diaSemana: oldDia,
            horaInicio: oldHoraInicio,
            horaFin: oldHoraFin,
            cursoId: targetOccupant.cursoId,
            aula: targetOccupant.aula,
          },
          targetOccupant.id,
        );
      }

      if (resA.error || resB.error) {
        toast.error(resA.error || resB.error);
        setHorarios(previousHorarios); // Revert
      } else {
        toast.success(
          targetOccupant ? "Horarios intercambiados" : "Horario reasignado",
        );
      }
    } catch {
      toast.error("Error de conexión");
      setHorarios(previousHorarios); // Revert
    }
  };

  const handleDuplicate = async (slotToDuplicate: Horario) => {
    // Validar límite de horas
    const cursoId = slotToDuplicate.cursoId;
    const horasSemanales = slotToDuplicate.curso?.horasSemanales || 0;

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

      const duracionMinDuplicate =
        toMin(slotToDuplicate.horaFin) - toMin(slotToDuplicate.horaInicio);
      const horasNuevas = Math.round(duracionMinDuplicate / 45);

      if (horasRegistradas + horasNuevas > horasSemanales) {
        toast.error(
          `No se puede duplicar. El curso ya alcanzó sus ${horasSemanales} horas semanales.`,
        );
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
        const isOccupied = horarios.some(
          (h) => h.diaSemana === dia && h.horaInicio === bloque.inicio,
        );
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
      toast.error(
        "No hay bloques libres en la semana para duplicar este curso.",
      );
      return;
    }

    const newHorarioId = `temp-${Date.now()}`;
    const newHorario = {
      ...slotToDuplicate,
      id: newHorarioId,
      diaSemana: newDia,
      horaInicio: newHoraInicio,
      horaFin: newHoraFin,
    };

    // Optimistic Update
    setHorarios((prev) => [...prev, newHorario]);

    try {
      const res = await upsertHorarioAction({
        diaSemana: newDia,
        horaInicio: newHoraInicio,
        horaFin: newHoraFin,
        cursoId: slotToDuplicate.cursoId,
        aula: slotToDuplicate.aula,
      });

      if (res.error) {
        toast.error(res.error);
        setHorarios((prev) => prev.filter((h) => h.id !== newHorarioId)); // Revert
      } else {
        toast.success("Bloque duplicado exitosamente");
        onRefetch(); // Refetch to get the real ID from DB
      }
    } catch {
      toast.error("Error al duplicar el horario");
      setHorarios((prev) => prev.filter((h) => h.id !== newHorarioId)); // Revert
    }
  };

  return { activeId, sensors, handleDragStart, handleDragEnd, handleDuplicate };
}

/* ─── Toolbar: Año + Breadcrumb + Acciones ─── */

function ScheduleToolbar({
  selectedYear,
  onYearChange,
  nivelName,
  gradoName,
  seccionName,
  hasSeccion,
  horariosCount,
  onPrint,
  onAdd,
}: {
  selectedYear: number;
  onYearChange: (year: string) => void;
  nivelName?: string;
  gradoName?: string;
  seccionName?: string;
  hasSeccion: boolean;
  horariosCount: number;
  onPrint: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-b border-border/30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Year Selector */}
        <Select
          key={selectedYear}
          defaultValue={selectedYear.toString()}
          onValueChange={onYearChange}
        >
          <SelectTrigger className="h-8 w-auto min-w-[90px] gap-1.5 rounded-full border-border/60 bg-white/5 px-3 text-[12px] font-bold focus:ring-1 focus:ring-primary/40 shrink-0">
            <IconCalendarEvent size={13} className="text-primary/70" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50 bg-[#09090b] text-white">
            {[
              selectedYear - 1,
              selectedYear,
              selectedYear + 1,
              selectedYear + 2,
            ].map((y) => (
              <SelectItem
                key={y}
                value={y.toString()}
                className="text-[12px] rounded-lg"
              >
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-5 w-px bg-border/40 shrink-0 hidden sm:block" />

        {/* Breadcrumb */}
        <div className="min-w-0 hidden sm:block">
          {nivelName ? (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground truncate">
              <IconSchool size={13} className="text-primary/60 shrink-0" />
              <span className="text-foreground/80 font-semibold">
                {nivelName}
              </span>
              {gradoName && (
                <>
                  <IconChevronRight size={10} className="opacity-30 shrink-0" />
                  <span className="text-foreground/80 font-semibold">
                    {gradoName}
                  </span>
                </>
              )}
              {seccionName && (
                <>
                  <IconChevronRight size={10} className="opacity-30 shrink-0" />
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] font-bold border-primary/30 text-primary bg-primary/5 px-2"
                  >
                    Sección {seccionName}
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

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={onPrint}
          size="sm"
          variant="outline"
          className="h-8 rounded-lg px-3 gap-1.5 text-[11px] font-semibold border-border/60 hover:bg-muted/60"
          disabled={!hasSeccion || horariosCount === 0}
        >
          <IconPrinter size={13} className="text-muted-foreground" />
          <span className="hidden sm:inline">Imprimir Horario</span>
        </Button>

        <Button
          onClick={onAdd}
          size="sm"
          className="h-8 rounded-lg px-3.5 gap-1.5 text-[11px] font-bold shadow-md shadow-indigo-500/10 transition-[background-color,transform] hover:scale-[1.02] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={!hasSeccion}
        >
          <IconPlus size={13} strokeWidth={3} />
          <span className="hidden sm:inline">Asignar Hora</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>
    </div>
  );
}

/* ─── Selector de campo (helper) ─── */

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
        <span
          className={cn(
            "size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors",
            completed
              ? "bg-primary text-primary-foreground"
              : "bg-muted-foreground/15 text-muted-foreground/50",
          )}
        >
          {step}
        </span>
        <span
          className={cn(
            "text-[10px] font-bold uppercase transition-colors",
            completed ? "text-primary/80" : "text-muted-foreground/60",
          )}
        >
          {label}
        </span>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-9 w-full rounded-lg border text-sm transition-[color,background-color,border-color,box-shadow,opacity]",
            completed
              ? "border-primary/30 bg-primary/5 text-foreground focus:ring-primary/30"
              : "border-border/60 bg-muted/30 focus:ring-primary/30",
            disabled && "opacity-40 cursor-not-allowed",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">{children}</SelectContent>
      </Select>
    </div>
  );
}

/* ─── Fila de selectores Nivel / Grado / Sección ─── */

function ScheduleSelectorsRow({
  niveles,
  selectedNivelId,
  onNivelChange,
  grados,
  selectedGradoId,
  onGradoChange,
  filteredSecciones,
  selectedSeccionId,
  onSeccionChange,
}: {
  niveles: Array<{ id: string; nombre: string }>;
  selectedNivelId: string;
  onNivelChange: (val: string) => void;
  grados: Array<{ id: string; nombre: string }>;
  selectedGradoId: string;
  onGradoChange: (val: string) => void;
  filteredSecciones: Section[];
  selectedSeccionId: string;
  onSeccionChange: (val: string) => void;
}) {
  return (
    <div className="px-4 sm:px-5 py-4 bg-muted/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      {/* 1. Level Selector */}
      <div className="md:col-span-5">
        <LevelSegmentedControl
          levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
          value={selectedNivelId}
          onChange={onNivelChange}
          label="1. Nivel"
        />
      </div>

      {/* 2. Grade Selector */}
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
          {grados.map((g) => (
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
          onValueChange={onSeccionChange}
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
  );
}

/* ─── Cabecera oficial de impresión ─── */

function SchedulePrintHeader({
  nivelName,
  gradoName,
  seccionName,
  year,
}: {
  nivelName?: string;
  gradoName?: string;
  seccionName?: string;
  year: number;
}) {
  return (
    <div className="hidden print:flex items-center justify-between pb-3 mb-2 border-b-2 border-slate-900 text-black">
      <div className="flex items-center gap-3">
        <BrandIcon size={36} />
        <div>
          <h1 className="text-xl font-extrabold tracking-tight uppercase text-slate-950">
            {nivelName || "EduNova Pro"}
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Horario de Clases Oficial • Ciclo Lectivo {year}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {gradoName || ""}
        </p>
        <p className="text-base font-extrabold text-indigo-700">
          Sección {seccionName || ""}
        </p>
      </div>
    </div>
  );
}

/* ─── Estados de carga / vacío ─── */

function ScheduleLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
      <IconLoader2 className="size-8 animate-spin text-primary/60" />
      <p className="text-xs font-semibold text-muted-foreground/60 tracking-wide">
        Cargando horario...
      </p>
    </div>
  );
}

function ScheduleEmptyState({
  nivelSelected,
  gradoSelected,
  seccionSelected,
}: {
  nivelSelected: boolean;
  gradoSelected: boolean;
  seccionSelected: boolean;
}) {
  const steps = [
    { label: "Nivel", filled: nivelSelected },
    { label: "Grado", filled: gradoSelected },
    { label: "Sección", filled: seccionSelected },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-dashed border-border/40 bg-muted/5 text-center p-10 gap-3">
      <div className="size-12 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-center">
        <IconClock
          className="size-6 text-muted-foreground/30"
          strokeWidth={1.5}
        />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground/60">
          Sin horario seleccionado
        </h3>
        <p className="text-xs text-muted-foreground/50 max-w-xs leading-relaxed">
          Usa los filtros de arriba para elegir la sección cuyo horario deseas
          gestionar.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mt-1">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors",
                step.filled
                  ? "bg-primary/10 border-primary/25 text-primary"
                  : "bg-muted/30 border-border/40 text-muted-foreground/40",
              )}
            >
              <span
                className={cn(
                  "size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold",
                  step.filled
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground/40",
                )}
              >
                {i + 1}
              </span>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <IconChevronRight
                size={10}
                className="text-muted-foreground/25 shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */

export function ScheduleManager({
  secciones,
  allCourses,
  selectedYear,
}: ScheduleManagerProps) {
  const router = useRouter();

  const [selectedNivelId, setSelectedNivelId] = useState<string>("");
  const [selectedGradoId, setSelectedGradoId] = useState<string>("");
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("");
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
