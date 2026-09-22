"use client";

import {
  IconFileSpreadsheet,
  IconCircleCheck,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

interface SiagieKpiCardsProps {
  kpis: {
    porcentajeGlobal: number;
    totalSecciones: number;
    seccionesListasCount: number;
    seccionesObservadasCount: number;
    seccionesIncompletasCount: number;
    granTotalEsperado: number;
    granTotalRegistrado: number;
  };
}

export function SiagieKpiCards({ kpis }: SiagieKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Cobertura Global */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Cobertura Global
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">
              {kpis.porcentajeGlobal}%
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {kpis.granTotalRegistrado} de {kpis.granTotalEsperado} notas
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
            <IconFileSpreadsheet size={24} />
          </div>
        </CardContent>
      </Card>

      {/* Aulas Listas (Verde) */}
      <Card className="rounded-2xl border-emerald-500/25 bg-emerald-500/5 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Listas para SIAGIE
            </p>
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {kpis.seccionesListasCount}
            </h3>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              100% completas y validadas
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <IconCircleCheck size={24} />
          </div>
        </CardContent>
      </Card>

      {/* Aulas Observadas (Ámbar) */}
      <Card className="rounded-2xl border-amber-500/25 bg-amber-500/5 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Con Observaciones
            </p>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {kpis.seccionesObservadasCount}
            </h3>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              Notas en &gt;=80% o falta conclusión
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <IconAlertTriangle size={24} />
          </div>
        </CardContent>
      </Card>

      {/* Aulas Incompletas (Rojo) */}
      <Card className="rounded-2xl border-rose-500/25 bg-rose-500/5 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Incompletas
            </p>
            <h3 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
              {kpis.seccionesIncompletasCount}
            </h3>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              Pendientes de calificación
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
            <IconX size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
