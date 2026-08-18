"use client";

import { IconAlertTriangle, IconUserCheck, IconLoader2 } from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReporteAlertasProps {
  alertas: any[];
  isPending: boolean;
}

export function ReporteAlertas({ alertas, isPending }: ReporteAlertasProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground animate-in fade-in animation-duration-">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-lg shadow-rose-500/5">
          <IconLoader2 className="size-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Analizando Alertas de Deserción
          </p>
          <p className="text-xs text-muted-foreground/70">Calculando índices de riesgo e inasistencias continuas...</p>
        </div>
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/40 bg-card/40 backdrop-blur-md shadow-xs animate-in zoom-in-95 animation-duration-">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
          <div className="relative size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
            <IconUserCheck className="size-8" />
          </div>
        </div>
        <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground">Sin Alertas Críticas</h3>
        <p className="max-w-sm text-center text-xs text-muted-foreground leading-relaxed mt-1">
          Excelente desempeño institucional. Todos los estudiantes de esta sección o nivel mantienen índices de asistencia dentro de los márgenes óptimos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alertas.slice(0, 3).map((alerta) => (
          <div
            key={alerta.id}
            className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/[0.03] to-rose-500/[0.08] p-5 shadow-sm hover:border-rose-500/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full gap-1">
                <IconAlertTriangle className="size-3" />
                Alto Riesgo
              </Badge>
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                {alerta.seccion}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                  {alerta.nombre}
                </h4>
                <p className="text-[10px] text-muted-foreground font-medium">Inasistencias acumuladas en periodo</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      Tasa de Ausencia
                    </span>
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
                      {alerta.porcentaje}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-foreground">{alerta.faltas} faltas</span>
                    <span className="block text-[9px] text-muted-foreground">de {alerta.totalDias} días</span>
                  </div>
                </div>
                <Progress
                  value={alerta.porcentaje}
                  className="h-2 bg-rose-500/10"
                  indicatorClassName="bg-linear-to-r from-rose-500 to-red-600 shadow-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden shadow-lg shadow-rose-500/5">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <IconAlertTriangle className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Monitoreo General de Deserción y Ausentismo
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Listado de estudiantes que sobrepasan el límite de inasistencias
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5 rounded-full px-2.5 py-0.5">
            {alertas.length} Alertas Activas
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Estudiante
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Sección / Aula
                </TableHead>
                <TableHead className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Faltas / Total
                </TableHead>
                <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Índice de Ausentismo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.map((alerta) => (
                <TableRow key={alerta.id} className="group border-b border-border/20 last:border-0 hover:bg-rose-500/[0.02] transition-colors">
                  <TableCell className="py-3 px-5 font-bold text-xs uppercase text-foreground/90">
                    {alerta.nombre}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-xs font-semibold text-muted-foreground">
                    {alerta.seccion}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center font-mono">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{alerta.faltas} F</span>
                    <span className="mx-1 text-muted-foreground/30">/</span>
                    <span className="text-xs text-muted-foreground">{alerta.totalDias} D</span>
                  </TableCell>
                  <TableCell className="py-3 px-5">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-28">
                        <Progress
                          value={alerta.porcentaje}
                          className="h-2 bg-muted/60"
                          indicatorClassName={cn(
                            alerta.porcentaje > 30 ? "bg-rose-600 shadow-xs" : "bg-amber-500 shadow-xs"
                          )}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold w-10 text-right text-rose-600 dark:text-rose-400">
                        {alerta.porcentaje}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
