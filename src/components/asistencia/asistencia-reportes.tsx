"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
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
  const [rPeriod, setRPeriod] = useQueryState("rPeriod", parseAsStringLiteral(["today", "month", "year"]).withDefault("today"));
  const [studentId, setStudentId] = useQueryState(
    "student",
    parseAsString.withDefault(""),
  );
  const [nivelId, setNivelId] = useQueryState("nivel", parseAsString.withDefault(""));
  const [gradoId, setGradoId] = useQueryState("grado", parseAsString.withDefault(""));

  const [reportData, setReportData] = useState<any[]>([]);
  const [daysInMonth, setDaysInMonth] = useState<number>(0);

  // Estados para otros reportes
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [instData, setInstData] = useState<{ 
    data: any[]; 
    stats?: any; 
    trendData?: any[]; 
    meta?: any 
  }>({ data: [] });
  const [studentData, setStudentData] = useState<any[]>([]);
  const [justificationsData, setJustificationsData] = useState<any[]>([]);

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

  const nivelActual = niveles.find((n: any) => n.id === nivelId);
  const seccionActual = secciones.find((s) => s.id === seccionId);

  const [isPending, startTransition] = useTransition();
  const [isLoadingSecciones, setIsLoadingSecciones] = useState(false);
  const [isLoadingAlumnos, setIsLoadingAlumnos] = useState(false);
  const [alumnos, setAlumnos] = useState<any[]>([]);

  const isFirstRender = useRef(true);

  // Cargar secciones cuando cambie el año
  useEffect(() => {
    const loadSecciones = async () => {
      setIsLoadingSecciones(true);
      const res = await getSeccionesAction({
        anioAcademico: anio,
        profesorId,
      });
      if (res.data) {
        setSecciones(res.data);
        // Si no es el primer render (ej. cambio de año), limpiar estados secundarios
        if (!isFirstRender.current) {
          setNivelId("");
          setGradoId("");
          setSeccionId("");
          setStudentId("");
          setReportData([]);
        }
        isFirstRender.current = false;
      }
      setIsLoadingSecciones(false);
    };
    loadSecciones();
  }, [anio]);

  // Selección por defecto del primer nivel disponible
  useEffect(() => {
    if (niveles.length > 0 && !nivelId) {
      setNivelId(niveles[0].id);
    }
  }, [niveles, nivelId, setNivelId]);

  // Cargar alumnos cuando cambie la sección (solo para reporte individual)
  useEffect(() => {
    if (reportType === "individual" && seccionId && seccionId !== "all") {
      const loadAlumnos = async () => {
        setIsLoadingAlumnos(true);
        const res = await getStudentsInSeccionAction(seccionId);
        if (res.data) setAlumnos(res.data);
        setIsLoadingAlumnos(false);
      };
      loadAlumnos();
    } else {
      setAlumnos([]);
    }
  }, [seccionId, reportType]);

  const loadReport = () => {
    startTransition(async () => {
      // Limpiar datos previos
      setReportData([]);
      setAlertsData([]);
      setInstData({ data: [], stats: undefined, trendData: [], meta: undefined });
      setStudentData([]);
      setJustificationsData([]);

      if (reportType === "mensual") {
        if (!seccionId) return;
        const res = await getMonthlyAsistenciaReportAction(
          seccionId,
          mes,
          anio,
        );
        if (res.data && res.meta) {
          setReportData(res.data);
          setDaysInMonth(res.meta.totalDias);
        } else if (res.error) toast.error(res.error);
      } else if (reportType === "alertas") {
        const res = await getAttendanceAlertsAction(
          anio,
          seccionId === "all" ? undefined : seccionId,
          nivelId || undefined,
          gradoId || undefined,
        );
        if (res.data) setAlertsData(res.data);
        else if (res.error) toast.error(res.error);
      } else if (reportType === "institucional") {
        const res = await getInstitutionalSummaryAction(
          new Date(),
          nivelId || undefined,
          gradoId || undefined,
          mes,
          anio,
          rPeriod as "today" | "month" | "year",
        );
        if (res.data) setInstData({ 
          data: res.data, 
          stats: res.stats, 
          trendData: res.trendData, 
          meta: res.meta 
        });
        else if (res.error) toast.error(res.error);
      } else if (reportType === "individual") {
        if (!studentId) return;
        const res = await getStudentAnnualAttendanceAction(studentId, anio);
        if (res.data) setStudentData(res.data);
        else if (res.error) toast.error(res.error);
      } else if (reportType === "justificaciones") {
        const res = await getJustificacionesAction(
          anio,
          seccionId === "all" ? undefined : seccionId,
          nivelId || undefined,
          gradoId || undefined,
        );
        if (res.data) setJustificationsData(res.data);
        else if (res.error) toast.error(res.error);
      }
    });
  };

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
  }, [seccionId, studentId, mes, reportType, anio, rPeriod, nivelId, gradoId]);

  return (
    <div className="flex gap-0 w-full animate-in fade-in duration-300 min-h-[calc(100vh-12rem)]">
      {/* Sidebar de Niveles */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r bg-card/50 backdrop-blur-sm rounded-l-2xl overflow-hidden">
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
                onClick={() => {
                  setNivelId(nivel.id);
                  setGradoId("");
                  setSeccionId("");
                  setStudentId("");
                  setReportData([]);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group",
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Level Selector */}
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
                    setStudentId("");
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

        {/* Dashboard Header & Filters */}
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
            rPeriod={rPeriod as "today" | "month" | "year"}
            setRPeriod={setRPeriod}
            reportType={reportType}
            setReportType={setReportType}
            secciones={filteredSecciones}
            grados={grados}
            alumnos={alumnos}
            aniosAcademicos={aniosAcademicos}
            isLoadingSecciones={isLoadingSecciones}
            isLoadingAlumnos={isLoadingAlumnos}
            isPending={isPending}
            onConsultar={loadReport}
          />
        </div>

        <div className="flex-1 p-4 lg:p-6 pt-0">
          {reportType === "mensual" && seccionId && (
            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-in fade-in zoom-in-95 duration-300">
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
              estudianteNombre={
                alumnos.find((a) => a.id === studentId)
                  ? `${alumnos.find((a) => a.id === studentId).apellidoPaterno} ${alumnos.find((a) => a.id === studentId).apellidoMaterno}, ${alumnos.find((a) => a.id === studentId).name}`
                  : ""
              }
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
              <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 animate-in fade-in duration-500">
                <ReporteEmptyState type="initial" />
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
