"use client";

import { useState } from "react";
import {
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
  IconShieldCheck,
  IconTrendingUp,
  IconRocket,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PromotionGuideCardProps {
  anioOrigen: number;
  anioDestino: number;
}

export function PromotionGuideCard({
  anioOrigen,
  anioDestino,
}: PromotionGuideCardProps) {
  const [showGuide, setShowGuide] = useState<boolean>(false);

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border-indigo-500/30 bg-indigo-950/20 space-y-3 relative overflow-hidden shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <IconInfoCircle className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                Guía Operativa: Cierre Escolar y Promoción Masiva
              </h3>
              <Badge className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                SISTEMA ESCOLAR PRO
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Transición institucional de matrículas y asignación de aulas entre
              el ciclo{" "}
              <span className="font-bold text-indigo-400">{anioOrigen}</span> y{" "}
              <span className="font-bold text-emerald-400">{anioDestino}</span>.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGuide(!showGuide)}
          className="h-8 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground shrink-0 gap-1.5 cursor-pointer"
        >
          <span>{showGuide ? "Ocultar guía" : "Ver indicaciones"}</span>
          {showGuide ? (
            <IconChevronUp className="size-3.5" />
          ) : (
            <IconChevronDown className="size-3.5" />
          )}
        </Button>
      </div>

      {showGuide && (
        <div className="pt-3 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in animation-duration-">
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <IconShieldCheck className="size-4 shrink-0" />
              <span>1. Auditoría Inicial</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Verifica el cierre de calificaciones y solvencia para certificar
              que el ciclo escolar está apto para promoción.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <IconTrendingUp className="size-4 shrink-0" />
              <span>2. Mapeo Automático</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Al elegir la sección origen (ej. 2° A {anioOrigen}), el sistema{" "}
              <strong className="text-foreground font-semibold">
                detecta y sugiere
              </strong>{" "}
              la sección correlativa (3° A {anioDestino}).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <IconRocket className="size-4 shrink-0" />
              <span>3. Generación de Matrículas</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Confirma los alumnos promovibles. Al procesar, se formalizan
              automáticamente sus matrículas para el periodo {anioDestino}.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
