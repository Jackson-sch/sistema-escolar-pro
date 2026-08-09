"use client";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center border border-border/50 bg-card/80 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">
          Error inesperado
        </h1>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error al cargar esta sección. Intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
