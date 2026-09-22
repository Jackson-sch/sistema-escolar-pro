"use client";

import { DataTable } from "@/components/ui/data-table";
import { StudentDirectoryGrid } from "@/components/gestion/estudiantes/management/student-directory-grid";
import { StudentKeyboardLegend } from "@/components/gestion/estudiantes/components/student-keyboard-legend";
import StudentStats from "@/components/gestion/estudiantes/components/stats";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { useCurrentRole } from "@/hooks/use-current-role";
import {
  StudentTableProps,
  StudentTableMeta,
} from "./components/student-table-types";
import { StudentTableFilters } from "./components/student-table-filters";
import { StudentDirectoryPagination } from "./components/student-directory-pagination";
import { StudentTableDrawers } from "./components/student-table-drawers";
import { useStudentTableManager } from "./components/use-student-table-manager";

export function StudentTable<TData extends StudentTableType, TValue>({
  columns,
  data,
  meta,
  stats,
  showPadronExport = false,
}: StudentTableProps<TData, TValue>) {
  const role = useCurrentRole();
  const isProfessor = role === "profesor";
  const canManage = role === "administrativo" || role === "super_admin";

  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    estadoFilter,
    setEstadoFilter,
    nivelFilter,
    gradoFilter,
    setGradoFilter,
    matriculaFilter,
    setMatriculaFilter,
    page,
    setPage,
    limit,
    setLimit,
    selectedIndex,
    setSelectedIndex,
    selectedStudent,
    isDrawerOpen,
    setIsDrawerOpen,
    isEditOpen,
    setIsEditOpen,
    isEnrollmentOpen,
    setIsEnrollmentOpen,
    handleOpenDrawer,
    availableNiveles,
    availableGrados,
    handleNivelChange,
    filteredData,
    currentPageStudents,
    hasActiveFilters,
    clearFilters,
    activeFilterCount,
    uniqueEstados,
  } = useStudentTableManager({
    data,
    meta,
    canManage,
  });

  return (
    <div className="space-y-4">
      {/* ── BENTO KPIS INTERACTIVOS ── */}
      {stats && (
        <StudentStats
          stats={stats}
          activeFilter={matriculaFilter}
          onFilterChange={(filter) => {
            setMatriculaFilter(filter === matriculaFilter ? "ALL" : filter);
            setPage(1);
            setSelectedIndex(0);
          }}
        />
      )}

      {/* ── BARRA DE HERRAMIENTAS Y VISTAS ── */}
      <StudentTableFilters
        nivelFilter={nivelFilter}
        onNivelChange={handleNivelChange}
        availableNiveles={availableNiveles}
        gradoFilter={gradoFilter}
        onGradoChange={(val) => {
          setGradoFilter(val);
          setPage(1);
          setSelectedIndex(0);
        }}
        availableGrados={availableGrados}
        estadoFilter={estadoFilter}
        onEstadoChange={(val) => {
          setEstadoFilter(val);
          setPage(1);
          setSelectedIndex(0);
        }}
        uniqueEstados={uniqueEstados}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        showPadronExport={showPadronExport}
        filteredData={filteredData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        nivelesAcademicos={meta?.nivelesAcademicos}
      />

      {/* ── CUERPO PRINCIPAL SEGÚN MODO DE VISTA ── */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          <StudentDirectoryGrid
            students={currentPageStudents}
            onSelectStudent={handleOpenDrawer}
            meta={meta}
            selectedIndex={selectedIndex}
          />

          <StudentDirectoryPagination
            filteredCount={filteredData.length}
            page={page}
            limit={limit}
            onPageChange={(newPage) => {
              setPage(newPage);
              setSelectedIndex(0);
            }}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
              setSelectedIndex(0);
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <DataTable
            columns={columns}
            data={filteredData}
            searchKey="estudiante"
            searchPlaceholder="Buscar por DNI, nombre, código o apoderado..."
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setPage(1);
              setSelectedIndex(0);
            }}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            meta={meta}
            pageIndex={page - 1}
            pageSize={limit}
            onPageIndexChange={(index) => {
              setPage(index + 1);
              setSelectedIndex(0);
            }}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setSelectedIndex(0);
            }}
            showColumnVisibility={false}
            onRowClick={(row) => handleOpenDrawer(row as StudentTableType)}
            selectedIndex={selectedIndex}
            emptyStateTitle="No se encontraron estudiantes"
            emptyStateDescription="No pudimos encontrar estudiantes que coincidan con los filtros o la búsqueda ingresada."
          />

          <StudentKeyboardLegend variant="footer" />
        </div>
      )}

      {/* ── DRAWERS Y MODALES DESACOPLADOS ── */}
      <StudentTableDrawers
        selectedStudent={selectedStudent}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        isEnrollmentOpen={isEnrollmentOpen}
        setIsEnrollmentOpen={setIsEnrollmentOpen}
        isProfessor={isProfessor}
        meta={meta}
        currentYear={stats?.currentYear}
      />
    </div>
  );
}

export type { StudentTableMeta, StudentTableProps };
