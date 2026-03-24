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
    <Card className="group relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/20 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
      <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 space-y-0 p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
            <IconBook className="size-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight truncate">
              {curso.nombre}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1 truncate">
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
              "px-5 py-2 rounded-2xl border text-2xl sm:text-3xl font-black tabular-nums shadow-lg transition-all duration-500 group-hover:scale-105",
              getBadgeColor(promedio),
            )}
          >
            {promedio.toFixed(1)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8 pt-2">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 bg-muted/40 px-4 py-2 rounded-xl border border-border/40">
            <IconTrendingUp className="size-4 text-primary/60" />
            <span>{notas.length} Evaluaciones Registradas</span>
          </div>

          {curso.profesor && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 bg-muted/40 px-4 py-2 rounded-xl border border-border/40">
              <IconInfoCircle className="size-4 text-primary/60" />
              <span className="capitalize">
                Cátedra: {curso.profesor.name} {curso.profesor.apellidoPaterno}
              </span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full justify-between h-12 rounded-2xl bg-muted/20 border-border/40 hover:bg-muted/40 hover:border-primary/20 font-black text-xs uppercase tracking-widest transition-all duration-300"
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
          <div className="mt-5 space-y-3 animate-in slide-in-from-top-4 duration-500 ease-out">
            <div className="h-px bg-linear-to-r from-transparent via-border/40 to-transparent mb-5" />

            {notas.map((nota: any) => (
              <div key={nota.id} className="space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01]",
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
                        className="text-[9px] font-black px-2 py-0.5 h-auto rounded-lg border-primary/20 bg-primary/5 text-primary/80 uppercase tracking-tighter"
                      >
                        {nota.evaluacion.tipoEvaluacion.nombre}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                        Impacto: {nota.evaluacion.peso}%
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-xl font-black tabular-nums transition-transform group-hover:scale-110",
                      getNotaColor(nota.valor),
                    )}
                  >
                    {nota.valor}
                  </span>
                </div>

                {/* Comment Section if exists */}
                {nota.comentario && (
                  <div className="mx-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-[11px] text-foreground/70 italic flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <IconQuote size={14} className="shrink-0 text-primary/40" />
                    <p>{nota.comentario}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Subtle Bottom Glow Overlay */}
      <div className="absolute -bottom-10 -right-10 size-40 bg-primary/5 blur-3xl pointer-events-none rounded-full" />
    </Card>
  );
}
