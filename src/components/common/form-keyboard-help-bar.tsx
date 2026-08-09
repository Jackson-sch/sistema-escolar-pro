"use client";

import { IconKeyboard } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface ShortcutItem {
  key: string;
  description: string;
}

interface FormKeyboardHelpBarProps {
  shortcuts?: ShortcutItem[];
  className?: string;
}

const defaultShortcuts: ShortcutItem[] = [
  { key: "↵ Enter", description: "Siguiente campo" },
  { key: "Ctrl + S", description: "Guardar cambios" },
  { key: "Esc", description: "Cancelar / Cerrar" },
];

/**
 * FormKeyboardHelpBar - EduNova Pro Design System
 *
 * Componente reutilizable para mostrar guías de productividad y atajos de teclado en formularios.
 */
export function FormKeyboardHelpBar({
  shortcuts = defaultShortcuts,
  className,
}: FormKeyboardHelpBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <IconKeyboard className="size-4 text-indigo-500 shrink-0" />
        <span className="font-semibold text-foreground">Acceso Rápido por Teclado:</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {shortcuts.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/40 font-mono text-[10px] font-bold text-foreground">
              {item.key}
            </kbd>{" "}
            {item.description}
          </span>
        ))}
      </div>
    </div>
  );
}
