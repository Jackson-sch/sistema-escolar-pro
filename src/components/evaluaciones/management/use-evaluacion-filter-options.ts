"use client";

import { useEffect, useMemo } from "react";

export interface UseEvaluacionFilterOptionsProps {
  table: any;
  nivelId: string | null;
  gradoId: string | null;
  nivelAcademicoId: string | null;
  cursoId: string | null;
  tipoId: string | null;
  periodoId: string | null;
  estado: string | null;
  meta: any;
}

export function useEvaluacionFilterOptions({
  table,
  nivelId,
  gradoId,
  nivelAcademicoId,
  cursoId,
  tipoId,
  periodoId,
  estado,
  meta,
}: UseEvaluacionFilterOptionsProps) {
  // Sincronizar filtros con columnas de TanStack Table
  useEffect(() => {
    table.getColumn("nivelId")?.setFilterValue(nivelId);
  }, [nivelId, table]);

  useEffect(() => {
    table.getColumn("gradoId")?.setFilterValue(gradoId);
  }, [gradoId, table]);

  useEffect(() => {
    table.getColumn("nivelAcademicoId")?.setFilterValue(nivelAcademicoId);
  }, [nivelAcademicoId, table]);

  useEffect(() => {
    table.getColumn("cursoId")?.setFilterValue(cursoId);
  }, [cursoId, table]);

  useEffect(() => {
    table.getColumn("tipoId")?.setFilterValue(tipoId);
  }, [tipoId, table]);

  useEffect(() => {
    table.getColumn("periodoId")?.setFilterValue(periodoId);
  }, [periodoId, table]);

  useEffect(() => {
    table.getColumn("estadoNotas")?.setFilterValue(estado);
  }, [estado, table]);

  // 1. Extraer niveles únicos
  const niveles = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string }>();
    meta?.secciones?.forEach((s: any) => {
      if (s.nivel && !map.has(s.nivel.id)) {
        map.set(s.nivel.id, { id: s.nivel.id, nombre: s.nivel.nombre });
      }
    });
    meta?.cursos?.forEach((c: any) => {
      const n = c.nivelAcademico?.nivel;
      if (n && !map.has(n.id)) {
        map.set(n.id, { id: n.id, nombre: n.nombre });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [meta?.secciones, meta?.cursos]);

  // 2. Extraer grados únicos (filtrados por nivel si está seleccionado)
  const grados = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; nivelId: string; orden: number }>();
    meta?.secciones?.forEach((s: any) => {
      if (s.grado && !map.has(s.grado.id)) {
        map.set(s.grado.id, {
          id: s.grado.id,
          nombre: s.grado.nombre,
          nivelId: s.nivel?.id || s.grado.nivelId || "",
          orden: s.grado.orden ?? 0,
        });
      }
    });
    meta?.cursos?.forEach((c: any) => {
      const g = c.nivelAcademico?.grado;
      if (g && !map.has(g.id)) {
        map.set(g.id, {
          id: g.id,
          nombre: g.nombre,
          nivelId: c.nivelAcademico?.nivel?.id || c.nivelAcademico?.nivelId || "",
          orden: g.orden ?? 0,
        });
      }
    });

    let list = Array.from(map.values());
    if (nivelId) {
      list = list.filter((g) => g.nivelId === nivelId);
    }
    return list.sort((a, b) => (a.orden !== b.orden ? a.orden - b.orden : a.nombre.localeCompare(b.nombre)));
  }, [meta?.secciones, meta?.cursos, nivelId]);

  // 3. Extraer aulas (secciones), filtradas por nivel y grado
  const aulas = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; gradoId: string; nivelId: string }>();
    const source = meta?.secciones?.length
      ? meta.secciones
      : meta?.cursos?.map((c: any) => c.nivelAcademico).filter(Boolean);

    source?.forEach((s: any) => {
      if (s?.id && !map.has(s.id)) {
        map.set(s.id, {
          id: s.id,
          nombre: `${s.grado?.nombre || ""} "${s.seccion}"`.trim(),
          gradoId: s.grado?.id || s.gradoId || "",
          nivelId: s.nivel?.id || s.nivelId || "",
        });
      }
    });

    let list = Array.from(map.values());
    if (nivelId) {
      list = list.filter((a) => a.nivelId === nivelId);
    }
    if (gradoId) {
      list = list.filter((a) => a.gradoId === gradoId);
    }
    return list.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [meta?.secciones, meta?.cursos, nivelId, gradoId]);

  // 4. Extraer cursos adaptados estrictamente al nivel, grado o aula seleccionada
  const filteredCursos = useMemo(() => {
    const cursosSource = meta?.cursos || [];
    // Si no se ha elegido ni nivel ni grado ni aula, no mostrar lista masiva caótica
    if (!nivelId && !gradoId && !nivelAcademicoId) {
      return [];
    }

    let list = cursosSource;
    if (nivelAcademicoId) {
      list = list.filter((c: any) => c.nivelAcademico?.id === nivelAcademicoId);
      // En aula específica: devolver cursos con su id real
      return list.map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
      })).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    }

    if (gradoId) {
      list = list.filter((c: any) => {
        const gId = c.nivelAcademico?.grado?.id || c.nivelAcademico?.gradoId;
        return gId === gradoId;
      });
    } else if (nivelId) {
      list = list.filter((c: any) => {
        const nId = c.nivelAcademico?.nivel?.id || c.nivelAcademico?.nivelId;
        return nId === nivelId;
      });
    }

    // A nivel de Grado o Nivel: agrupar por nombre único para no repetir "Matemática" por cada sección
    const uniqueNames = new Map<string, { id: string; nombre: string }>();
    list.forEach((c: any) => {
      const normalizedName = c.nombre.trim();
      if (!uniqueNames.has(normalizedName)) {
        uniqueNames.set(normalizedName, {
          id: `name:${normalizedName}`,
          nombre: normalizedName,
        });
      }
    });
    return Array.from(uniqueNames.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [meta?.cursos, nivelAcademicoId, gradoId, nivelId]);

  // 5. Generar chips activos
  const activeChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; value: string; onRemove: () => void }> = [];
    if (nivelId) {
      const item = niveles.find((n) => n.id === nivelId);
      if (item) chips.push({ id: "nivel", label: "Nivel", value: item.nombre, onRemove: () => meta.setNivelId(null) });
    }
    if (gradoId) {
      const item = grados.find((g) => g.id === gradoId);
      if (item) chips.push({ id: "grado", label: "Grado", value: item.nombre, onRemove: () => meta.setGradoId(null) });
    }
    if (nivelAcademicoId) {
      const item = aulas.find((a) => a.id === nivelAcademicoId);
      if (item) chips.push({ id: "aula", label: "Aula", value: item.nombre, onRemove: () => meta.setNivelAcademicoId(null) });
    }
    if (cursoId) {
      const cleanName = cursoId.startsWith("name:")
        ? cursoId.slice(5)
        : meta?.cursos?.find((c: any) => c.id === cursoId)?.nombre || cursoId;
      chips.push({ id: "curso", label: "Curso", value: cleanName, onRemove: () => meta.setCursoId(null) });
    }
    if (tipoId) {
      const item = meta?.tipos?.find((t: any) => t.id === tipoId);
      if (item) chips.push({ id: "tipo", label: "Tipo", value: item.nombre, onRemove: () => meta.setTipoId(null) });
    }
    if (periodoId) {
      const item = meta?.periodos?.find((p: any) => p.id === periodoId);
      if (item) chips.push({ id: "periodo", label: "Periodo", value: item.nombre, onRemove: () => meta.setPeriodoId(null) });
    }
    if (estado) {
      chips.push({
        id: "estado",
        label: "Estado",
        value: estado === "calificada" ? "Calificadas" : "Pendientes",
        onRemove: () => meta.setEstado(null),
      });
    }
    return chips;
  }, [nivelId, gradoId, nivelAcademicoId, cursoId, tipoId, periodoId, estado, niveles, grados, aulas, meta]);

  return {
    niveles,
    grados,
    aulas,
    filteredCursos,
    activeChips,
  };
}
