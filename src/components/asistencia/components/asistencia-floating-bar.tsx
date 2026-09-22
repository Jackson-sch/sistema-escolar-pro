"use client";

import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AsistenciaFloatingBarProps {
  presentesCount: number;
  totalAlumnos: number;
  ausentesCount: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function AsistenciaFloatingBar({
  presentesCount,
  totalAlumnos,
  ausentesCount,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: AsistenciaFloatingBarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-slate-950/90 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-white/15 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="text-xs font-bold font-mono">
              {presentesCount}/{totalAlumnos} P
            </span>
          </div>
          {ausentesCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono font-bold text-rose-300 border-rose-400/40 bg-rose-500/10"
            >
              {ausentesCount} Faltas
            </Badge>
          )}
          {hasUnsavedChanges && (
            <span className="hidden sm:inline text-[11px] text-amber-300 font-semibold animate-pulse">
              ● Cambios sin guardar
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl h-9 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer gap-2 border border-indigo-400/30"
          >
            {isSaving ? (
              <IconLoader2 size={15} className="animate-spin" />
            ) : (
              <IconDeviceFloppy size={15} />
            )}
            <span>{isSaving ? "Guardando..." : "Guardar Asistencia"}</span>
            <Badge className="hidden sm:inline-flex bg-indigo-700/60 text-white text-[9px] px-1.5 py-0 border-none font-mono">
              Ctrl + S
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  );
}
