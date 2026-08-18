"use client";

import { useState, useTransition, useEffect, useRef, useMemo, useCallback, useReducer } from "react";
import { toast } from "sonner";

import {
  IconBook,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";
import { NIVEL_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";
import {
  getMonthlyAsistenciaReportAction,
  getAttendanceAlertsAction,
  getInstitutionalSummaryAction,
  getStudentAnnualAttendanceAction,
  getJustificacionesAction,
} from "@/actions/attendance";
import {
  getSeccionesAction,
  getStudentsInSeccionAction,
} from "@/actions/academic-structure";

import { ReporteFiltros } from "@/components/asistencia/reportes/reporte-filtros";
import { ReporteHeader } from "@/components/asistencia/reportes/reporte-header";
import { ReporteTable } from "@/components/asistencia/reportes/reporte-table";
import { ReporteEmptyState } from "@/components/asistencia/reportes/reporte-empty-state";
import { ReporteAlertas } from "@/components/asistencia/reportes/reporte-alertas";
import { ReporteInstitucional } from "@/components/asistencia/reportes/reporte-institucional";
import { ReporteIndividual } from "@/components/asistencia/reportes/reporte-individual";
import { ReporteJustificaciones } from "@/components/asistencia/reportes/reporte-justificaciones";

interface AsistenciaReportesProps {
  initialSecciones: any[];
  aniosAcademicos: number[];
  defaultYear: number;
  profesorId?: string;
}

// ─── Report Results Reducer ──────────────────────────────────────────────────
// Los resultados de los distintos reportes cambian juntos (se limpian al
// consultar), por eso se agrupan en un solo reducer.

interface InstReportData {
  data: any[];
  stats?: any;
  trendData?: any[];
  meta?: any;
}

interface ReportResultsState {
  reportData: any[];
  daysInMonth: number;
  alertsData: any[];
  instData: InstReportData;
  studentData: any[];
  justificationsData: any[];
}

type ReportResultsAction =
  | { type: "RESET" }
  | { type: "SET_REPORT"; data: any[]; days: number }
  | { type: "SET_ALERTS"; data: any[] }
  | { type: "SET_INST"; inst: InstReportData }
  | { type: "SET_STUDENT"; data: any[] }
  | { type: "SET_JUSTIFICATIONS"; data: any[] };

const reportResultsInitialState: ReportResultsState = {
  reportData: [],
  daysInMonth: 0,
  alertsData: [],
  instData: { data: [] },
  studentData: [],
  justificationsData: [],
};

function reportResultsReducer(
  state: ReportResultsState,
  action: ReportResultsAction,
): ReportResultsState {
  switch (action.type) {
    case "RESET":
      return { ...reportResultsInitialState };
    case "SET_REPORT":
      return { ...state, reportData: action.data, daysInMonth: action.days };
    case "SET_ALERTS":
      return { ...state, alertsData: action.data };
    case "SET_INST":
      return { ...state, instData: action.inst };
    case "SET_STUDENT":
      return { ...state, studentData: action.data };
    case "SET_JUSTIFICATIONS":
      return { ...state, justificationsData: action.data };
    default:
      return state;
  }
}

// ─── Fetch de reportes (fuera del componente) ────────────────────────────────

type ReportFetchResult =
  | { ok: true; action: ReportResultsAction }
  | { ok: false; error: string };

interface ReportFetchParams {
  seccionId: string;
  mes: number;
  anio: number;
  nivelId: string;
  gradoId: string;
  rPeriod: "today" | "month" | "year";
  studentId: string;
}

async function fetchReportData(
  reportType: string,
  p: ReportFetchParams,
): Promise<ReportFetchResult> {
  if (reportType === "mensual") {
    if (!p.seccionId) return { ok: false, error: "" };
    const res = await getMonthlyAsistenciaReportAction(p.seccionId, p.mes, p.anio);
    if (res.data && res.meta)
      return {
        ok: true,
        action: { type: "SET_REPORT", data: res.data, days: res.meta.totalDias },
      };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "alertas") {
    const res = await getAttendanceAlertsAction(
      p.anio,
      p.seccionId === "all" ? undefined : p.seccionId,
      p.nivelId || undefined,
      p.gradoId || undefined,
    );
    if (res.data) return { ok: true, action: { type: "SET_ALERTS", data: res.data } };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "institucional") {
    const res = await getInstitutionalSummaryAction(
      new Date(),
      p.nivelId || undefined,
      p.gradoId || undefined,
      p.mes,
      p.anio,
      p.rPeriod,
    );
    if (res.data)
      return {
        ok: true,
        action: {
          type: "SET_INST",
          inst: {
            data: res.data,
            stats: res.stats,
            trendData: res.trendData,
            meta: res.meta,
          },
        },
      };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "individual") {
    if (!p.studentId) return { ok: false, error: "" };
    const res = await getStudentAnnualAttendanceAction(p.studentId, p.anio);
    if (res.data) return { ok: true, action: { type: "SET_STUDENT", data: res.data } };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "justificaciones") {
    const res = await getJustificacionesAction(
      p.anio,
      p.seccionId === "all" ? undefined : p.seccionId,
      p.nivelId || undefined,
      p.gradoId || undefined,
    );
    if (res.data)
      return { ok: true, action: { type: "SET_JUSTIFICATIONS", data: res.data } };
    if (res.error) return { ok: false, error: res.error };
  }

  return { ok: false, error: "" };
}

// ─── Subcomponentes presentacionales ─────────────────────────────────────────

interface NivelesSidebarProps {
  niveles: any[];
  nivelId: string;
  isLoadingSecciones: boolean;
  onSelectNivel: (nivelId: string) => void;
}

function NivelesSidebar({
  niveles,
  nivelId,
  isLoadingSecciones,
  onSelectNivel,
}: NivelesSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r bg-card/80 rounded-l-2xl overflow-hidden">
      <div className="px-5 py-5 border-b border-border/30">
        <h2 className="text-xs font-black uppercase tracking-widest text-foreground/80">
          Reportes Escolares
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
          Análisis de asistencia
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {niveles.map((nivel: any) => {
          const Icon = NIVEL_ICON_MAP[nivel.nombre] || IconBook;
          const isActive = nivelId === nivel.id;
          return (
            <button
              key={nivel.id}
              onClick={() => onSelectNivel(nivel.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-[color,background-color,box-shadow] duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5 shrink-0 transition-transform", isActive && "scale-110")} />
              <span className="text-[11px] font-bold tracking-wider">
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
    </aside>
  );
}

interface MobileNivelSelectorProps {
  niveles: any[];
  nivelId: string;
  onSelectNivel: (nivelId: string) => void;
}

function MobileNivelSelector({
  niveles,
  nivelId,
  onSelectNivel,
}: MobileNivelSelectorProps) {
  return (
    <div className="lg:hidden px-4 pt-4">
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40">
        {niveles.map((nivel: any) => {
          const Icon = NIVEL_ICON_MAP[nivel.nombre?.toUpperCase()] || IconBook;
          const isActive = nivelId === nivel.id;
          return (
            <button
              key={nivel.id}
              onClick={() => onSelectNivel(nivel.id)}
              className={cn(
                "flex-1 flex flex-col items-center py-2.5 rounded-lg transition-[color,background-color,box-shadow] gap-1",
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
  );
}

interface ReporteResultadosProps {
  reportType: string;
  isPending: boolean;
  seccionId: string;
  studentId: string;
  reportData: any[];
  daysInMonth: number;
  anio: number;
  mes: number;
  alertsData: any[];
  instData: InstReportData;
  studentData: any[];
  justificationsData: any[];
  estudianteNombre: string;
}

function ReporteResultados({
  reportType,
  isPending,
  seccionId,
  studentId,
  reportData,
  daysInMonth,
  anio,
  mes,
  alertsData,
  instData,
  studentData,
  justificationsData,
  estudianteNombre,
}: ReporteResultadosProps) {
  return (
    <div className="flex-1 p-4 lg:p-6 pt-0">
      {reportType === "mensual" && seccionId && (
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-in fade-in zoom-in-95 animation-duration-">
          {isPending ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <ReporteEmptyState type="loading" />
            </div>
          ) : (
            <>
              <ReporteHeader
                mes={mes}
                anio={anio}
                totalEstudiantes={reportData.length}
                data={reportData}
                daysInMonth={daysInMonth}
              />

              <div>
                {reportData.length > 0 ? (
                  <ReporteTable
                    reportData={reportData}
                    daysInMonth={daysInMonth}
                    anio={anio}
                    mes={mes}
                  />
                ) : (
                  <ReporteEmptyState type="empty" />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {reportType === "alertas" && (
        <ReporteAlertas alertas={alertsData} isPending={isPending} />
      )}

      {reportType === "institucional" && (
        <ReporteInstitucional
          resumen={
            seccionId && seccionId !== "all"
              ? instData.data.filter((d: any) => d.id === seccionId)
              : instData.data
          }
          stats={instData.stats}
          trendData={instData.trendData}
          meta={instData.meta}
          isPending={isPending}
        />
      )}

      {reportType === "individual" && studentId && (
        <ReporteIndividual
          data={studentData}
          estudianteNombre={estudianteNombre}
          isPending={isPending}
        />
      )}

      {reportType === "justificaciones" && (
        <ReporteJustificaciones
          justificaciones={justificationsData}
          isPending={isPending}
        />
      )}

      {!seccionId &&
        !studentId &&
        reportType !== "institucional" &&
        reportType !== "alertas" &&
        reportType !== "justificaciones" &&
        !isPending && (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 animate-in fade-in animation-duration-">
            <ReporteEmptyState type="initial" />
          </div>
        )}
    </div>
  );
}

interface ReporteControlesProps {
  nivelActual: any;
  seccionActual: any;
  anio: number;
  setAnio: (anio: number) => void;
  mes: number;
  setMes: (mes: number) => void;
  reportType: "mensual" | "institucional" | "alertas" | "individual" | "justificaciones";
  setReportType: (type: "mensual" | "institucional" | "alertas" | "individual" | "justificaciones") => void;
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

function ReporteControles({
  nivelActual,
  seccionActual,
  anio,
  setAnio,
  mes,
  setMes,
  reportType,
  setReportType,
  rPeriod,
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
  alumnos,
  aniosAcademicos,
  isLoadingSecciones,
  isLoadingAlumnos,
  isPending,
  onConsultar,
}: ReporteControlesProps) {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 pb-0">
      <div className="space-y-1">
        <h1 className="text-lg font-bold tracking-tight uppercase">
          {nivelActual
            ? `Reportes de ${nivelActual.nombre}`
            : "Reportes de Asistencia"}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {seccionActual ? (
            <>
              <span>{seccionActual.grado?.nombre}</span>
              <IconChevronRight className="size-3 opacity-40" />
              <span>Sección &ldquo;{seccionActual.seccion}&rdquo;</span>
            </>
          ) : nivelActual ? (
            <span>Selecciona grado y sección para generar reportes</span>
          ) : (
            <span>Selecciona un nivel en el panel lateral</span>
          )}
        </div>
      </div>

      <ReporteFiltros
        anio={anio}
        setAnio={setAnio}
        mes={mes}
        setMes={setMes}
        nivelId={nivelId}
        gradoId={gradoId}
        seccionId={seccionId}
        setSeccionId={setSeccionId}
        setGradoId={setGradoId}
        studentId={studentId}
        setStudentId={setStudentId}
        rPeriod={rPeriod}
        setRPeriod={setRPeriod}
        reportType={reportType}
        setReportType={setReportType}
        secciones={secciones}
        grados={grados}
        alumnos={alumnos}
        aniosAcademicos={aniosAcademicos}
        isLoadingSecciones={isLoadingSecciones}
        isLoadingAlumnos={isLoadingAlumnos}
        isPending={isPending}
        onConsultar={onConsultar}
      />
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function AsistenciaReportes({
  initialSecciones,
  aniosAcademicos,
  defaultYear,
  profesorId,
}: AsistenciaReportesProps) {
  const [anio, setAnio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(defaultYear),
  );
  const [mes, setMes] = useQueryState(
    "mes",
    parseAsInteger.withDefault(new Date().getMonth()),
  );
  const [secciones, setSecciones] = useState<any[]>(initialSecciones);
  const [seccionId, setSeccionId] = useQueryState(
    "seccion",
    parseAsString.withDefault(""),
  );
  const [reportType, setReportType] = useQueryState(
    "type",
    parseAsString.withDefault("mensual"),
  ) as any;
  const [rPeriod, setRPeriod] = useQueryState("rPeriod", parseAsStringLiteral(["today", "month", "year"]).withDefault("month"));
  const [studentId, setStudentId] = useQueryState(
    "student",
    parseAsString.withDefault(""),
  );
  const [nivelId, setNivelId] = useQueryState("nivel", parseAsString.withDefault(""));
  const [gradoId, setGradoId] = useQueryState("grado", parseAsString.withDefault(""));

  // Resultados de los reportes agrupados en un reducer (se limpian juntos).
  const [results, dispatchResults] = useReducer(reportResultsReducer, undefined, () => ({
    ...reportResultsInitialState,
  }));

  const {
    reportData,
    daysInMonth,
    alertsData,
    instData,
    studentData,
    justificationsData,
  } = results;

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
    secciones.forEach((s) => {
      if (s.nivel?.id === nivelId && s.grado && !map.has(s.grado.id)) {
        map.set(s.grado.id, s.grado);
      }
    });
    return Array.from(map.values());
  }, [secciones, nivelId]);

  const filteredSecciones = useMemo(() => {
    if (!gradoId) return [];
    return secciones.filter((s) => s.grado?.id === gradoId);
  }, [secciones, gradoId]);

  const nivelActual = niveles.find((n: any) => n.id === nivelId);
  const seccionActual = secciones.find((s) => s.id === seccionId);

  const [isPending, startTransition] = useTransition();
  const [isLoadingSecciones, setIsLoadingSecciones] = useState(false);
  const [isLoadingAlumnos, setIsLoadingAlumnos] = useState(false);
  const [alumnos, setAlumnos] = useState<any[]>([]);

  const prevAnioRef = useRef(anio);

  // Cargar secciones cuando cambie el año
  useEffect(() => {
    let ignore = false;
    const loadSecciones = async () => {
      if (ignore) return;
      setIsLoadingSecciones(true);
      const res = await getSeccionesAction({
        anioAcademico: anio,
        profesorId,
      });
      if (ignore) return;
      if (res.data) {
        setSecciones(res.data);
        if (prevAnioRef.current !== anio) {
          setNivelId("");
          setGradoId("");
          setSeccionId("");
          setStudentId("");
          dispatchResults({ type: "RESET" });
          prevAnioRef.current = anio;
        }
      }
      setIsLoadingSecciones(false);
    };
    loadSecciones();
    return () => {
      ignore = true;
    };
  }, [anio, profesorId, setNivelId, setGradoId, setSeccionId, setStudentId]);

  // Selección por defecto del nivel, grado y sección del docente o primera opción
  useEffect(() => {
    if (secciones.length > 0 && !nivelId) {
      const targetSeccion =
        (profesorId
          ? secciones.find((s: any) => s.tutor?.id === profesorId) ||
            secciones.find((s: any) =>
              s.cursos?.some(
                (c: any) => c.profesorId === profesorId || c.profesor?.id === profesorId,
              ),
            )
          : null) || secciones[0];

      if (targetSeccion) {
        if (targetSeccion.nivel?.id) setNivelId(targetSeccion.nivel.id);
        if (targetSeccion.grado?.id) setGradoId(targetSeccion.grado.id);
        if (targetSeccion.id) setSeccionId(targetSeccion.id);
      }
    }
  }, [secciones, nivelId, profesorId, setNivelId, setGradoId, setSeccionId]);

  // Cargar alumnos cuando cambie la sección (solo para reporte individual)
  useEffect(() => {
    let ignore = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (reportType === "individual" && seccionId && seccionId !== "all") {
      const loadAlumnos = async () => {
        if (ignore) return;
        setIsLoadingAlumnos(true);
        const res = await getStudentsInSeccionAction(seccionId);
        if (ignore) return;
        if (res.data) setAlumnos(res.data);
        setIsLoadingAlumnos(false);
      };
      loadAlumnos();
    } else {
      // Limpieza diferida para evitar setState síncrono dentro del efecto
      timer = setTimeout(() => setAlumnos([]), 0);
    }
    return () => {
      ignore = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [seccionId, reportType]);

  const handleSelectNivel = useCallback(
    (id: string) => {
      setNivelId(id);
      setGradoId("");
      setSeccionId("");
      setStudentId("");
      dispatchResults({ type: "RESET" });
    },
    [setNivelId, setGradoId, setSeccionId, setStudentId],
  );

  const loadReport = useCallback(() => {
    startTransition(async () => {
      // Limpiar datos previos
      dispatchResults({ type: "RESET" });

      const result = await fetchReportData(reportType, {
        seccionId,
        mes,
        anio,
        nivelId,
        gradoId,
        rPeriod: rPeriod as "today" | "month" | "year",
        studentId,
      });
      if (result.ok) {
        dispatchResults(result.action);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }, [
    reportType,
    seccionId,
    mes,
    anio,
    nivelId,
    gradoId,
    rPeriod,
    studentId,
  ]);

  // Cargar reporte automáticamente al cambiar parámetros
  useEffect(() => {
    if (
      reportType === "institucional" ||
      reportType === "alertas" ||
      reportType === "justificaciones"
    ) {
      loadReport();
    } else if (reportType === "mensual" && seccionId) {
      loadReport();
    } else if (reportType === "individual" && studentId) {
      loadReport();
    }
  }, [reportType, seccionId, studentId, loadReport]);

  const estudianteActual = alumnos.find((a) => a.id === studentId);
  const estudianteNombre = estudianteActual
    ? `${estudianteActual.apellidoPaterno} ${estudianteActual.apellidoMaterno}, ${estudianteActual.name}`
    : "";

  return (
    <div className="flex gap-0 w-full animate-in fade-in animation-duration- min-h-[calc(100vh-12rem)]">
      <NivelesSidebar
        niveles={niveles}
        nivelId={nivelId}
        isLoadingSecciones={isLoadingSecciones}
        onSelectNivel={handleSelectNivel}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <MobileNivelSelector
          niveles={niveles}
          nivelId={nivelId}
          onSelectNivel={handleSelectNivel}
        />

        <ReporteControles
          nivelActual={nivelActual}
          seccionActual={seccionActual}
          anio={anio}
          setAnio={setAnio}
          mes={mes}
          setMes={setMes}
          reportType={reportType}
          setReportType={setReportType}
          rPeriod={rPeriod as "today" | "month" | "year"}
          setRPeriod={setRPeriod}
          nivelId={nivelId}
          gradoId={gradoId}
          setGradoId={setGradoId}
          seccionId={seccionId}
          setSeccionId={setSeccionId}
          studentId={studentId}
          setStudentId={setStudentId}
          secciones={filteredSecciones}
          grados={grados}
          alumnos={alumnos}
          aniosAcademicos={aniosAcademicos}
          isLoadingSecciones={isLoadingSecciones}
          isLoadingAlumnos={isLoadingAlumnos}
          isPending={isPending}
          onConsultar={loadReport}
        />

        <ReporteResultados
          reportType={reportType}
          isPending={isPending}
          seccionId={seccionId}
          studentId={studentId}
          reportData={reportData}
          daysInMonth={daysInMonth}
          anio={anio}
          mes={mes}
          alertsData={alertsData}
          instData={instData}
          studentData={studentData}
          justificationsData={justificationsData}
          estudianteNombre={estudianteNombre}
        />
      </main>
    </div>
  );
}
