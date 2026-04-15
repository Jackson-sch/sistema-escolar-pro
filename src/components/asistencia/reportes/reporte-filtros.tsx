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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComboboxReusable, type ComboboxItem } from "@/components/ui/combobox-reusable";

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
    <div className="space-y-4 lg:space-y-6 animate-in slide-in-from-top-2 duration-500">
      {/* Selector de Tipo de Reporte (Tabs) */}
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/30 border border-border/40 rounded-2xl w-fit">
          {[
            { id: "mensual", label: "Mensual", icon: IconCalendarMonth },
            { id: "institucional", label: "Institucional", icon: IconSchool },
            { id: "alertas", label: "Alertas", icon: IconAlertTriangle },
            { id: "individual", label: "Individual", icon: IconUser },
            {
              id: "justificaciones",
              label: "Justificaciones",
              icon: IconFileCheck,
            },
          ].map((type) => (
            <Tooltip key={type.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant={reportType === type.id ? "default" : "ghost"}
                  onClick={() => {
                    setReportType(type.id as any);
                    if (type.id !== "individual" && setStudentId)
                      setStudentId("");
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 lg:px-4 h-9 text-[11px] lg:text-xs transition-all rounded-xl outline-none border-none",
                    reportType === type.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                  )}
                >
                  <type.icon className="size-3.5" />
                  <span className="hidden sm:inline-block">{type.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="font-bold text-[10px] py-1.5 px-3 bg-primary text-primary-foreground border-none rounded-lg"
              >
                {type.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Toolbar de Filtros */}
      <div className="bg-card border border-border/40 rounded-3xl p-4 lg:p-5 shadow-sm relative overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Periodo y Mes */}
          <div className={cn(
            "space-y-4",
            reportType === "individual" ? "lg:col-span-3" : "lg:col-span-4"
          )}>
            {reportType === "institucional" && setRPeriod && (
              <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">
                  Foco Temporal
                </label>
                <div className="flex p-1 bg-background/40 border border-border/40 rounded-xl">
                  {[
                    { id: "today", label: "Hoy" },
                    { id: "month", label: "Mes" },
                    { id: "year", label: "Año" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setRPeriod(p.id as any)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                        rPeriod === p.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-background/60"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {(rPeriod !== "today" || reportType !== "institucional") && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    Periodo
                  </label>
                  <Select
                    onValueChange={(v) => setAnio(Number(v))}
                    value={anio.toString()}
                    disabled={isLoadingSecciones}
                  >
                    <SelectTrigger className="h-9 bg-background/40 border-border/40 hover:bg-background/60 w-full rounded-xl text-xs font-bold transition-all">
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

              {((reportType === "mensual" || reportType === "justificaciones") || (reportType === "institucional" && rPeriod === "month")) && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    Mes
                  </label>
                  <Select
                    onValueChange={(v) => setMes(Number(v))}
                    value={mes.toString()}
                    disabled={isLoadingSecciones}
                  >
                    <SelectTrigger className="h-9 bg-background/40 border-border/40 hover:bg-background/60 w-full rounded-xl text-xs font-bold transition-all">
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
            </div>
          </div>

          {/* Grado y Sección (Step Selects) */}
          <div className={cn(
            "flex flex-col sm:flex-row gap-4",
            reportType === "individual" ? "lg:col-span-4" : "lg:col-span-5"
          )}>
            <div className="flex-1">
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

            <div className="flex-1">
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
                    Sección "{s.seccion}" {s.turno ? `· ${s.turno}` : ""}
                  </SelectItem>
                ))}
              </StepSelect>
            </div>
          </div>

          {/* Individual Report - Estudiante */}
          {reportType === "individual" && (
            <div className="lg:col-span-3 space-y-1.5 min-w-[180px]">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[9px] font-black transition-colors",
                  studentId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground/40"
                )}>
                  4
                </span>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Estudiante
                </label>
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

          {/* Botón de Acción */}
          <div className={reportType === "individual" ? "lg:col-span-2" : "lg:col-span-3"}>
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
              className="h-10 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95 rounded-xl gap-2"
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
        <label
          className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            active ? "text-primary/80" : "text-muted-foreground/50",
          )}
        >
          {label}
        </label>
      </div>
      <Select onValueChange={onValueChange} value={value || ""} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-9 w-full rounded-xl border-border/40 text-xs font-bold transition-all",
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
