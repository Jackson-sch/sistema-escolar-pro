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
}: ReporteFiltrosProps) {
  return (
    <div className="space-y-4 lg:space-y-6 animate-in slide-in-from-top-2 animation-duration-">
      <AnimatedTabs
        layoutId="report-type-tabs"
        tabs={[
          { id: "mensual", label: "Mensual", icon: <IconCalendarMonth className="size-4" /> },
          { id: "institucional", label: "Institucional", icon: <IconSchool className="size-4" /> },
          { id: "alertas", label: "Alertas", icon: <IconAlertTriangle className="size-4" /> },
          { id: "individual", label: "Individual", icon: <IconUser className="size-4" /> },
          {
            id: "justificaciones",
            label: "Justificaciones",
            icon: <IconFileCheck className="size-4" />,
          },
        ]}
        activeTab={reportType}
        onTabChange={(id) => {
          setReportType(id as any);
          if (id !== "individual" && setStudentId) setStudentId("");
        }}
      />

      {/* Barra de Filtros — Inline compacta */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Foco Temporal — solo visible en reporte institucional */}
        {reportType === "institucional" && setRPeriod && (
          <div className="space-y-1.5 -mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest ml-1">
              Foco
            </span>
            <AnimatedTabs
              layoutId="temporal-focus-tabs"
              size="sm"
              tabs={[
                { id: "today", label: "Hoy" },
                { id: "month", label: "Mes" },
                { id: "year", label: "Año" },
              ]}
              activeTab={rPeriod}
              onTabChange={(id) => setRPeriod(id as any)}
              className="bg-muted/40 border-none"
            />
          </div>
        )}

        {/* Periodo */}
        {(rPeriod !== "today" || reportType !== "institucional") && (
          <div className="space-y-1.5 w-[100px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              Periodo
            </span>
            <Select
              onValueChange={(v) => setAnio(Number(v))}
              value={anio.toString()}
              disabled={isLoadingSecciones}
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
        )}

        {/* Mes */}
        {((reportType === "mensual" || reportType === "justificaciones") || (reportType === "institucional" && rPeriod === "month")) && (
          <div className="space-y-1.5 w-[120px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              Mes
            </span>
            <Select
              onValueChange={(v) => setMes(Number(v))}
              value={mes.toString()}
              disabled={isLoadingSecciones}
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
        )}

        {/* Grado */}
        <div className="space-y-1.5 w-[170px]">
          <StepSelect
            step={2}
            label="Grado / Año"
            placeholder="Seleccionar grado"
            value={gradoId || ""}
            disabled={!nivelId || isLoadingSecciones}
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

        {/* Sección */}
        <div className="space-y-1.5 w-[200px]">
          <StepSelect
            step={3}
            label="Sección"
            placeholder="Seleccionar sección"
            value={seccionId}
            disabled={!gradoId || isLoadingSecciones}
            active={!!seccionId}
            onValueChange={setSeccionId}
          >
            {(reportType === "institucional" ||
              reportType === "justificaciones" ||
              reportType === "alertas") && (
              <SelectItem value="all" className="text-xs font-bold text-primary italic">
                Todas las secciones
              </SelectItem>
            )}
            {secciones.map((s: any) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                Sección &quot;{s.seccion}&quot; {s.turno ? `· ${s.turno}` : ""}
              </SelectItem>
            ))}
          </StepSelect>
        </div>

        {/* Estudiante (solo Individual) */}
        {reportType === "individual" && (
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
              placeholder={
                !seccionId
                  ? "Elegir sección"
                  : isLoadingAlumnos
                    ? "Cargando..."
                    : "Elegir alumno"
              }
              searchPlaceholder="Buscar estudiante..."
              className="capitalize"
            />
          </div>
        )}

        {/* Botón Consultar */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-transparent ml-1 select-none">
            &nbsp;
          </span>
          <Button
            onClick={onConsultar}
            disabled={
              (reportType !== "institucional" &&
                reportType !== "justificaciones" &&
                reportType !== "alertas" &&
                reportType !== "individual" &&
                !seccionId) ||
              (reportType === "individual" && !studentId) ||
              isPending
            }
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
      </div>
    </div>
  )
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
