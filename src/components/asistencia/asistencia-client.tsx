"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { AsistenciaTable } from "./asistencia-table";
import {
  SeccionAsistencia,
  AlumnoAsistencia,
  AsistenciaClientProps,
} from "./components/asistencia-types";
import { AsistenciaHeaderHub } from "./components/asistencia-header-hub";
import { AsistenciaKpiBar } from "./components/asistencia-kpi-bar";
import { AsistenciaFloatingBar } from "./components/asistencia-floating-bar";
import { AsistenciaFilterToolbar } from "./components/asistencia-filter-toolbar";
import { AsistenciaEmptyState } from "./components/asistencia-empty-state";
import { useAsistenciaManager } from "./components/use-asistencia-manager";

export function AsistenciaClient({
  initialSecciones,
  defaultYear,
  profesorId,
}: AsistenciaClientProps) {
  const {
    fecha,
    setFecha,
    seccionId,
    setSeccionId,
    visibleSecciones,
    niveles,
    selectedNivelFilter,
    setSelectedNivelFilter,
    totalAlumnos,
    attendanceRate,
    presentesCount,
    tardanzasCount,
    ausentesCount,
    handleMarkAllPresent,
    viewMode,
    setViewMode,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    isPending,
    filteredAlumnos,
    handleEstadoChange,
    handleObservacionChange,
    hasUnsavedChanges,
    isSaving,
    onSave,
  } = useAsistenciaManager({
    initialSecciones,
    defaultYear,
    profesorId,
  });

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-200 pb-24">
      {/* 1. Selector Rápido de Aula & Fecha (Fast Hub) */}
      <AsistenciaHeaderHub
        seccionId={seccionId}
        onSeccionIdChange={setSeccionId}
        visibleSecciones={visibleSecciones}
        niveles={niveles}
        selectedNivelFilter={selectedNivelFilter}
        onNivelFilterChange={setSelectedNivelFilter}
        fecha={fecha}
        onFechaChange={setFecha}
      />

      {seccionId ? (
        <>
          {/* 2. Métricas & Fast Action Bar */}
          <AsistenciaKpiBar
            totalAlumnos={totalAlumnos}
            attendanceRate={attendanceRate}
            presentesCount={presentesCount}
            tardanzasCount={tardanzasCount}
            ausentesCount={ausentesCount}
            onMarkAllPresent={handleMarkAllPresent}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* 3. Filtros & Buscador */}
          <AsistenciaFilterToolbar
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            totalAlumnos={totalAlumnos}
            ausentesCount={ausentesCount}
            tardanzasCount={tardanzasCount}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
          />

          {/* 4. Lista o Pad Táctil de Alumnos */}
          {isPending ? (
            <div className="flex items-center justify-center py-20 bg-card/60 rounded-3xl border border-border/50">
              <IconLoader2 className="size-8 animate-spin text-primary opacity-60" />
            </div>
          ) : (
            <AsistenciaTable
              data={filteredAlumnos}
              viewMode={viewMode}
              onEstadoChange={handleEstadoChange}
              onJustificacionChange={handleObservacionChange}
            />
          )}

          {/* 5. Barra Flotante de Guardado (Sticky Bottom Bar) */}
          <AsistenciaFloatingBar
            presentesCount={presentesCount}
            totalAlumnos={totalAlumnos}
            ausentesCount={ausentesCount}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onSave={onSave}
          />
        </>
      ) : (
        <AsistenciaEmptyState />
      )}
    </div>
  );
}

export type { AsistenciaClientProps, SeccionAsistencia, AlumnoAsistencia };
