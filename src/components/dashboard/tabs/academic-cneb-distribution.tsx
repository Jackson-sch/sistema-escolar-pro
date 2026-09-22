"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSchool, IconAward } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";

interface CnebDistributionProps {
  cnebStats: {
    total: number;
    ad: number;
    a: number;
    b: number;
    c: number;
  };
  academicAverage: number;
}

export function AcademicCnebDistribution({
  cnebStats,
  academicAverage,
}: CnebDistributionProps) {
  const total = cnebStats?.total || 0;
  const pctAD = total > 0 ? Math.round((cnebStats.ad / total) * 100) : 0;
  const pctA = total > 0 ? Math.round((cnebStats.a / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((cnebStats.b / total) * 100) : 0;
  const pctC = total > 0 ? Math.round((cnebStats.c / total) * 100) : 0;

  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 shadow-2xs overflow-hidden">
      <CardHeader className="py-4 px-4 sm:px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <IconAward className="size-4 text-primary" />
            Distribución CNEB / Semáforo de Logros
          </CardTitle>
          <CardDescription className="text-xs">
            Evaluación según la escala nacional oficial del Minedu
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            Promedio General
          </span>
          <span className="text-sm font-bold font-mono text-primary">
            {academicAverage.toFixed(1)} / 20
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Barra de distribución combinada */}
        <div className="space-y-1.5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40 p-0.5 gap-1">
            <div
              style={{ width: `${pctAD}%` }}
              className="bg-emerald-500 rounded-full transition-all duration-500"
              title={`AD: ${pctAD}%`}
            />
            <div
              style={{ width: `${pctA}%` }}
              className="bg-blue-500 rounded-full transition-all duration-500"
              title={`A: ${pctA}%`}
            />
            <div
              style={{ width: `${pctB}%` }}
              className="bg-amber-500 rounded-full transition-all duration-500"
              title={`B: ${pctB}%`}
            />
            <div
              style={{ width: `${pctC}%` }}
              className="bg-rose-500 rounded-full transition-all duration-500"
              title={`C: ${pctC}%`}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-right font-medium">
            Total notas registradas: {total}
          </p>
        </div>

        {/* 4 Niveles de logro */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* AD */}
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                AD · Destacado
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {pctAD}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {cnebStats?.ad || 0} calificaciones (17-20)
            </p>
          </div>

          {/* A */}
          <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                A · Esperado
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {pctA}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {cnebStats?.a || 0} calificaciones (14-16)
            </p>
          </div>

          {/* B */}
          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                B · En Proceso
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {pctB}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {cnebStats?.b || 0} calificaciones (11-13)
            </p>
          </div>

          {/* C */}
          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                C · En Inicio
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {pctC}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {cnebStats?.c || 0} calificaciones (00-10)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
