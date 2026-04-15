"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getHorariosBySeccionAction,
  deleteHorarioAction,
} from "@/actions/schedules";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconLoader2,
  IconClock,
  IconSchool,
  IconChevronRight,
  IconLayoutGrid,
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

  return (
    <div className="space-y-4">

      {/* ── Filter bar ── */}
      <Card className="border-border/50 overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Año Lectivo Selector */}
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <Select
                key={selectedYear}
                defaultValue={selectedYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 w-auto min-w-[90px] gap-2 rounded-full border-border/60 bg-white/5 px-2 text-[12px] font-bold focus:ring-1 focus:ring-primary/40">
                <IconCalendarEvent size={14} className="text-primary/70" />
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
            </div>

            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                <IconLayoutGrid size={15} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground leading-none mb-0.5">
                  Selección de Aula
                </p>
                {/* Breadcrumb */}
                {selectedNivel ? (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <span className="text-foreground font-semibold">{selectedNivel.nombre}</span>
                    {selectedGrado && (
                      <>
                        <IconChevronRight size={10} className="opacity-40 shrink-0" />
                        <span className="text-foreground font-semibold">{selectedGrado.nombre}</span>
                      </>
                    )}
                    {selectedSeccion && (
                      <>
                        <IconChevronRight size={10} className="opacity-40 shrink-0" />
                        <span className="text-primary font-semibold">Sección {selectedSeccion.seccion}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/60">
                    Elige nivel, grado y sección
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="h-9 rounded-lg px-4 gap-1.5 text-xs font-bold shrink-0 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={!selectedSeccionId}
          >
            <IconPlus size={14} strokeWidth={3} />
            <span>Asignar Hora</span>
          </Button>
        </div>

        {/* Level Selector */}
        <div className="px-5 py-4 border-b border-border/30 bg-muted/5">
          <LevelSegmentedControl
            levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
            value={selectedNivelId}
            onChange={(val) => {
              setSelectedNivelId(val);
              setSelectedGradoId("");
              setSelectedSeccionId("");
            }}
            label="1. Selecciona Nivel"
          />
        </div>

        {/* Subsequent Selectors */}
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
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
          <ScheduleGrid
            horarios={horarios}
            onDelete={async (id: string) => {
              const res = await deleteHorarioAction(id);
              if (res.success) { toast.success(res.success); fetchHorarios(); }
            }}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[420px] rounded-2xl border border-dashed border-border/50 bg-muted/5 text-center p-12 gap-4">
          <div className="size-14 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center">
            <IconClock className="size-7 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground/60">
              Gestión de Horarios
            </h3>
            <p className="text-xs text-muted-foreground/50 max-w-xs leading-relaxed">
              Selecciona el nivel, grado y sección para empezar a organizar la carga académica.
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-2">
            {["Nivel", "Grado", "Sección"].map((label, i) => {
              const filled = (i === 0 && !!selectedNivelId) || (i === 1 && !!selectedGradoId) || (i === 2 && !!selectedSeccionId);
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors",
                    filled
                      ? "bg-primary/10 border-primary/25 text-primary"
                      : "bg-muted/30 border-border/40 text-muted-foreground/40"
                  )}>
                    <span className={cn(
                      "size-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                      filled ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground/40"
                    )}>
                      {i + 1}
                    </span>
                    {label}
                  </div>
                  {i < 2 && <IconChevronRight size={12} className="text-muted-foreground/25 shrink-0" />}
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