"use client";

import { useMemo } from "react";
import type { EvaluacionTableType } from "./evaluacion-table";

interface FilterParams {
  searchQuery: string;
  nivelId: string | null;
  gradoId: string | null;
  nivelAcademicoId: string | null;
  cursoId: string | null;
  tipoId: string | null;
  periodoId: string | null;
  estado: string | null;
}

export function useEvaluacionTableStats(
  data: EvaluacionTableType[],
  filters: FilterParams,
) {
  const {
    searchQuery,
    nivelId,
    gradoId,
    nivelAcademicoId,
    cursoId,
    tipoId,
    periodoId,
    estado,
  } = filters;

  const hasActiveFilters =
    !!nivelId ||
    !!gradoId ||
    !!nivelAcademicoId ||
    !!cursoId ||
    !!tipoId ||
    !!periodoId ||
    !!estado ||
    !!searchQuery;

  // Filtrado reactivo de evaluaciones sincronizado con la vista
  const filteredData = useMemo(() => {
    return data.filter((ev) => {
      if (
        searchQuery &&
        !ev.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (nivelId) {
        const evNivelId =
          ev.curso?.nivelAcademico?.nivel?.id ||
          (ev.curso?.nivelAcademico as any)?.nivelId;
        if (evNivelId !== nivelId) return false;
      }
      if (gradoId) {
        const evGradoId =
          ev.curso?.nivelAcademico?.grado?.id ||
          (ev.curso?.nivelAcademico as any)?.gradoId;
        if (evGradoId !== gradoId) return false;
      }
      if (
        nivelAcademicoId &&
        ev.curso?.nivelAcademico?.id !== nivelAcademicoId
      ) {
        return false;
      }
      if (cursoId) {
        if (cursoId.startsWith("name:")) {
          const target = cursoId.slice(5).toLowerCase();
          if (ev.curso?.nombre?.toLowerCase() !== target) return false;
        } else if (
          ev.curso?.id !== cursoId &&
          ev.curso?.nombre?.toLowerCase() !== cursoId.toLowerCase()
        ) {
          return false;
        }
      }
      if (tipoId && ev.tipoEvaluacion?.id !== tipoId) {
        return false;
      }
      if (periodoId && ev.periodo?.id !== periodoId) {
        return false;
      }
      if (estado) {
        const isGraded = ev._count.notas > 0;
        if (estado === "calificada" && !isGraded) return false;
        if (estado === "pendiente" && isGraded) return false;
      }
      return true;
    });
  }, [
    data,
    searchQuery,
    nivelId,
    gradoId,
    nivelAcademicoId,
    cursoId,
    tipoId,
    periodoId,
    estado,
  ]);

  const totalEvaluaciones = filteredData.length;
  const totalGlobal = data.length;
  const totalNotas = filteredData.reduce((sum, ev) => sum + ev._count.notas, 0);
  const sinCalificar = filteredData.filter((ev) => ev._count.notas === 0).length;

  // Cálculo real del promedio general de las calificaciones
  const promedioGeneral = useMemo(() => {
    const notasList = filteredData.flatMap((ev) => ev.notas || []);
    if (notasList.length === 0) return null;
    const sum = notasList.reduce((acc, n) => acc + n.valor, 0);
    return sum / notasList.length;
  }, [filteredData]);

  return {
    filteredData,
    totalEvaluaciones,
    totalGlobal,
    totalNotas,
    sinCalificar,
    promedioGeneral,
    hasActiveFilters,
  };
}
