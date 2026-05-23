"use client";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <div className="liquid-glass flex max-w-md flex-col items-center gap-4 rounded-3xl p-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-destructive">
          Error inesperado
        </h1>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error al cargar esta sección. Intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
