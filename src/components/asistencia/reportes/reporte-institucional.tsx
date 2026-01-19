import { IconSchool, IconUsers, IconUserPlus, IconUserMinus, IconLoader2 } from "@tabler/icons-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ReporteInstitucionalProps {
  resumen: any[]
  isPending: boolean
}

export function ReporteInstitucional({ resumen, isPending }: ReporteInstitucionalProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <IconLoader2 className="h-10 w-10 animate-spin text-primary relative" />
        </div>
        <span className="text-sm font-medium text-muted-foreground animate-pulse">Consolidando métricas...</span>
      </div>
    )
  }

  const totales = resumen.reduce((acc, curr) => ({
    presentes: acc.presentes + curr.presentes,
    ausentes: acc.ausentes + curr.ausentes,
    total: acc.total + curr.total
  }), { presentes: 0, ausentes: 0, total: 0 })

  const porcentajeAsistencia = totales.total > 0 ? (totales.presentes / totales.total) * 100 : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-all hover:bg-primary/10">
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-primary/80">Asistencia Institucional</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tighter">{porcentajeAsistencia.toFixed(1)}%</span>
            </div>
            <Progress
              value={porcentajeAsistencia}
              className="h-2 bg-primary/10"
              indicatorClassName="bg-linear-to-r from-primary to-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.3)]"
            />
          </div>
        </div>

        {[
          { label: 'Población Escolar', value: totales.total, icon: IconUsers, color: 'text-muted-foreground', sub: 'Alumnos totales' },
          { label: 'Asistencia Efectiva', value: totales.presentes, icon: IconUserPlus, color: 'text-emerald-500', sub: 'Presentes hoy' },
          { label: 'Ausentismo Registrado', value: totales.ausentes, icon: IconUserMinus, color: 'text-red-500', sub: 'Inasistencias' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm shadow-xs transition-all hover:border-border/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-muted-foreground/80">{item.label}</span>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl font-bold tracking-tighter">{item.value}</span>
              <p className="text-[10px] font-medium text-muted-foreground/60">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monitor por Secciones */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-4 w-1 bg-primary rounded-full" />
          <h3 className="text-sm font-semibold text-muted-foreground/80">Desempeño por Grado y Sección</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resumen.map((section) => {
            const perc = section.total > 0 ? (section.presentes / section.total) * 100 : 0
            const statusBg = perc > 92
              ? "from-emerald-500/10 to-transparent"
              : perc > 85
                ? "from-amber-500/10 to-transparent"
                : "from-red-500/15 to-transparent"

            const statusColor = perc > 92 ? "text-emerald-500" : perc > 85 ? "text-amber-500" : "text-red-500"

            return (
              <div
                key={section.id}
                className={cn(
                  "group relative rounded-xl border border-border/40 bg-card/20 p-5 transition-all hover:border-primary/30 hover:bg-card/40 overflow-hidden bg-linear-to-br",
                  statusBg
                )}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold tracking-tight truncate">{section.nombre}</h4>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <IconSchool className="h-3 w-3" />
                      <span className="text-[9px] font-medium">Métrica Diaria</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className={cn("text-2xl font-bold tracking-tighter transition-colors",
                      statusColor, "opacity-80"
                    )}>{perc.toFixed(0)}%</span>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold block">{section.presentes}/{section.total}</span>
                      <span className="text-[8px] font-medium text-muted-foreground/60">Alumnos</span>
                    </div>
                  </div>

                  <Progress
                    value={perc}
                    className="h-1.5 bg-muted/50"
                    indicatorClassName={perc > 92 ? "bg-emerald-500" : perc > 85 ? "bg-amber-500" : "bg-red-500"}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

