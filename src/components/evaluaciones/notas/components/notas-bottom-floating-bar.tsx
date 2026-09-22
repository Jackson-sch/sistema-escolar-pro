"use client";

import {
  IconKeyboard,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EscalaType } from "../notas-form-types";

interface NotasBottomFloatingBarProps {
  isDirty: boolean;
  isPending: boolean;
  onGuardar: () => void;
  escala: EscalaType;
  stats: {
    total: number;
    calificados: number;
    countAD: number;
    countA: number;
    countB: number;
    countC: number;
    promedio: number | null;
  };
}

export function NotasBottomFloatingBar({
  isDirty,
  isPending,
  onGuardar,
  escala,
  stats,
}: NotasBottomFloatingBarProps) {
  return (
    <>
      {/* BARRA DIDÁCTICA DE ATAJOS DE TECLADO */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/50 text-xs font-medium text-muted-foreground shadow-xs">
        <div className="flex items-center gap-2">
          <IconKeyboard className="size-4 text-primary" />
          <span className="font-bold text-foreground">Atajos Rápidos:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              A
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              D
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              B
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              C
            </kbd>{" "}
            Asignar calificación
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              ↵ Enter
            </kbd>{" "}
            o{" "}
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              ↓
            </kbd>{" "}
            Siguiente alumno
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/50 font-mono text-[10px] font-bold text-foreground">
              Ctrl + S
            </kbd>{" "}
            Guardar todo
          </span>
        </div>
      </div>

      {/* BARRA FLOTANTE DE GUARDADO (STICKY BOTTOM BAR) */}
      {isDirty && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-slate-950/90 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-white/15 shadow-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                <span className="text-xs font-bold font-mono">
                  {stats.calificados}/{stats.total} Calificados
                </span>
              </div>
              {escala === "LITERAL" ? (
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    AD: {stats.countAD}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                    A: {stats.countA}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    B: {stats.countB}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                    C: {stats.countC}
                  </span>
                </div>
              ) : (
                stats.promedio !== null && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-bold text-blue-300 border-blue-400/40 bg-blue-500/10"
                  >
                    Prom: {stats.promedio}
                  </Badge>
                )
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={onGuardar}
                disabled={isPending}
                className="rounded-xl h-9 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer gap-2 border border-indigo-400/30"
              >
                {isPending ? (
                  <IconLoader2 size={15} className="animate-spin" />
                ) : (
                  <IconDeviceFloppy size={15} />
                )}
                <span>
                  {isPending ? "Guardando..." : "Guardar Calificaciones"}
                </span>
                <Badge className="hidden sm:inline-flex bg-indigo-700/60 text-white text-[9px] px-1.5 py-0 border-none font-mono">
                  Ctrl + S
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
