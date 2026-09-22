"use client";

import { useMemo, useState, useCallback } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { StudentTableMeta } from "./student-table-types";
import { useStudentTableKeyboard } from "./use-student-table-keyboard";

interface UseStudentTableManagerProps<TData extends StudentTableType> {
  data: TData[];
  meta?: StudentTableMeta;
  canManage: boolean;
}

export function useStudentTableManager<TData extends StudentTableType>({
  data,
  meta,
  canManage,
}: UseStudentTableManagerProps<TData>) {
  // URL States for filters & view mode
  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsString.withDefault("table"),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("ALL"),
  );
  const [nivelFilter, setNivelFilter] = useQueryState(
    "nivel",
    parseAsString.withDefault("ALL"),
  );
  const [gradoFilter, setGradoFilter] = useQueryState(
    "grado",
    parseAsString.withDefault("ALL"),
  );
  const [matriculaFilter, setMatriculaFilter] = useQueryState(
    "matricula",
    parseAsString.withDefault("ALL"),
  );

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(25),
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Modals & Drawers state
  const [selectedStudent, setSelectedStudent] =
    useState<StudentTableType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

  const handleOpenDrawer = useCallback((student: StudentTableType) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((student: StudentTableType) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  }, []);

  const handleOpenEnrollment = useCallback((student: StudentTableType) => {
    setSelectedStudent(student);
    setIsEnrollmentOpen(true);
  }, []);

  // Grados disponibles filtrados en cascada por el nivel seleccionado
  const availableNiveles = useMemo(() => {
    if (!meta?.nivelesAcademicos) return [];
    return Array.from(
      new Set(meta.nivelesAcademicos.map((n) => n.nivel.nombre)),
    );
  }, [meta?.nivelesAcademicos]);

  const availableGrados = useMemo(() => {
    if (!meta?.nivelesAcademicos) return [];
    let list = meta.nivelesAcademicos;
    if (nivelFilter !== "ALL") {
      list = list.filter((n) => n.nivel.nombre === nivelFilter);
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const n of list) {
      const nombre = n.grado?.nombre;
      if (nombre && !seen.has(nombre)) {
        seen.add(nombre);
        result.push(nombre);
      }
    }
    return result;
  }, [meta?.nivelesAcademicos, nivelFilter]);

  const handleNivelChange = (val: string) => {
    setNivelFilter(val);
    setGradoFilter("ALL");
    setPage(1);
    setSelectedIndex(0);
  };

  // Filtrado de datos en memoria
  const filteredData = useMemo(() => {
    return data.filter((student) => {
      if (estadoFilter !== "ALL" && student.estado?.nombre !== estadoFilter) {
        return false;
      }
      if (
        nivelFilter !== "ALL" &&
        student.nivelAcademico?.nivel?.nombre !== nivelFilter
      ) {
        return false;
      }
      if (
        gradoFilter !== "ALL" &&
        student.nivelAcademico?.grado?.nombre !== gradoFilter
      ) {
        return false;
      }
      if (matriculaFilter === "MATRICULADO" && !student.nivelAcademico) {
        return false;
      }
      if (matriculaFilter === "SIN_MATRICULA" && !!student.nivelAcademico) {
        return false;
      }
      if (matriculaFilter === "NUEVO" && !student.matriculadoEsteAnio) {
        return false;
      }
      return true;
    });
  }, [data, estadoFilter, nivelFilter, gradoFilter, matriculaFilter]);

  const currentPageStudents = useMemo(() => {
    return filteredData.slice((page - 1) * limit, page * limit);
  }, [filteredData, page, limit]);

  useStudentTableKeyboard({
    isDrawerOpen,
    isEditOpen,
    isEnrollmentOpen,
    currentPageStudents,
    selectedIndex,
    setSelectedIndex,
    canManage,
    handleOpenDrawer,
    handleOpenEdit,
    handleOpenEnrollment,
    setViewMode,
  });

  const hasActiveFilters =
    searchQuery !== "" ||
    estadoFilter !== "ALL" ||
    nivelFilter !== "ALL" ||
    gradoFilter !== "ALL" ||
    matriculaFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("ALL");
    setNivelFilter("ALL");
    setGradoFilter("ALL");
    setMatriculaFilter("ALL");
    setPage(1);
    setSelectedIndex(0);
  };

  const activeFilterCount = [
    searchQuery !== "",
    estadoFilter !== "ALL",
    nivelFilter !== "ALL",
    gradoFilter !== "ALL",
    matriculaFilter !== "ALL",
  ].filter(Boolean).length;

  const uniqueEstados = useMemo(() => {
    if (!meta?.estados) return [];
    const seen = new Set<string>();
    return meta.estados.filter((e) => {
      if (!e.nombre || seen.has(e.nombre)) return false;
      seen.add(e.nombre);
      return true;
    });
  }, [meta?.estados]);

  return {
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
  };
}
