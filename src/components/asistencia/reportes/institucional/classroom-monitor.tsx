"use client"

import { IconSchool } from "@tabler/icons-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface SeccionResumen {
  id: string
  nombre: string
  nivelNombre: string
  perc: number
  tardanzas: number
  total: number
  presentes: number
}

interface ClassroomMonitorProps {
  resumen: SeccionResumen[]
}

export function ClassroomMonitor({ resumen }: ClassroomMonitorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-widest uppercase text-foreground/80">Monitor de Aulas</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Seguimiento operativo por sección</p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-muted/50 border border-border/30">
          <span className="text-[9px] font-bold text-muted-foreground">
            {resumen.length} Secciones Analizadas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {resumen.map((section) => {
          const perc = section.perc
          const statusColor = perc < 75 ? "#ef4444" : perc < 90 ? "#f59e0b" : "#10b981"
          const textColor = perc < 75 ? "text-red-500" : perc < 90 ? "text-amber-500" : "text-emerald-500"

          return (
            <div
              key={section.id}
              className="group relative rounded-2xl border border-border/50 bg-card/80 shadow-sm p-6 transition-[border-color,box-shadow] duration-500 hover:border-primary/40 hover:shadow-md overflow-hidden"
            >
              {/* Flow Glow (Blob animado con color de estado) */}
              <div 
                className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 animate-blob"
                style={{ backgroundColor: statusColor }}
              />
              <div 
                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 animate-blob"
                style={{ backgroundColor: statusColor, animationDelay: '2s' }}
              />

              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{section.nivelNombre}</p>
                    <h4 className="text-sm font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">{section.nombre}</h4>
                  </div>
                  <div className="p-2 rounded-2xl bg-muted/50 border border-border/30 group-hover:border-primary/30 transition-[border-color] duration-300">
                    <IconSchool className="size-3.5 text-muted-foreground/60 group-hover:text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Asistencia</p>
                    <div className="relative inline-block">
                      <span className={cn("text-3xl font-black tracking-tighter leading-none block", textColor)}>
                        {perc.toFixed(0)}%
                      </span>
                      {/* LCD Glow Effect */}
                      <span className={cn("absolute inset-0 blur-sm opacity-40 select-none", textColor)} aria-hidden="true">
                        {perc.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Tardanza</p>
                    <span className="text-sm font-black text-amber-500/80 tracking-tighter">
                      {((section.tardanzas / (section.total || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Presentismo</span>
                    <span className="text-[10px] font-black text-muted-foreground/60 tracking-tighter">
                      {section.presentes} <span className="opacity-30">/</span> {section.total}
                    </span>
                  </div>
                  <Progress 
                    value={perc} 
                    className="h-1.5 bg-muted/10 rounded-full overflow-hidden" 
                    indicatorClassName={cn(
                      perc < 75 ? "bg-red-500" : perc < 90 ? "bg-amber-500" : "bg-primary"
                    )} 
                  />
                </div>
              </div>
              
              {/* Decoración Inferior Sutil - Refinada */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
