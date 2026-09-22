"use client";

import * as React from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PeriodoDeleteDialogProps {
  periodo: {
    id: string;
    nombre: string;
    _count?: { evaluaciones: number };
  } | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function PeriodoDeleteDialog({
  periodo,
  onClose,
  onConfirm,
  isDeleting,
}: PeriodoDeleteDialogProps) {
  const evalCount = periodo?._count?.evaluaciones || 0;
  const hasEvaluaciones = evalCount > 0;

  return (
    <Dialog open={!!periodo} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-3xl p-5 border-border/50 max-w-[420px]">
        <DialogHeader>
          <div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
            <IconAlertCircle className="size-5" />
          </div>
          <DialogTitle className="text-base font-extrabold tracking-tight">
            ¿Eliminar {periodo?.nombre}?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {hasEvaluaciones ? (
              <span className="text-destructive font-semibold block mt-1">
                Atención: Este periodo tiene {evalCount} evaluación(es) asociada(s).
                Debes eliminar o desvincular las evaluaciones primero.
              </span>
            ) : (
              "Esta acción eliminará el periodo académico del sistema. Esta operación no se puede deshacer."
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2 border-t border-border/40 gap-2 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl text-xs h-9"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting || hasEvaluaciones}
            className="rounded-xl text-xs h-9 bg-destructive text-white hover:bg-destructive/90 font-bold"
          >
            {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
