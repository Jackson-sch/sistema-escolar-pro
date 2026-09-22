"use client";

import {
  IconDeviceFloppy,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle,
  IconDownload,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotasFormHeaderProps {
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  isPending: boolean;
  isDirty?: boolean;
  onGuardar: () => void;
  onExportExcel?: () => void;
  onBulkFillDefault?: () => void;
  onClearAll?: () => void;
}

export function NotasFormHeader({
  escala,
  isPending,
  isDirty = false,
  onGuardar,
  onExportExcel,
  onBulkFillDefault,
  onClearAll,
}: NotasFormHeaderProps) {
  const isLiteral = escala === "LITERAL";

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border/40 pb-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Registro de Calificaciones
          </h2>
          <Badge
            className={cn(
              "rounded-lg px-2.5 py-0.5 font-bold border-0 shadow-2xs text-[11px]",
              isLiteral
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-blue-600/10 text-blue-600 border border-blue-500/20",
            )}
          >
            {isLiteral ? "Escala CNEB (Literal)" : "Escala Vigesimal (0-20)"}
          </Badge>

          {/* Estado de Sincronización */}
          {isPending ? (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold gap-1 text-[10px]">
              <IconLoader2 className="animate-spin size-3" />
              Guardando en servidor...
            </Badge>
          ) : isDirty ? (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold gap-1 text-[10px]">
              <IconAlertCircle className="size-3" />
              ● Cambios pendientes
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold gap-1 text-[10px]">
              <IconCircleCheck className="size-3 text-emerald-500" />
              Sincronizado
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal flex-wrap pt-0.5">
          <span>{isLiteral ? "Selecciona AD, A, B, C o pulsa teclado:" : "Digita notas de 00 a 20:"}</span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-foreground/80 bg-muted/70 px-1.5 py-0.5 rounded-md border border-border/50">
            <kbd>↓</kbd> / <kbd>Enter</kbd> Siguiente
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-foreground/80 bg-muted/70 px-1.5 py-0.5 rounded-md border border-border/50">
            <kbd>↑</kbd> Anterior
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-foreground/80 bg-muted/70 px-1.5 py-0.5 rounded-md border border-border/50">
            <kbd>Ctrl+S</kbd> Guardar
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {/* Acciones de Llenado Rápido */}
        {onBulkFillDefault && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBulkFillDefault}
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
            title={isLiteral ? "Asigna 'A' (Logro Esperado) a todos los alumnos sin nota" : "Asigna '14' a todos los alumnos sin nota"}
          >
            <IconSparkles className="size-3.5" />
            {isLiteral ? "Rellenar con 'A' (Logro Esperado)" : "Rellenar con 14"}
          </Button>
        )}

        {onClearAll && isDirty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="rounded-xl text-muted-foreground hover:text-destructive text-xs font-medium gap-1 cursor-pointer"
          >
            <IconTrash className="size-3.5" />
            Limpiar
          </Button>
        )}

        {onExportExcel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
          >
            <IconDownload className="size-3.5" /> Excel
          </Button>
        )}

        <Button
          onClick={onGuardar}
          disabled={isPending || !isDirty}
          className="rounded-xl h-9 px-4 font-bold text-xs shadow-md shadow-primary/20 cursor-pointer gap-2"
        >
          {isPending ? (
            <IconLoader2 className="animate-spin size-4" />
          ) : (
            <IconDeviceFloppy className="size-4" />
          )}
          <span>{isPending ? "Guardando..." : "Guardar Todo"}</span>
          <Badge className="bg-primary-foreground/20 text-primary-foreground text-[9px] px-1 py-0 border-none font-mono">
            Ctrl+S
          </Badge>
        </Button>
      </div>
    </div>
  );
}
