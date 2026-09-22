"use client";

import { IconSunrise, IconDoorExit } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ScannerMode } from "./scanner-types";

interface ScannerModeToggleProps {
  mode: ScannerMode;
  onChange: (mode: ScannerMode) => void;
  className?: string;
  isKiosk?: boolean;
}

export function ScannerModeToggle({
  mode,
  onChange,
  className,
  isKiosk = false,
}: ScannerModeToggleProps) {
  const isIngreso = mode === "ingreso";

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-2xl bg-muted/60 border border-border/50 shadow-inner select-none",
        isKiosk && "p-1.5 rounded-3xl bg-black/40 border-white/15",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("ingreso")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs",
          isKiosk && "px-4 py-2 text-sm rounded-2xl",
          isIngreso
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.02]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <IconSunrise className={cn("size-4", isKiosk && "size-5")} />
        <span>Ingreso</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("salida")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs",
          isKiosk && "px-4 py-2 text-sm rounded-2xl",
          !isIngreso
            ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.02]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <IconDoorExit className={cn("size-4", isKiosk && "size-5")} />
        <span>Salida (Pick-up)</span>
      </button>
    </div>
  );
}
