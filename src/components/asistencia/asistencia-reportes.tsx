"use client";

import { AsistenciaReportesProps } from "./reportes/reporte-types";
import { ReporteResultados } from "./reportes/reporte-resultados";
import { ReporteControles } from "./reportes/reporte-controles";
import { useAsistenciaReportesState } from "./reportes/use-asistencia-reportes-state";

export function AsistenciaReportes({
  initialSecciones,
  aniosAcademicos,
  defaultYear,
  profesorId,
}: AsistenciaReportesProps) {
  const {
    isPending,
    reportType,
    setReportType,
    anio,
    setAnio,
    mes,
    setMes,
    nivelId,
    setNivelId,
    gradoId,
    setGradoId,
    seccionId,
    setSeccionId,
    rPeriod,
    setRPeriod,
    studentId,
    setStudentId,
    reportData,
    daysInMonth,
    alertsData,
    instData,
    studentData,
    justificationsData,
    secciones,
    alumnos,
    isLoadingSecciones,
    isLoadingAlumnos,
    niveles,
    grados,
    handleConsultar,
    nivelActual,
    seccionActual,
    estudianteNombre,
  } = useAsistenciaReportesState({
    initialSecciones,
    defaultYear,
    profesorId,
  });

  return (
    <div className="flex flex-col w-full space-y-5">
      {/* Controles y Filtros */}
      <ReporteControles
        nivelActual={nivelActual}
        seccionActual={seccionActual}
        anio={anio}
        setAnio={setAnio}
        mes={mes}
        setMes={setMes}
        reportType={reportType}
        setReportType={(tipo) => {
          setReportType(tipo);
          if (tipo === "institucional" || tipo === "alertas" || tipo === "justificaciones") {
            setSeccionId("all");
          }
        }}
        rPeriod={rPeriod}
        setRPeriod={setRPeriod}
        nivelId={nivelId}
        gradoId={gradoId}
        setGradoId={(id) => {
          setGradoId(id);
          setSeccionId("");
          setStudentId("");
        }}
        seccionId={seccionId}
        setSeccionId={(id) => {
          setSeccionId(id);
          setStudentId("");
        }}
        studentId={studentId}
        setStudentId={setStudentId}
        secciones={secciones}
        grados={grados}
        alumnos={alumnos}
        aniosAcademicos={aniosAcademicos}
        isLoadingSecciones={isLoadingSecciones}
        isLoadingAlumnos={isLoadingAlumnos}
        isPending={isPending}
        onConsultar={handleConsultar}
        niveles={niveles}
        onSelectNivel={(id) => {
          setNivelId(id);
          setGradoId("");
          setSeccionId("");
          setStudentId("");
        }}
      />

      {/* Resultados del Reporte */}
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
    </div>
  );
}
