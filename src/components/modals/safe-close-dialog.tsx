"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconRotateClockwise,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ShineBorder } from "../ui/shine-border";

interface SafeCloseDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SafeCloseDialog({
  isOpen,
  onConfirm,
  onCancel,
}: SafeCloseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[400px] gap-0 p-0 border-none bg-card shadow-2xl overflow-hidden"
      >
        <ShineBorder shineColor={["#3b82f6", "#ef4444", "#22c55e", "#eab308"]} />

        <div className="p-6 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
            <IconAlertTriangle size={32} strokeWidth={1.5} />
          </div>

          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-bold tracking-tight text-center">
              Cambios sin guardar
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-center px-2">
              Tienes modificaciones pendientes en el formulario. ¿Estás seguro
              de que deseas salir y perder los cambios?
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="p-6 pt-0 flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-full border-border/40 hover:bg-accent/50 group"
          >
            <IconRotateClockwise className="mr-2 size-4 transition-transform group-hover:-rotate-45" />
            Continuar editando
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
          >
            <IconX className="mr-2 size-4" />
            Descartar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
