"use client";

import {
  IconLoader2,
  IconSearch,
  IconCalendarMonth,
  IconSchool,
  IconAlertTriangle,
  IconUser,
  IconFileCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MESES_OPTIONS } from "@/lib/constants";
import { ComboboxReusable } from "@/components/ui/combobox-reusable";

import { AnimatedTabs } from "@/components/ui/animated-tabs";

interface ReporteFiltrosProps {
  anio: number;
  setAnio: (anio: number) => void;
  mes: number;
  setMes: (mes: number) => void;
  reportType:
    | "mensual"
    | "institucional"
    | "alertas"
    | "individual"
    | "justificaciones";
  setReportType: (
    type:
      | "mensual"
      | "institucional"
      | "alertas"
      | "individual"
      | "justificaciones",
  ) => void;
  rPeriod?: "today" | "month" | "year";
  setRPeriod?: (val: "today" | "month" | "year") => void;
  nivelId: string | null;
  gradoId: string | null;
  setGradoId: (id: string) => void;
  seccionId: string;
  setSeccionId: (id: string) => void;
  studentId?: string;
  setStudentId?: (id: string) => void;
  secciones: any[];
  grados: any[];
  alumnos?: any[];
  aniosAcademicos: number[];
  isLoadingSecciones: boolean;
  isLoadingAlumnos?: boolean;
  isPending: boolean;
  onConsultar: () => void;
  niveles?: any[];
  onSelectNivel?: (id: string) => void;
}

const MAIN_REPORT_TABS = [
  { id: "mensual", label: "Mensual", icon: <IconCalendarMonth className="size-4" /> },
  { id: "institucional", label: "Institucional", icon: <IconSchool className="size-4" /> },
  { id: "alertas", label: "Alertas", icon: <IconAlertTriangle className="size-4" /> },
  { id: "individual", label: "Individual", icon: <IconUser className="size-4" /> },
  { id: "justificaciones", label: "Justificaciones", icon: <IconFileCheck className="size-4" /> },
];

const TEMPORAL_FOCUS_TABS = [
  { id: "today", label: "Hoy" },
  { id: "month", label: "Mes" },
  { id: "year", label: "Año" },
];

function isConsultarDisabled({
  reportType,
  seccionId,
  studentId,
  isPending,
}: {
  reportType: string;
  seccionId: string;
  studentId?: string;
  isPending: boolean;
}): boolean {
  if (isPending) return true;
  if (reportType === "individual") return !studentId;
  const doesNotRequireSeccion =
    reportType === "institucional" ||
    reportType === "justificaciones" ||
    reportType === "alertas";
  return !doesNotRequireSeccion && !seccionId;
}

function TemporalFocusFilter({
  rPeriod,
  setRPeriod,
}: {
  rPeriod: string;
  setRPeriod: (id: any) => void;
}) {
  return (
    <div className="space-y-1.5 -mb-1">
      <span className="text-[10px] font-black uppercase tracking-widest ml-1">
        Foco
      </span>
      <AnimatedTabs
        layoutId="temporal-focus-tabs"
        size="sm"
        tabs={TEMPORAL_FOCUS_TABS}
        activeTab={rPeriod}
        onTabChange={(id) => setRPeriod(id as any)}
        className="bg-muted/40 border-none"
      />
    </div>
  );
}

