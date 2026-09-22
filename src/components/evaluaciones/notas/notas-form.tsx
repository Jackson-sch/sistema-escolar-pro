"use client";

import * as React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import { NotasFormHeader } from "./notas-form-header";
import { NotasFormStats } from "./notas-form-stats";
import { NotasTable } from "./notas-table";
import { NotasTableRow } from "./notas-table-row";
import {
  NotasFormProps,
  NotaData,
  EstudianteType,
  EscalaType,
} from "./notas-form-types";
import { useNotasAiFeedback } from "./hooks/use-notas-ai-feedback";
import { useNotasManager } from "./hooks/use-notas-manager";
import { NotasBottomFloatingBar } from "./components/notas-bottom-floating-bar";

function handleInputKeyDown(
  e: React.KeyboardEvent<
    HTMLInputElement | HTMLButtonElement | HTMLDivElement
  >,
  index: number,
) {
  if (e.key === "ArrowDown" || e.key === "Enter") {
    e.preventDefault();
    const nextInput = document.querySelector(
      `[data-index="${index + 1}"]`,
    ) as HTMLElement | null;
    if (nextInput) {
      nextInput.focus();
      if (
        "select" in nextInput &&
        typeof (nextInput as any).select === "function"
      ) {
        (nextInput as any).select();
      }
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prevInput = document.querySelector(
      `[data-index="${index - 1}"]`,
    ) as HTMLElement | null;
    if (prevInput) {
      prevInput.focus();
      if (
        "select" in prevInput &&
        typeof (prevInput as any).select === "function"
      ) {
        (prevInput as any).select();
      }
    }
  }
}

export function NotasForm({
  evaluacionId,
  cursoId,
  estudiantes,
  notasExistentes: initialNotas,
  escala = "VIGESIMAL",
  cursoNombre = "Curso",
  evaluacionNombre = "Evaluación",
}: NotasFormProps) {
  const {
    notas,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isPending,
    isDirty,
    draftToRestore,
    restoreDraft,
    discardDraft,
    isRowModified,
    handleBulkFillDefault,
    handleClearAll,
    estudiantesFiltrados,
    handleNotaChange,
    handleGuardar,
    handleExportExcel,
    stats,
  } = useNotasManager({
    evaluacionId,
    cursoId,
    estudiantes,
    initialNotas,
    escala,
    cursoNombre,
    evaluacionNombre,
  });

  const { isStreaming, activeStudentId, streamingContent, handleGenerateAI } =
    useNotasAiFeedback({
      cursoNombre,
      evaluacionNombre,
      notas,
      onCommit: (studentId, text) =>
        handleNotaChange(studentId, text, "comentario"),
    });

  return (
    <div className="space-y-5 w-full mx-auto pb-24">
      {/* Banner de Borrador No Guardado */}
      {draftToRestore && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <IconSparkles className="size-4 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Borrador local no guardado detectado
              </h4>
              <p className="text-[11px] text-muted-foreground font-medium">
                Tienes calificaciones locales pendientes de sincronizar con el
                servidor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={discardDraft}
              className="text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Ignorar
            </Button>
            <Button
              size="sm"
              onClick={restoreDraft}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-3.5 h-8 gap-1.5 shadow-xs"
            >
              <IconSparkles className="size-3" />
              Restaurar Borrador
            </Button>
          </div>
        </div>
      )}

      <NotasFormHeader
        escala={escala}
        isPending={isPending}
        isDirty={isDirty}
        onGuardar={handleGuardar}
        onExportExcel={handleExportExcel}
        onBulkFillDefault={handleBulkFillDefault}
        onClearAll={handleClearAll}
      />

      <NotasFormStats
        total={stats.total}
        calificados={stats.calificados}
        pendientes={stats.pendientes}
        promedio={stats.promedio}
        distribucion={stats.distribucion}
        escala={escala}
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <NotasTable isEmpty={estudiantesFiltrados.length === 0}>
        {estudiantesFiltrados.map((est, index) => (
          <NotasTableRow
            key={est.id}
            estudiante={est}
            index={index}
            escala={escala}
            notaData={notas[est.id]}
            onNotaChange={handleNotaChange}
            onGenerateAI={handleGenerateAI}
            isStreaming={isStreaming}
            streamingContent={streamingContent(est.id)}
            isActiveForAI={activeStudentId === est.id}
            onKeyDown={handleInputKeyDown}
            isModified={isRowModified(est.id)}
          />
        ))}
      </NotasTable>

      <NotasBottomFloatingBar
        isDirty={isDirty}
        isPending={isPending}
        onGuardar={handleGuardar}
        escala={escala}
        stats={stats}
      />
    </div>
  );
}

export type { NotasFormProps, EstudianteType, NotaData, EscalaType };
