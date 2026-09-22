"use client";

import { IconLoader2, IconClock, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function ScheduleLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
      <IconLoader2 className="size-8 animate-spin text-primary/60" />
      <p className="text-xs font-semibold text-muted-foreground/60 tracking-wide">
        Cargando horario...
      </p>
    </div>
  );
}

interface ScheduleEmptyStateProps {
  nivelSelected: boolean;
  gradoSelected: boolean;
  seccionSelected: boolean;
}

export function ScheduleEmptyState({
  nivelSelected,
  gradoSelected,
  seccionSelected,
}: ScheduleEmptyStateProps) {
  const steps = [
    { label: "Nivel", filled: nivelSelected },
    { label: "Grado", filled: gradoSelected },
    { label: "Sección", filled: seccionSelected },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-dashed border-border/40 bg-muted/5 text-center p-10 gap-3">
      <div className="size-12 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-center">
        <IconClock
          className="size-6 text-muted-foreground/30"
          strokeWidth={1.5}
        />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground/60">
          Sin horario seleccionado
        </h3>
        <p className="text-xs text-muted-foreground/50 max-w-xs leading-relaxed">
          Usa los filtros de arriba para elegir la sección cuyo horario deseas
          gestionar.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mt-1">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors",
                step.filled
                  ? "bg-primary/10 border-primary/25 text-primary"
                  : "bg-muted/30 border-border/40 text-muted-foreground/40",
              )}
            >
              <span
                className={cn(
                  "size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold",
                  step.filled
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground/40",
                )}
              >
                {i + 1}
              </span>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <IconChevronRight
                size={10}
                className="text-muted-foreground/25 shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
