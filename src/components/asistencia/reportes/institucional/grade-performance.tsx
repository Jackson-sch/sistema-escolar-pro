"use client"

import { IconSchool, IconChevronRight } from "@tabler/icons-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface GradePerformanceProps {
  resumen: any[]
}

export function GradePerformance({ resumen }: GradePerformanceProps) {
  // Agrupar datos por grado (Nombre antes de las comillas de la sección)
  const gradesData = Object.entries(
    resumen.reduce((acc: any, curr) => {
      const label = curr.nombre.split(" \"")[0];
      if (!acc[label]) acc[label] = { label: label, perc: 0, count: 0, students: 0, tardanza: 0 };
      acc[label].perc += curr.perc;
      acc[label].tardanza += (curr.tardanzas / curr.total) * 100 || 0;
      acc[label].count += 1;
      acc[label].students += curr.total;
      return acc;
    }, {})
  ).map(([label, data]: [string, any]) => ({
    label,
    finalPerc: data.perc / data.count,
    punctuality: 100 - (data.tardanza / data.count),
    students: data.students
  }));

  return (
    <div className="space-y-6 h-full">
      <div className="bg-card/80 border border-border/40 rounded-3xl p-6 h-full">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-6 flex items-center justify-between">
          <span>Rendimiento por Grado</span>
          <IconSchool size={14} className="opacity-40" />
        </h3>
        
        <div className="space-y-6">
          {gradesData.map((data) => (
            <div key={data.label} className="space-y-3 group cursor-default">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold uppercase tracking-tight group-hover:text-primary transition-colors">
                    {data.label}
                  </span>
                  <p className="text-[9px] font-bold text-muted-foreground/50 uppercase">{data.students} Alumnos</p>
                </div>
                <IconChevronRight size={14} className="text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Asistencia</span>
                    <span className="text-[9px] font-black text-emerald-500/80">{data.finalPerc.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={data.finalPerc} 
                    className="h-1 bg-emerald-500/10" 
                    indicatorClassName={cn(
                      data.finalPerc < 75 ? "bg-red-500" : data.finalPerc < 90 ? "bg-amber-500" : "bg-emerald-500"
                    )} 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center px-0.5 opacity-60">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Puntualidad</span>
                    <span className="text-[9px] font-black text-amber-500/80">{data.punctuality.toFixed(0)}%</span>
                  </div>
                  <Progress value={data.punctuality} className="h-1 bg-amber-500/10" indicatorClassName="bg-amber-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
