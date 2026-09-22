"use client";

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface EnrollmentFormActionsProps {
  isPending: boolean;
  onCancel?: () => void;
}

export function EnrollmentFormActions({
  isPending,
  onCancel,
}: EnrollmentFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
        >
          Cancelar
        </Button>
      )}
      <Button
        type="submit"
        disabled={isPending}
        className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            <span>Registrando...</span>
          </>
        ) : (
          <>
            <span>Confirmar Matrícula</span>
            <IconArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
