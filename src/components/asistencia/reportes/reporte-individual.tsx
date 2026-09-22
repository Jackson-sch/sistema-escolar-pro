"use client";

import { IconLoader2, IconUser } from "@tabler/icons-react";
import { IndividualProfileBanner } from "./individual/individual-profile-banner";
import { IndividualKpiCards } from "./individual/individual-kpi-cards";
import { IndividualHistoryTable } from "./individual/individual-history-table";

interface ReporteIndividualProps {
  data: any[];
  estudianteNombre: string;
  isPending: boolean;
}

export function ReporteIndividual({ data, estudianteNombre, isPending }: ReporteIndividualProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground animate-in fade-in animation-duration-">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shadow-lg shadow-indigo-500/5">
          <IconLoader2 className="size-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Cargando Historial Individual
          </p>
          <p className="text-xs text-muted-foreground/70">Recuperando registros y estadísticas anuales...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/40 bg-card/40 backdrop-blur-md shadow-xs animate-in zoom-in-95 animation-duration-">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
          <div className="relative size-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <IconUser className="size-8" />
          </div>
        </div>
        <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground">Seleccionar Estudiante</h3>
        <p className="max-w-sm text-center text-xs text-muted-foreground leading-relaxed mt-1">
          Por favor selecciona un estudiante del selector superior para visualizar su historial consolidado de asistencia.
        </p>
      </div>
    );
  }

  const totales = data.reduce(
    (acc, curr) => ({
      P: acc.P + curr.presentes,
      F: acc.F + curr.ausentes,
      T: acc.T + curr.tardanzas,
      J: acc.J + curr.justificadas,
    }),
    { P: 0, F: 0, T: 0, J: 0 },
  );

  const totalDiasEvaluados = totales.P + totales.F + totales.T + totales.J;
  const tasaGlobal =
    totalDiasEvaluados > 0
      ? ((totales.P + totales.T + totales.J) / totalDiasEvaluados) * 100
      : 0;

  const getPercent = (val: number) =>
    totalDiasEvaluados > 0 ? ((val / totalDiasEvaluados) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      <IndividualProfileBanner
        estudianteNombre={estudianteNombre}
        totalDiasEvaluados={totalDiasEvaluados}
        tasaGlobal={tasaGlobal}
      />

      <IndividualKpiCards
        totales={totales}
        totalDiasEvaluados={totalDiasEvaluados}
        getPercent={getPercent}
      />

      <IndividualHistoryTable data={data} />
    </div>
  );
}
