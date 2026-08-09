import { IconCheck } from "@tabler/icons-react";

export function VerificacionEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/80 p-12 text-center animate-in fade-in zoom-in animation-duration-">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <IconCheck className="size-8" />
      </div>
      <p className="text-xl font-bold tracking-tight">¡Todo al día!</p>
      <p className="text-muted-foreground">
        No hay comprobantes pendientes de verificación en este momento.
      </p>
    </div>
  );
}
