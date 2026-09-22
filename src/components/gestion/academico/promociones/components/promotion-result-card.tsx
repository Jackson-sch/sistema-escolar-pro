"use client";

import {
  IconRefresh,
  IconCheck,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SeccionPromocion } from "./promociones-types";

interface PromotionResultCardProps {
  isPending: boolean;
  selectedCount: number;
  sourceSeccionObj?: SeccionPromocion;
  targetSeccionObj?: SeccionPromocion;
  anioOrigen: number;
  anioDestino: number;
  onContinue: () => void;
  onGoToEnrollments: () => void;
}

export function PromotionResultCard({
  isPending,
  selectedCount,
  sourceSeccionObj,
  targetSeccionObj,
  anioOrigen,
  anioDestino,
  onContinue,
  onGoToEnrollments,
}: PromotionResultCardProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in zoom-in-95 animation-duration-">
      <Card className="p-8 rounded-3xl border-border/40 bg-card/80 backdrop-blur-md space-y-6 shadow-xl text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div
          className={cn(
            "size-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-colors relative z-10",
            isPending
              ? "bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-600 animate-pulse"
              : "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-emerald-500/20",
          )}
        >
          {isPending ? (
            <IconRefresh className="size-9 animate-spin" />
          ) : (
            <IconCheck className="size-9" strokeWidth={3} />
          )}
        </div>

        <div className="space-y-2 relative z-10">
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-bold">
            {isPending ? "Procesando..." : "Promoción Registrada (Pendiente de Ratificación)"}
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            {isPending
              ? "Generando Vacantes para el Nuevo Ciclo..."
              : "¡Promoción Registrada con Éxito!"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {isPending
              ? "Actualizando asignación de vacantes y cronograma académico en la base de datos."
              : `Se generó la reserva de matrícula de ${selectedCount} alumnos para el ciclo académico ${anioDestino}. Los estudiantes mantienen su aula en curso (${anioOrigen}) hasta ser ratificados.`}
          </p>
        </div>

        {/* Resumen de Transición */}
        {!isPending && (
          <div className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Alumnos Promovidos
                </span>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedCount} Estudiantes
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Sección Origen ({anioOrigen})
                </span>
                <p className="text-xs font-bold text-foreground truncate">
                  {sourceSeccionObj?.grado?.nombre} &quot;
                  {sourceSeccionObj?.seccion}&quot;
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Sección Destino ({anioDestino})
                </span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {targetSeccionObj?.grado?.nombre} &quot;
                  {targetSeccionObj?.seccion}&quot;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 text-left">
              <span className="text-base leading-none">💡</span>
              <p className="leading-snug">
                <strong>Nota:</strong> Las matrículas han quedado en estado <strong>&quot;Por Ratificar&quot;</strong>. Podrás confirmarlas manualmente desde la tabla de Matrículas o se activarán automáticamente cuando los apoderados cancelen el concepto de matrícula en Caja / POS.
              </p>
            </div>
          </div>
        )}

        {/* Botones de Acción Final */}
        {!isPending && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Button
              onClick={onContinue}
              variant="outline"
              className="w-full sm:w-auto rounded-xl h-10 px-5 font-bold border-border/50 hover:bg-muted/60 text-xs cursor-pointer"
            >
              <IconRefresh className="size-4" />
              <span>Promover Otra Sección</span>
            </Button>

            <Button
              onClick={onGoToEnrollments}
              className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 text-xs gap-2 cursor-pointer"
            >
              <IconFileSpreadsheet className="size-4" />
              <span>Ver Registro de Matrículas {anioDestino}</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
