"use client";

import { IconSchool, IconUsers, IconClockHour4, IconUserCheck } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeccionResumen {
  id: string;
  nombre: string;
  nivelNombre: string;
  perc: number;
  tardanzas: number;
  tasaTardanza?: number;
  total: number;
  presentes: number;
}

interface ClassroomMonitorProps {
  resumen: SeccionResumen[];
}

export function ClassroomMonitor({ resumen }: ClassroomMonitorProps) {
  return (
    <div className="space-y-4 animate-in fade-in animation-duration-">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <IconSchool className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Monitor de Aulas y Secciones
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Seguimiento de asistencia y puntualidad por aula
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 rounded-full px-2.5 py-0.5">
          {resumen.length} Secciones Analizadas
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resumen.map((section) => {
          const perc = section.perc;
          const statusBadgeColor =
            perc < 75
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              : perc < 90
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

          const textColor =
            perc < 75
              ? "text-rose-600 dark:text-rose-400"
              : perc < 90
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400";

          const progressFill =
            perc < 75 ? "bg-rose-500" : perc < 90 ? "bg-amber-500" : "bg-emerald-500";

          const tasaTardanzas = (
            section.tasaTardanza ??
            ((section.tardanzas / (section.total || 1)) * 100)
          ).toFixed(0);

          return (
            <div
              key={section.id}
              className="group relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-xs hover:shadow-md hover:border-indigo-500/30 p-5 transition-all duration-200 flex flex-col justify-between space-y-4 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <Badge variant="outline" className="text-[9px] font-bold uppercase border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0">
                    {section.nivelNombre}
                  </Badge>
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {section.nombre}
                  </h4>
                </div>
                <Badge className={cn("text-[9px] font-bold uppercase border px-2 py-0.5 rounded-full shrink-0", statusBadgeColor)}>
                  {perc >= 90 ? "Óptimo" : perc >= 75 ? "Regular" : "Alerta"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end pt-1">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Asistencia
                  </span>
                  <div className={cn("text-2xl font-black font-mono tracking-tight", textColor)}>
                    {perc.toFixed(0)}%
                  </div>
                </div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Tardanzas
                  </span>
                  <div className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                    {tasaTardanzas}%
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-muted-foreground/70 flex items-center gap-1">
                    <IconUserCheck size={12} className="text-emerald-500" />
                    Presentismo
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {section.presentes} <span className="text-muted-foreground/40">/</span> {section.total}
                  </span>
                </div>
                <Progress
                  value={perc}
                  className="h-1.5 bg-muted/60"
                  indicatorClassName={progressFill}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