function PeriodoFilter({
  anio,
  setAnio,
  aniosAcademicos,
  disabled,
}: {
  anio: number;
  setAnio: (v: number) => void;
  aniosAcademicos: number[];
  disabled: boolean;
}) {
  return (
    <div className="space-y-1.5 w-[100px]">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
        Periodo
      </span>
      <Select
        onValueChange={(v) => setAnio(Number(v))}
        value={anio.toString()}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 bg-card border-border/40 hover:bg-muted/50 w-full rounded-xl text-xs font-bold transition-colors">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {aniosAcademicos.map((a) => (
            <SelectItem key={a} value={a.toString()} className="text-xs">
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MesFilter({
  mes,
  setMes,
  disabled,
}: {
  mes: number;
  setMes: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1.5 w-[120px]">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
        Mes
      </span>
      <Select
        onValueChange={(v) => setMes(Number(v))}
        value={mes.toString()}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 bg-card border-border/40 hover:bg-muted/50 w-full rounded-xl text-xs font-bold transition-colors">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {MESES_OPTIONS.map((m) => (
            <SelectItem key={m.id} value={m.id.toString()} className="text-xs">
              {m.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EstudianteFilter({
  alumnos,
  studentId,
  setStudentId,
  seccionId,
  isLoadingAlumnos,
}: {
  alumnos: any[];
  studentId?: string;
  setStudentId?: (id: string) => void;
  seccionId: string;
  isLoadingAlumnos?: boolean;
}) {
  const placeholder = !seccionId
    ? "Elegir sección"
    : isLoadingAlumnos
      ? "Cargando..."
      : "Elegir alumno";

  return (
    <div className="space-y-1.5 w-[220px]">
      <div className="flex items-center gap-2">
        <span className={cn(
          "flex size-4 items-center justify-center rounded-full text-[9px] font-black transition-colors",
          studentId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground/40"
        )}>
          4
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Estudiante
        </span>
      </div>
      <ComboboxReusable
        items={alumnos.map((a: any) => ({
          id: a.id,
          label: `${a.apellidoPaterno} ${a.apellidoMaterno}, ${a.name}`,
          image: a.image,
        }))}
        value={studentId || ""}
        onValueChange={setStudentId || (() => {})}
        disabled={!seccionId || isLoadingAlumnos}
        isLoading={isLoadingAlumnos}
        placeholder={placeholder}
        searchPlaceholder="Buscar estudiante..."
        className="capitalize"
      />
    </div>
  );
}

export function ReporteFiltros({
  anio,
  setAnio,
  mes,
  setMes,
  reportType,
  setReportType,
  rPeriod = "today",
  setRPeriod,
  nivelId,
  gradoId,
  setGradoId,
  seccionId,
  setSeccionId,
  studentId,
  setStudentId,
  secciones,
  grados,
  alumnos = [],
  aniosAcademicos,
  isLoadingSecciones,
  isLoadingAlumnos,
  isPending,
  onConsultar,
  niveles = [],
  onSelectNivel,
}: ReporteFiltrosProps) {
  const isPeriodoVisible = rPeriod !== "today" || reportType !== "institucional";
  const isMesVisible =
    reportType === "mensual" ||
    reportType === "justificaciones" ||
    (reportType === "institucional" && rPeriod === "month");
  const allowAllSections =
    reportType === "institucional" ||
    reportType === "justificaciones" ||
    reportType === "alertas";

  const disabledConsultar = isConsultarDisabled({
    reportType,
    seccionId,
    studentId,
    isPending,
  });

  return (
    <div className="space-y-4 animate-in slide-in-from-top-2">
      {/* ── Fila 1: Pestañas de Reporte (Izq) + Selector de Niveles (Der) ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 w-full">
        <AnimatedTabs
          layoutId="report-type-tabs"
          tabs={MAIN_REPORT_TABS}
          activeTab={reportType}
          onTabChange={(id) => {
            setReportType(id as any);
            if (id !== "individual" && setStudentId) setStudentId("");
          }}
        />

        {niveles && niveles.length > 0 && onSelectNivel && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hidden sm:inline">
              Nivel:
            </span>
            <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/40 shadow-2xs">
              {niveles.map((n: any) => {
                const isActive = n.id === nivelId;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onSelectNivel(n.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    {n.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Fila 2: Barra de Filtros en Contenedor Unificado ── */}
      <div className="flex flex-wrap items-end gap-3 p-4 sm:p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xs shadow-2xs">
        {reportType === "institucional" && setRPeriod && (
          <TemporalFocusFilter rPeriod={rPeriod} setRPeriod={setRPeriod} />
        )}

        {isPeriodoVisible && (
          <PeriodoFilter
            anio={anio}
            setAnio={setAnio}
            aniosAcademicos={aniosAcademicos}
            disabled={isLoadingSecciones}
          />
        )}

        {isMesVisible && (
          <MesFilter
            mes={mes}
            setMes={setMes}
            disabled={isLoadingSecciones}
          />
        )}

        <GradoFilter
          gradoId={gradoId}
          setGradoId={setGradoId}
          setSeccionId={setSeccionId}
          grados={grados}
          nivelId={nivelId}
          isLoadingSecciones={isLoadingSecciones}
        />

        <SeccionFilter
          seccionId={seccionId}
          setSeccionId={setSeccionId}
          gradoId={gradoId}
          secciones={secciones}
          allowAllSections={allowAllSections}
          isLoadingSecciones={isLoadingSecciones}
        />

        {reportType === "individual" && (
          <EstudianteFilter
            alumnos={alumnos}
            studentId={studentId}
            setStudentId={setStudentId}
            seccionId={seccionId}
            isLoadingAlumnos={isLoadingAlumnos}
          />
        )}

        <ConsultarButton
          onClick={onConsultar}
          disabled={disabledConsultar}
          isPending={isPending}
        />
      </div>
    </div>
  );
}

function GradoFilter({
  gradoId,
  setGradoId,
  setSeccionId,
  grados,
  nivelId,
  isLoadingSecciones,
}: {
  gradoId: string | null;
  setGradoId: (val: string) => void;
  setSeccionId: (val: string) => void;
  grados: any[];
  nivelId?: string | null;
  isLoadingSecciones?: boolean;
}) {
  return (
    <div className="space-y-1.5 w-[170px]">
      <StepSelect
        step={2}
        label="Grado / Año"
        placeholder="Seleccionar grado"
        value={gradoId || ""}
        disabled={!nivelId || !!isLoadingSecciones}
        active={!!gradoId}
        onValueChange={(val) => {
          setGradoId(val);
          setSeccionId("");
        }}
      >
        {grados.map((g: any) => (
          <SelectItem key={g.id} value={g.id} className="text-xs">
            {g.nombre}
          </SelectItem>
        ))}
      </StepSelect>
    </div>
  );
}

function SeccionFilter({
  seccionId,
  setSeccionId,
  gradoId,
  secciones,
  allowAllSections,
  isLoadingSecciones,
}: {
  seccionId: string;
  setSeccionId: (val: string) => void;
  gradoId: string | null;
  secciones: any[];
  allowAllSections: boolean;
  isLoadingSecciones?: boolean;
}) {
  const filteredSecciones = (secciones || []).filter((s: any) => {
    if (!gradoId) return false;
    return s.gradoId === gradoId || s.grado?.id === gradoId;
  });

  return (
    <div className="space-y-1.5 w-[200px]">
      <StepSelect
        step={3}
        label="Sección"
        placeholder="Seleccionar sección"
        value={seccionId}
        disabled={!gradoId || !!isLoadingSecciones}
        active={!!seccionId}
        onValueChange={setSeccionId}
      >
        {allowAllSections && (
          <SelectItem value="all" className="text-xs font-bold text-primary italic">
            Todas las secciones
          </SelectItem>
        )}
        {filteredSecciones.map((s: any) => {
          const turnoText = s.turno ? ` · ${s.turno}` : "";
          const sedeText = s.sede?.nombre ? ` (${s.sede.nombre})` : "";
          return (
            <SelectItem key={s.id} value={s.id} className="text-xs">
              Sección &quot;{s.seccion}&quot;{turnoText}{sedeText}
            </SelectItem>
          );
        })}
      </StepSelect>
    </div>
  );
}

function ConsultarButton({
  onClick,
  disabled,
  isPending,
}: {
  onClick?: () => void;
  disabled: boolean;
  isPending?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-transparent ml-1 select-none">
        &nbsp;
      </span>
      <Button
        onClick={onClick}
        disabled={disabled}
        className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/25 transition-[background-color,transform] active:scale-95 rounded-xl gap-2"
      >
        {isPending ? (
          <IconLoader2 className="animate-spin size-4" />
        ) : (
          <IconSearch className="size-4" />
        )}
        Consultar
      </Button>
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
  value: string | null;
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
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            active ? "text-primary/80" : "text-muted-foreground/50",
          )}
        >
          {label}
        </span>
      </div>
      <Select onValueChange={onValueChange} value={value || ""} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-9 w-full rounded-xl border-border/40 text-xs font-bold transition-[color,background-color,border-color,box-shadow,opacity]",
            active
              ? "border-primary/30 bg-primary/5 text-foreground shadow-sm"
              : "bg-background/40 text-muted-foreground hover:bg-background/60",
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
