"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-destructive">
            Error crítico
          </h1>
          <p className="text-muted-foreground">
            Ocurrió un error crítico en la aplicación.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
