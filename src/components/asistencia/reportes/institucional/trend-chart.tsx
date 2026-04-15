"use client"

import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { IconTrendingUp } from "@tabler/icons-react"

interface TrendChartProps {
  trendData?: any[]
}

export function TrendChart({ trendData }: TrendChartProps) {
  return (
    <div className="bg-card/40 border border-border/40 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-sm font-black tracking-widest text-primary uppercase">Tendencia de Participación</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Análisis: Asistencia vs Tardanza vs Ausencia</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Asistencia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Tardanza</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Ausencia</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[320px] w-full flex items-center justify-center relative">
        {trendData && trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAsist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAusen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                domain={[0, 105]}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="asistencia" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAsist)" 
                animationBegin={300}
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="tardanza" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTard)" 
                animationBegin={600}
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="ausencia" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorAusen)" 
                animationBegin={900}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-3 opacity-40">
            <div className="p-4 rounded-full bg-muted/20 border border-border/40">
              <IconTrendingUp className="size-8" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">
              No hay suficientes datos históricos para generar tendencia
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-2xl shadow-2xl space-y-3 ring-1 ring-primary/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">
          Día {label} del periodo
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Asistencia</span>
              <span className="text-sm font-black tracking-tight">{payload[0].value}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Tardanzas</span>
              <span className="text-sm font-black tracking-tight text-amber-500">{payload[1]?.value || 0}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Ausencias</span>
              <span className="text-sm font-black tracking-tight text-red-500">{payload[2]?.value || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}
