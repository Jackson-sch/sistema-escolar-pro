"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconChevronDown,
  IconChevronUp,
  IconBook,
  IconTrendingUp,
  IconInfoCircle,
  IconQuote,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Nota {
  id: string;
  valor: number;
  evaluacion: {
    nombre: string;
    peso: number;
    tipoEvaluacion: { nombre: string };
  };
}

interface CourseGradesCardProps {
  curso: {
    nombre: string;
    profesor?: { name: string; apellidoPaterno: string };
    areaCurricular: { nombre: string };
  };
  notas: Nota[];
  promedio: number;
}

export function CourseGradesCard({
  curso,
  notas,
  promedio,
}: CourseGradesCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getNotaColor = (nota: number) => {
    if (nota < 11) return "text-destructive";
    if (nota < 14) return "text-warning";
    return "text-success";
  };

  const getBgColor = (nota: number) => {
    if (nota < 11) return "bg-destructive/5 border-destructive/10";
    if (nota < 14) return "bg-warning/5 border-warning/10";
    return "bg-success/5 border-success/10";
  };

  const getBadgeColor = (nota: number) => {
    if (nota < 11)
      return "bg-destructive/10 text-destructive border-destructive/20";
    if (nota < 14) return "bg-warning/10 text-warning border-warning/20";
    return "bg-success/10 text-success border-success/20";
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm transition-colors hover:border-primary/30">
      <CardHeader className="flex flex-col items-start justify-between gap-4 space-y-0 p-5 pb-4 xs:flex-row xs:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconBook className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold leading-tight">
              {curso.nombre}
            </h3>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {curso.areaCurricular.nombre}
            </p>
          </div>
        </div>

        <div className="flex flex-row xs:flex-col items-center xs:items-end justify-between w-full xs:w-auto gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
            Puntaje Final
          </span>
          <div
            className={cn(
              "rounded-xl border px-4 py-2 text-2xl font-bold tabular-nums",
              getBadgeColor(promedio),
            )}
          >
            {promedio.toFixed(1)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-2">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
            <IconTrendingUp className="size-4 text-primary/60" />
            <span>{notas.length} Evaluaciones Registradas</span>
          </div>

          {curso.profesor && (
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
              <IconInfoCircle className="size-4 text-primary/60" />
              <span className="capitalize">
                Cátedra: {curso.profesor.name} {curso.profesor.apellidoPaterno}
              </span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="h-10 w-full justify-between rounded-xl border-border/50 bg-transparent text-xs font-semibold"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Cerrar Detalles" : "Desglosar Evaluaciones"}
          {expanded ? (
            <IconChevronUp className="size-4" />
          ) : (
            <IconChevronDown className="size-4" />
          )}
        </Button>

        {expanded && (
          <div className="mt-5 space-y-3">
            <div className="mb-5 h-px bg-border/50" />

            {notas.map((nota: any) => (
              <div key={nota.id} className="space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4",
                    getBgColor(nota.valor),
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-[13px] font-black tracking-tight">
                      {nota.evaluacion.nombre}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="h-auto rounded-md border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary"
                      >
                        {nota.evaluacion.tipoEvaluacion.nombre}
                      </Badge>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Impacto: {nota.evaluacion.peso}%
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-xl font-bold tabular-nums",
                      getNotaColor(nota.valor),
                    )}
                  >
                    {nota.valor}
                  </span>
                </div>

                {/* Comment Section if exists */}
                {nota.comentario && (
                  <div className="mx-2 flex gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3 text-xs text-foreground/70">
                    <IconQuote size={14} className="shrink-0 text-primary/40" />
                    <p>{nota.comentario}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
