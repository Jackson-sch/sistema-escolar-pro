"use client";

import {
  IconCircleCheckFilled,
  IconAlertCircle,
  IconShieldCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VALIDATION_ITEMS } from "./promociones-types";

interface AuditoriaTabProps {
  anioOrigen: number;
  anioDestino: number;
  onContinue: () => void;
}

export function AuditoriaTab({
  anioOrigen,
  anioDestino,
  onContinue,
}: AuditoriaTabProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 animation-duration-">
      <div className="text-center space-y-1.5">
        <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full px-3.5 py-1 text-xs font-bold">
          Transición Institucional {anioOrigen} → {anioDestino}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Auditoría de Cierre Escolar
        </h1>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Verificación automática de condiciones académicas y administrativas
          previas a la promoción masiva.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALIDATION_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="p-5 rounded-2xl border-border/40 bg-card/80 space-y-4 hover:border-indigo-500/30 transition-colors duration-200 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border transition-colors",
                  item.status === "complete"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-500",
                )}
              >
                {item.status === "complete" ? (
                  <IconCircleCheckFilled className="size-5" />
                ) : (
                  <IconAlertCircle className="size-5" />
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold rounded-full px-2.5 py-0.5",
                  item.status === "complete"
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                    : "border-amber-500/30 text-amber-600 bg-amber-500/5",
                )}
              >
                {item.status === "complete" ? "Validado" : "Revisión"}
              </Badge>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                {item.label}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground/70 pt-2 border-t border-border/30">
              {item.detail}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6 rounded-2xl border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-indigo-950/20 to-transparent flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-md">
        <div className="space-y-1 text-center md:text-left relative z-10">
          <h2 className="text-base font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
            <IconShieldCheck className="size-5 text-indigo-500" />
            Condiciones Validadas para Iniciar Mapeo
          </h2>
          <p className="text-xs text-muted-foreground max-w-md">
            El ciclo {anioOrigen} se encuentra apto. Haz clic a continuación para
            mapear las secciones origen y destino.
          </p>
        </div>
        <Button
          onClick={onContinue}
          className="rounded-xl h-10 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-colors duration-200 text-xs gap-2 shrink-0 cursor-pointer"
        >
          <span>Iniciar Mapeo de Secciones</span>
          <IconArrowRight size={16} />
        </Button>
      </Card>
    </div>
  );
}
