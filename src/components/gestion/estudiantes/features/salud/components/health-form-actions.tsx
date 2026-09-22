"use client";

import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface HealthFormActionsProps {
  isPending: boolean;
  onCancel?: () => void;
}

export function HealthFormActions({
  isPending,
  onCancel,
}: HealthFormActionsProps) {
  return (
    <div className="flex justify-end gap-2.5 pt-4 border-t border-border/30">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="rounded-xl h-10 px-5 font-semibold text-xs border-border/40 cursor-pointer"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isPending}
        className="rounded-xl h-10 px-5 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
      >
        {isPending ? (
          <>
            <IconRefresh className="size-4 animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <IconCheck className="size-4" />
            <span>Guardar Cambios</span>
          </>
        )}
      </Button>
    </div>
  );
}
