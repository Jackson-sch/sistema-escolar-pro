"use client";

import { IconSchool } from "@tabler/icons-react";

export function AsistenciaEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-card/60 rounded-3xl border border-dashed border-border/60 text-center space-y-3">
      <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <IconSchool size={24} />
      </div>
      <h3 className="text-base font-bold text-foreground">
        Selecciona una Sección
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm">
        Elige el aula o sección en el selector superior para iniciar el pase de lista rápido.
      </p>
    </div>
  );
}
