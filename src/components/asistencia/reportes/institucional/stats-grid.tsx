"use client"

import { 
  IconSchool, 
  IconUsers, 
  IconClock, 
  IconAlertCircle, 
  IconTrendingUp, 
  IconTrendingDown 
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface StatsGridProps {
  stats?: {
    current: {
      perc: number
      tasaTardanza: number
    }
    deltaAsistencia: number
    deltaTardanza: number
  }
  meta?: {
    periodLabel: string
  }
  totalAlumnos: number
}

export function StatsGrid({ stats, meta, totalAlumnos }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Tasa de Asistencia" 
        value={`${(stats?.current?.perc || 0).toFixed(1)}%`}
        delta={stats?.deltaAsistencia || 0}
        icon={IconSchool}
        subLabel={meta?.periodLabel}
        trend={stats?.deltaAsistencia && stats.deltaAsistencia > 0 ? 'up' : 'down'}
        color={(stats?.current?.perc || 0) < 75 ? 'red' : (stats?.current?.perc || 0) < 90 ? 'amber' : 'emerald'}
      />
      <StatCard 
        title="Tasa de Puntualidad" 
        value={`${(100 - (stats?.current?.tasaTardanza || 0)).toFixed(1)}%`}
        delta={stats?.deltaTardanza || 0}
        icon={IconClock}
        subLabel="Ingresos a tiempo"
        trend={stats?.deltaTardanza && stats.deltaTardanza < 0 ? 'up' : 'down'} 
        color={(100 - (stats?.current?.tasaTardanza || 0)) < 80 ? 'red' : 'emerald'}
        inverseDelta
      />
      <StatCard 
        title="Ausentismo" 
        value={`${(100 - (stats?.current?.perc || 0)).toFixed(1)}%`}
        icon={IconAlertCircle}
        subLabel="Total inasistencias"
        color={(100 - (stats?.current?.perc || 0)) > 20 ? 'red' : 'slate'}
      />
      <StatCard 
        title="Población Escolar" 
        value={totalAlumnos.toString()}
        icon={IconUsers}
        subLabel="Alumnos Activos"
        color="slate"
      />
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  delta, 
  icon: Icon, 
  subLabel, 
  trend, 
  color = "primary", 
  inverseDelta = false,
  status 
}: any) {
  const isUp = delta > 0
  
  const deltaColor = inverseDelta 
    ? (isUp ? "text-red-500" : "text-emerald-500")
    : (isUp ? "text-emerald-500" : "text-red-500")

  const colorClasses = {
    primary: "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30",
    emerald: "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30",
    red: "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30",
    amber: "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30",
    slate: "bg-muted/10 border-border/40 hover:bg-muted/20 hover:border-border/60",
  }[color as string] || "bg-muted"

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 backdrop-blur-sm",
      colorClasses,
      status === 'warning' && "border-red-500/40 ring-1 ring-red-500/20"
    )}>
      <div className={cn(
        "absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20",
        color === 'primary' ? "bg-primary" : color === 'emerald' ? "bg-emerald-500" : color === 'red' ? "bg-red-500" : color === 'amber' ? "bg-amber-500" : "bg-slate-500"
      )} />

      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl bg-background/50 border border-border/20 shadow-sm">
          <Icon className={cn("h-5 w-5", 
            color === 'primary' ? "text-primary" : 
            color === 'emerald' ? "text-emerald-500" : 
            color === 'red' ? "text-red-500" : 
            color === 'amber' ? "text-amber-500" : "text-muted-foreground"
          )} />
        </div>
        
        {delta !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-background/50",
            deltaColor
          )}>
            {isUp ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{title}</span>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black tracking-tighter">{value}</h2>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/40">{subLabel}</p>
      </div>
    </div>
  )
}
