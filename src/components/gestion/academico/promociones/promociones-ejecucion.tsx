"use client";

import { IconCheck, IconRocket } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromocionesEjecucionProps {
  isPending: boolean;
  selectedIds: string[];
  onFinish: () => void;
}

export function PromocionesEjecucion({
  isPending,
  selectedIds,
  onFinish,
}: PromocionesEjecucionProps) {
  return (
    <div className="max-w-3xl mx-auto py-12 text-center space-y-8 animate-in zoom-in-50 duration-700">
      <div
        className={cn(
          "size-32 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-1000",
          isPending
            ? "bg-primary/10 border-4 border-primary/30 shadow-primary/10 animate-liquid-spin"
            : "bg-green-500/10 border-4 border-green-500/30 shadow-green-500/10"
        )}
      >
        {isPending ? (
          <IconRocket className="size-16 text-primary" />
        ) : (
          <IconCheck className="size-16 text-green-500" />
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-4xl font-bold italic uppercase tracking-tighter">
          {isPending ? "Procesando Institución" : "Promoción Exitosa"}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          {isPending
            ? "Estamos sincronizando la base de datos académica para el nuevo ciclo lectivo. Por favor, no cierres esta ventana."
            : "Los estudiantes han sido transferidos correctamente a sus nuevas secciones. Los registros de matrícula han sido actualizados."}
        </p>
      </div>

      <div className="w-full h-4 bg-border/20 rounded-full overflow-hidden shadow-inner">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 shadow-lg relative",
            isPending
              ? "bg-primary w-[70%] shadow-primary/50"
              : "bg-green-500 w-full shadow-green-500/50"
          )}
        >
          {isPending && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>

      <p
        className={cn(
          "text-xxs font-bold uppercase tracking-[0.4em]",
          isPending ? "text-primary animate-pulse" : "text-green-500"
        )}
      >
        {isPending
          ? "Ejecutando Scripts de Migración..."
          : "Sincronización Completada"}
      </p>

      {!isPending && (
        <div className="pt-4 flex flex-col items-center gap-4">
          <Button
            onClick={onFinish}
            className="rounded-3xl h-14 px-12 font-bold uppercase tracking-widest bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20"
          >
            Finalizar y Volver
          </Button>
          <p className="text-[9px] text-muted-foreground font-bold tracking-tighter uppercase">
            Se han procesado {selectedIds.length} registros exitosamente.
          </p>
        </div>
      )}
    </div>
  );
}
