"use client";

import { ReporteFiltros } from "./reporte-filtros";

interface ReporteControlesProps {
  nivelActual: any;
  seccionActual: any;
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

export function ReporteControles({
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
  niveles,
  onSelectNivel,
}: ReporteControlesProps) {
  return (
    <ReporteFiltros
      anio={anio}
      setAnio={setAnio}
      mes={mes}
      setMes={setMes}
      reportType={reportType}
      setReportType={setReportType}
      rPeriod={rPeriod}
      setRPeriod={setRPeriod}
      nivelId={nivelId}
      gradoId={gradoId}
      setGradoId={setGradoId}
      seccionId={seccionId}
      setSeccionId={setSeccionId}
      studentId={studentId}
      setStudentId={setStudentId}
      secciones={secciones}
      grados={grados}
      alumnos={alumnos}
      aniosAcademicos={aniosAcademicos}
      isLoadingSecciones={isLoadingSecciones}
      isLoadingAlumnos={isLoadingAlumnos}
      isPending={isPending}
      onConsultar={onConsultar}
      niveles={niveles}
      onSelectNivel={onSelectNivel}
    />
  );
}
