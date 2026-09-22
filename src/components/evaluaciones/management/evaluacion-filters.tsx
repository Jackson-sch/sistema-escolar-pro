"use client";

import * as React from "react";
import {
  IconSchool,
  IconCertificate,
  IconBuilding,
  IconBook,
  IconClipboardList,
  IconCalendar,
  IconChecklist,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EvaluacionFilterChips } from "./evaluacion-filter-chips";
import { useEvaluacionFilterOptions } from "./use-evaluacion-filter-options";

export interface EvaluacionFiltersProps {
  table: any;
  nivelId: string | null;
  gradoId: string | null;
  nivelAcademicoId: string | null;
  cursoId: string | null;
  tipoId: string | null;
  periodoId: string | null;
  estado: string | null;
  meta: any;
  onClearFilters?: () => void;
}

export function EvaluacionFilters(props: EvaluacionFiltersProps) {
  const {
    nivelId,
    gradoId,
    nivelAcademicoId,
    cursoId,
    tipoId,
    periodoId,
    estado,
    meta,
    onClearFilters,
  } = props;

  const { niveles, grados, aulas, filteredCursos, activeChips } =
    useEvaluacionFilterOptions(props);

  const isCursoDisabled = !nivelId && !gradoId && !nivelAcademicoId;
  const cursoPlaceholder = nivelAcademicoId
    ? "Curso del aula..."
    : gradoId
      ? "Curso del grado..."
      : nivelId
        ? "Curso del nivel..."
        : "Nivel o grado primero...";

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex flex-row flex-wrap items-center gap-2 w-full">
        {/* 1. Selector de Nivel Académico */}
        <Select
          value={nivelId || "all"}
          onValueChange={(v) => {
            const val = v === "all" ? null : v;
            meta.setNivelId(val);
            meta.setGradoId(null);
            meta.setNivelAcademicoId(null);
            meta.setCursoId(null);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[130px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <IconSchool className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder="Nivel" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Todos los Niveles</SelectItem>
            {niveles.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 2. Selector de Grado (Filtrado por Nivel) */}
        <Select
          value={gradoId || "all"}
          disabled={!nivelId}
          onValueChange={(v) => {
            const val = v === "all" ? null : v;
            meta.setGradoId(val);
            meta.setNivelAcademicoId(null);
            meta.setCursoId(null);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[130px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer disabled:opacity-50">
            <div className="flex items-center gap-2 truncate">
              <IconCertificate className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder={nivelId ? "Grado" : "Grado (Nivel...)"} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Todos los Grados</SelectItem>
            {grados.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 3. Selector de Sección / Aula */}
        <Select
          value={nivelAcademicoId || "all"}
          disabled={!nivelId && !gradoId}
          onValueChange={(v) => {
            const val = v === "all" ? null : v;
            meta.setNivelAcademicoId(val);
            meta.setCursoId(null);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer disabled:opacity-50">
            <div className="flex items-center gap-2 truncate">
              <IconBuilding className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder="Sección / Aula" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Todas las Secciones</SelectItem>
            {aulas.map((aula) => (
              <SelectItem key={aula.id} value={aula.id}>
                {aula.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 4. Selector de Curso (Adaptado a nivel/grado/aula) */}
        <Select
          value={cursoId || "all"}
          disabled={isCursoDisabled}
          onValueChange={(v) => meta.setCursoId(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer disabled:opacity-50">
            <div className="flex items-center gap-2 truncate">
              <IconBook className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder={cursoPlaceholder} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Todos los Cursos</SelectItem>
            {filteredCursos.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 5. Selector de Tipo de Evaluación */}
        <Select
          value={tipoId || "all"}
          onValueChange={(v) => meta.setTipoId(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[130px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <IconClipboardList className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder="Tipo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Tipos</SelectItem>
            {meta?.tipos?.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 6. Selector de Periodo */}
        <Select
          value={periodoId || "all"}
          onValueChange={(v) => meta.setPeriodoId(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[130px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <IconCalendar className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder="Periodo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Periodos</SelectItem>
            {meta?.periodos?.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 7. Selector de Estado de Calificación */}
        <Select
          value={estado || "all"}
          onValueChange={(v) => meta.setEstado(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[130px] bg-background border-border/50 text-xs shadow-2xs rounded-xl px-3 h-9 hover:bg-muted/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <IconChecklist className="size-3.5 opacity-60 shrink-0 text-primary" />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="calificada">Calificadas</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <EvaluacionFilterChips chips={activeChips} onClearAll={onClearFilters} />
    </div>
  );
}
