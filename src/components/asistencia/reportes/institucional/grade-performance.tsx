"use client";

import { IconSchool, IconChevronRight } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface GradePerformanceProps {
  resumen: any[];
}

export function GradePerformance({ resumen }: GradePerformanceProps) {
  const gradesData = Object.entries(
    resumen.reduce((acc: any, curr) => {
      const label = curr.nombre.split(" \"")[0];
      if (!acc[label]) acc[label] = { label: label, perc: 0, count: 0, students: 0, tardanza: 0 };
      acc[label].perc += curr.perc;
      acc[label].tardanza += (curr.tardanzas / curr.total) * 100 || 0;
      acc[label].count += 1;
      acc[label].students += curr.total;
      return acc;
    }, {}),
  ).map(([label, data]: [string, any]) => ({
    label,
    finalPerc: data.perc / data.count,
    punctuality: 100 - data.tardanza / data.count,
    students: data.students,
  }));

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md p-5 shadow-lg shadow-indigo-500/5 h-full space-y-5 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <IconSchool size={14} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            Rendimiento por Grado
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-muted-foreground">
          {gradesData.length} Grados
        </span>
      </div>

      <div className="space-y-4 flex-1">
        {gradesData.map((data) => (
          <div key={data.label} className="space-y-2.5 group cursor-default">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-tight text-foreground/90 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {data.label}
                </span>
                <p className="text-[9px] font-medium text-muted-foreground">
                  {data.students} Estudiantes
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {data.finalPerc.toFixed(0)}% Asistencia
              </span>
            </div>

            <div className="space-y-1.5">
              <Progress
                value={data.finalPerc}
                className="h-1.5 bg-emerald-500/10"
                indicatorClassName={cn(
                  data.finalPerc < 75
                    ? "bg-rose-500"
                    : data.finalPerc < 90
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
