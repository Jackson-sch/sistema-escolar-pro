"use client";

import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface StudentFormActionsProps {
  isPending: boolean;
  isEdit: boolean;
  onSuccess?: () => void;
}

export function StudentFormActions({
  isPending,
  isEdit,
  onSuccess,
}: StudentFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
      <Button
        type="button"
        variant="outline"
        onClick={onSuccess}
        className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
        disabled={isPending}
      >
        Cancelar
      </Button>
      <Button
        disabled={isPending}
        type="submit"
        className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <IconDeviceFloppy className="size-4" />
            <span>{isEdit ? "Guardar Cambios" : "Registrar Estudiante"}</span>
          </>
        )}
      </Button>
    </div>
  );
}
