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
    if (nota < 11) return "text-red-500";
    if (nota < 14) return "text-amber-500";
    return "text-green-500";
  };

  const getBgColor = (nota: number) => {
    if (nota < 11) return "bg-red-500/10 border-red-500/20";
    if (nota < 14) return "bg-amber-500/10 border-amber-500/20";
    return "bg-green-500/10 border-green-500/20";
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <IconBook className="size-8" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight leading-tight">
              {curso.nombre}
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">
              {curso.areaCurricular.nombre}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
            Promedio Periodo
          </span>
          <div
            className={cn(
              "px-4 py-1.5 rounded-xl border text-2xl font-black tabular-nums shadow-sm",
              getBgColor(promedio),
              getNotaColor(promedio)
            )}
          >
            {promedio.toFixed(1)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
            <IconTrendingUp className="size-3.5" />
            <span>{notas.length} Evaluaciones</span>
          </div>
          {curso.profesor && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
              <IconInfoCircle className="size-3.5" />
              <span className="capitalize">
                Prof. {curso.profesor.name} {curso.profesor.apellidoPaterno}
              </span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full justify-between h-10 rounded-xl hover:bg-muted font-bold text-sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Ocultar Detalles" : "Ver Detalle de Evaluaciones"}
          {expanded ? (
            <IconChevronUp className="size-4" />
          ) : (
            <IconChevronDown className="size-4" />
          )}
        </Button>

        {expanded && (
          <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
            {notas.map((nota) => (
              <div
                key={nota.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">{nota.evaluacion.nombre}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold px-1.5 py-0 h-4 uppercase"
                    >
                      {nota.evaluacion.tipoEvaluacion.nombre}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Peso: {nota.evaluacion.peso}%
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-lg font-black tabular-nums",
                    getNotaColor(nota.valor)
                  )}
                >
                  {nota.valor}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
