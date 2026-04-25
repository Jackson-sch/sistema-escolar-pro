"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconCalendar,
  IconSchool,
  IconSearch,
  IconLoader2,
  IconDeviceFloppy,
  IconUsers,
  IconCheck,
  IconChevronRight,
  IconRefresh,
  IconPointFilled,
  IconBook,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsIsoDate,
} from "nuqs";
import {
  getAsistenciaAction,
  upsertAsistenciaAction,
} from "@/actions/attendance";
import { getSeccionesAction } from "@/actions/academic-structure";
import { AsistenciaTable } from "./asistencia-table";
import { Input } from "../ui/input";
import { NIVEL_ICON_MAP } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

interface AsistenciaClientProps {
  initialSecciones: any[];
  aniosAcademicos: number[];
  defaultYear: number;
  profesorId?: string;
}

export function AsistenciaClient({
  initialSecciones,
  aniosAcademicos,
  defaultYear,
  profesorId,
}: AsistenciaClientProps) {
  const [fecha, setFecha] = useQueryState(
    "fecha",
    parseAsIsoDate.withDefault(startOfDay(new Date())),
  );
  const [anio, setAnio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(defaultYear),
  );
  const [secciones, setSecciones] = useState<any[]>(initialSecciones);
  const [seccionId, setSeccionId] = useQueryState(
    "seccion",
    parseAsString.withDefault(""),
  );
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSecciones, setIsLoadingSecciones] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cursoId, setCursoId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [nivelId, setNivelId] = useQueryState("nivel", parseAsString.withDefault(""));
  const [gradoId, setGradoId] = useQueryState("grado", parseAsString.withDefault(""));

  // ── Derived Data ──────────────────────────────────────────────────────────
  const niveles = useMemo(() => {
    const map = new Map();
    secciones.forEach((s) => {
      if (s.nivel && !map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel);
    });
    return Array.from(map.values());
  }, [secciones]);

  const grados = useMemo(() => {
    if (!nivelId) return [];
    const map = new Map();
    secciones
      .filter((s) => s.nivel?.id === nivelId)
      .forEach((s) => {
        if (s.grado && !map.has(s.grado.id)) map.set(s.grado.id, s.grado);
      });
    return Array.from(map.values());
  }, [secciones, nivelId]);

  const filteredSecciones = useMemo(() => {
    if (!gradoId) return [];
    return secciones.filter((s) => s.grado?.id === gradoId);
  }, [secciones, gradoId]);

  const isFirstRender = useRef(true);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadSecciones = async () => {
      setIsLoadingSecciones(true);
      const res = await getSeccionesAction({ anioAcademico: anio, profesorId });
      if (res.data) {
        setSecciones(res.data);
        if (!isFirstRender.current) {
          setNivelId("");
          setGradoId("");
          setSeccionId("");
          setAlumnos([]);
        }
      }
      setIsLoadingSecciones(false);
      isFirstRender.current = false;
    };
    loadSecciones();
  }, [anio]);

  const loadAsistencia = () => {
    if (!seccionId) return;
    startTransition(async () => {
      const res = await getAsistenciaAction({ nivelAcademicoId: seccionId, fecha });
      if (res.success) {
        setCursoId(res.success.cursoId || "");
        const transformed = res.success.data.map((alumno: any) => {
          const a = alumno.asistencias[0];
          let estado = "presente";
          if (a) {
            if (a.tardanza) estado = "tarde";
            else if (a.justificada) estado = "justificado";
            else if (!a.presente) estado = "ausente";
          }
          return {
            id: alumno.id,
            name: alumno.name,
            apellidoPaterno: alumno.apellidoPaterno,
            apellidoMaterno: alumno.apellidoMaterno,
            image: alumno.image,
            estado,
            justificacion: a?.justificacion || "",
          };
        });
        setAlumnos(transformed);
      }
      if (res.error) toast.error(res.error);
    });
  };

  useEffect(() => { loadAsistencia(); }, [seccionId, fecha]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEstadoChange = (id: string, estado: string) =>
    setAlumnos((prev) => prev.map((a) => (a.id === id ? { ...a, estado } : a)));

  const handleMarkAllPresent = () => {
    setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "presente" })));
    toast.success("Todos los estudiantes marcados como presentes");
  };

  const handleObservacionChange = (id: string, justificacion: string) =>
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, justificacion } : a)),
    );

  const filteredAlumnos = alumnos.filter((a) => {
    const matchesSearch = `${a.name} ${a.apellidoPaterno} ${a.apellidoMaterno}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterStatus === "ausentes") return matchesSearch && a.estado === "ausente";
    if (filterStatus === "tardanzas") return matchesSearch && a.estado === "tarde";
    return matchesSearch;
  });

  const onSave = async () => {
    if (!cursoId) {
      toast.error("No hay cursos asignados a esta sección para registrar asistencia.");
      return;
    }
    setIsSaving(true);
    const data = alumnos.map((a) => ({
      estudianteId: a.id,
      cursoId,
      fecha,
      presente: a.estado !== "ausente",
      tardanza: a.estado === "tarde",
      justificada: a.estado === "justificado",
      justificacion: a.justificacion,
    }));
    const res = await upsertAsistenciaAction(data);
    if (res.success) toast.success("Asistencia guardada con éxito");
    if (res.error) toast.error(res.error);
    setIsSaving(false);
  };

  // ── Computed Stats ────────────────────────────────────────────────────────
  const seccionActual = secciones.find((s) => s.id === seccionId);
  const presentesCount = alumnos.filter((a) => a.estado === "presente").length;
  const ausentesCount = alumnos.filter((a) => a.estado === "ausente").length;
  const tardanzasCount = alumnos.filter((a) => a.estado === "tarde").length;
  const totalAlumnos = alumnos.length;
  const marcados = alumnos.filter((a) => a.estado !== "").length;
  const progressPercent = totalAlumnos > 0 ? Math.round((marcados / totalAlumnos) * 100) : 0;
  const nivelActual = niveles.find((n: any) => n.id === nivelId);

  const filterTabs = [
    { id: "todos", label: "Todos", count: totalAlumnos },
    { id: "ausentes", label: "Ausentes", count: ausentesCount },
    { id: "tardanzas", label: "Tardanzas", count: tardanzasCount },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-0 w-full animate-in fade-in duration-300 min-h-[calc(100vh-12rem)]">

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR IZQUIERDA — Niveles + Configuración
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r bg-card/50 backdrop-blur-sm rounded-l-2xl overflow-hidden">

        {/* Logo / Título */}
        <div className="px-5 py-5 border-b border-border/30">
          <h2 className="text-xs font-black uppercase tracking-widest text-foreground/80">
            Control de Asistencia
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
            gestión académica
          </p>
        </div>

        {/* Nivel Buttons */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {niveles.map((nivel: any) => {
            const Icon = NIVEL_ICON_MAP[nivel.nombre?.toUpperCase()] || IconBook;
            const isActive = nivelId === nivel.id;
            return (
              <button
                key={nivel.id}
                onClick={() => {
                  setNivelId(nivel.id);
                  setGradoId("");
                  setSeccionId("");
                  setAlumnos([]);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5 shrink-0 transition-transform", isActive && "scale-110")} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {nivel.nombre}
                </span>
              </button>
            );
          })}

          {niveles.length === 0 && !isLoadingSecciones && (
            <p className="text-[10px] text-muted-foreground/50 text-center py-8 italic">
              No hay niveles disponibles
            </p>
          )}
          {isLoadingSecciones && (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="size-5 animate-spin text-muted-foreground/30" />
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-border/30 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs font-semibold gap-2 rounded-xl h-10 border-border/40 text-muted-foreground hover:text-foreground"
            disabled
          >
            <IconSchool className="size-4" />
            Generar Reporte
          </Button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT — Header + Métricas + Lista
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile Level Selector (hidden on lg+) ────────────────────────── */}
        <div className="lg:hidden px-4 pt-4">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40">
            {niveles.map((nivel: any) => {
              const Icon = NIVEL_ICON_MAP[nivel.nombre?.toUpperCase()] || IconBook;
              const isActive = nivelId === nivel.id;
              return (
                <button
                  key={nivel.id}
                  onClick={() => {
                    setNivelId(nivel.id);
                    setGradoId("");
                    setSeccionId("");
                    setAlumnos([]);
                  }}
                  className={cn(
                    "flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all gap-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{nivel.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Dashboard Header ─────────────────────────────────────────────── */}
        <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-border/30 bg-card/30">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h1 className="text-lg font-bold tracking-tight uppercase">
                {nivelActual
                  ? `Registro de ${nivelActual.nombre}`
                  : "Control de Asistencia"}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {seccionActual ? (
                  <>
                    <span>{seccionActual.grado?.nombre}</span>
                    <IconChevronRight className="size-3 opacity-40" />
                    <span>Sección &ldquo;{seccionActual.seccion}&rdquo;</span>
                    {seccionActual.turno && (
                      <>
                        <IconPointFilled className="size-1.5 opacity-30" />
                        <span>{seccionActual.turno}</span>
                      </>
                    )}
                  </>
                ) : nivelActual ? (
                  <span>Selecciona el grado y sección</span>
                ) : (
                  <span>Selecciona un nivel para comenzar</span>
                )}
              </div>
            </div>

            {/* Periodo + Fecha */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-2 bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1.5 min-w-fit">
                <IconCalendar className="size-3.5 text-primary" />
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-[11px] sm:text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">
                      {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(d) => d && setFecha(startOfDay(d))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Select
                onValueChange={(v) => setAnio(Number(v))}
                value={anio.toString()}
                disabled={isLoadingSecciones}
              >
                <SelectTrigger className="h-8! w-auto min-w-[70px] rounded-lg border-border/50 bg-muted/40 text-xs font-bold gap-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aniosAcademicos.map((a) => (
                    <SelectItem key={a} value={a.toString()} className="text-sm">
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grado + Sección selectors */}
          {nivelId && (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 lg:gap-4 animate-in slide-in-from-top-1 duration-200">
              <div className="flex-1 sm:max-w-[200px]">
                <StepSelect
                  step={2}
                  label="Grado / Año"
                  placeholder="Seleccionar grado"
                  value={gradoId}
                  disabled={!nivelId || isLoadingSecciones}
                  active={!!gradoId}
                  onValueChange={(val) => {
                    setGradoId(val);
                    setSeccionId("");
                  }}
                >
                  {grados.map((g: any) => (
                    <SelectItem key={g.id} value={g.id} className="text-sm">
                      {g.nombre}
                    </SelectItem>
                  ))}
                </StepSelect>
              </div>

              <div className="flex-1 sm:max-w-[220px]">
                <StepSelect
                  step={3}
                  label="Sección"
                  placeholder="Seleccionar sección"
                  value={seccionId}
                  disabled={!gradoId || isLoadingSecciones}
                  active={!!seccionId}
                  onValueChange={setSeccionId}
                >
                  {filteredSecciones.map((s: any) => (
                    <SelectItem key={s.id} value={s.id} className="text-sm">
                      Sección &ldquo;{s.seccion}&rdquo;{s.turno ? ` · ${s.turno}` : ""}
                    </SelectItem>
                  ))}
                </StepSelect>
              </div>

              {seccionId && (
                <Button
                  onClick={loadAsistencia}
                  disabled={!seccionId || isPending}
                  variant="outline"
                  size="sm"
                  className="h-9 w-full sm:w-auto text-xs font-semibold rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5 mb-0"
                >
                  {isPending ? (
                    <IconLoader2 className="size-3.5 animate-spin" />
                  ) : (
                    <IconRefresh className="size-3.5" />
                  )}
                  Actualizar
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Content Area ──────────────────────────────────────────────────── */}
        {seccionId ? (
          <div className="flex-1 flex flex-col">

            {/* Metrics Bar: Progress + Live Summary */}
            <div className="px-4 lg:px-6 py-4 border-b border-border/30 bg-card/20">
              <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-6">

                {/* Attendance Progress */}
                <div className="flex items-center gap-4 min-w-fit">
                  <div className="space-y-0.5">
                    <p className="text-[10px] items-center font-black uppercase tracking-widest text-muted-foreground/50">
                      Progreso de Asistencia
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl lg:text-3xl font-black text-primary tabular-nums">
                        {progressPercent}%
                      </span>
                      <span className="text-[11px] lg:text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {marcados} de {totalAlumnos} Marcados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 w-full md:min-w-[160px]">
                  <Progress
                    value={progressPercent}
                    className="h-2.5 lg:h-3 bg-muted/60 rounded-full"
                    indicatorClassName="bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700 ease-out"
                  />
                </div>

                {/* Live Summary */}
                <div className="flex items-center gap-1.5 bg-card border border-border/40 rounded-xl px-3.5 py-2 lg:px-4 lg:py-2.5 shadow-sm min-w-fit self-start md:self-auto">
                  <span className="relative flex size-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                  </span>
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mr-2">
                    Resumen en Vivo
                  </span>
                  <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm font-bold tabular-nums">
                    <span className="text-emerald-500">{presentesCount}</span>
                    <span className="text-muted-foreground/30 font-light">|</span>
                    <span className="text-amber-500">{tardanzasCount}</span>
                    <span className="text-muted-foreground/30 font-light">|</span>
                    <span className="text-rose-500">{ausentesCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search + Filters + Actions Bar */}
            <div className="px-4 lg:px-6 py-3 border-b border-border/20 bg-background/20 space-y-3">
              
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-0 xl:max-w-md">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 w-full rounded-xl pl-9 text-sm border-border/40 bg-background/60"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Filter Tabs */}
                  <AnimatedTabs
                    layoutId="status-filter-tabs"
                    tabs={filterTabs.map(tab => ({
                      id: tab.id,
                      label: tab.label,
                      icon: (
                        <span className={cn(
                          "ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none",
                          filterStatus === tab.id
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}>
                          {tab.count}
                        </span>
                      )
                    }))}
                    activeTab={filterStatus}
                    onTabChange={setFilterStatus}
                    className="bg-muted/40 border-none"
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllPresent}
                      disabled={alumnos.length === 0}
                      className="h-9 px-3 rounded-xl text-[11px] lg:text-xs font-semibold gap-1.5 border-border/60"
                    >
                      <IconCheck className="size-3.5 shrink-0" />
                      <span className="hidden sm:inline">Todos Presentes</span>
                      <span className="sm:hidden">Todos</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSave}
                      disabled={isSaving || alumnos.length === 0}
                      className="h-9 px-4 lg:px-5 rounded-xl text-[11px] lg:text-xs font-semibold gap-1.5 shadow-lg shadow-primary/20"
                    >
                      {isSaving ? (
                        <IconLoader2 className="size-3.5 animate-spin shrink-0" />
                      ) : (
                        <IconDeviceFloppy className="size-3.5 shrink-0" />
                      )}
                      <span>{isSaving ? "Guardando..." : "Guardar Asistencia"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-auto">
              {isPending ? (
                <div className="flex flex-col items-center justify-center h-80 gap-3">
                  <IconLoader2 className="size-8 animate-spin text-primary/30" />
                  <span className="text-xs font-semibold text-muted-foreground/40 uppercase tracking-widest">
                    Cargando asistencia...
                  </span>
                </div>
              ) : filteredAlumnos.length > 0 ? (
                <AsistenciaTable
                  data={filteredAlumnos}
                  onEstadoChange={handleEstadoChange}
                  onJustificacionChange={handleObservacionChange}
                />
              ) : (
                <EmptyState
                  icon={searchTerm ? IconSearch : IconSchool}
                  title={searchTerm ? "Sin coincidencias" : "Sin estudiantes"}
                  description={
                    searchTerm
                      ? `No se encontraron resultados para "${searchTerm}"`
                      : "No se encontraron estudiantes con los criterios seleccionados."
                  }
                />
              )}
            </div>
          </div>
        ) : (
          /* ── Empty / Welcome State ────────────────────────────────────────── */
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={IconUsers}
              title={
                !nivelId
                  ? "Selecciona un nivel para comenzar"
                  : !gradoId
                    ? "Selecciona un grado"
                    : "Selecciona una sección"
              }
              description={
                !nivelId
                  ? "Elige el nivel educativo en la barra lateral para ver los grados disponibles."
                  : !gradoId
                    ? "Elige el grado para continuar con la selección del aula."
                    : "Elige la sección para cargar la lista de estudiantes."
              }
              large
            />
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function StepSelect({
  step,
  label,
  placeholder,
  value,
  disabled,
  active,
  onValueChange,
  children,
}: {
  step: number;
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  active: boolean;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-full text-[9px] font-black transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground/40",
          )}
        >
          {step}
        </span>
        <label
          className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            active ? "text-primary/80" : "text-muted-foreground/50",
          )}
        >
          {label}
        </label>
      </div>
      <Select onValueChange={onValueChange} value={value} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-9 w-full sm:w-[170px] rounded-xl border-border/50 text-sm transition-all",
            active
              ? "border-primary/30 bg-primary/5 text-foreground"
              : "bg-background/60 text-muted-foreground",
            disabled && "opacity-40",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">{children}</SelectContent>
      </Select>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  large = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        large ? "min-h-[320px] p-10" : "min-h-[280px] p-8",
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 mb-5">
        <Icon className="size-7 text-muted-foreground/25" />
      </div>
      <p className="text-sm font-bold text-foreground/60">{title}</p>
      <p className="mt-2 max-w-[300px] text-xs text-muted-foreground/60 leading-relaxed">
        {description}
      </p>
    </div>
  );
}