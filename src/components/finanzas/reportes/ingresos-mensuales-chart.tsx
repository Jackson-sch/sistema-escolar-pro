"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ComposedChart, Line } from "recharts"
import { TrendingUp, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/formats"
import * as React from "react"

const chartConfig = {
  proyectado: {
    label: "Proyectado",
    color: "var(--chart-1)",
  },
  real: {
    label: "Recaudado",
    color: "var(--chart-2)",
  },
}

interface IngresosMensualesChartProps {
  data: { name: string; proyectado: number; real: number }[]
}

export function IngresosMensualesChart({ data }: IngresosMensualesChartProps) {
  // Calculate summary stats
  const totalProyectado = data.reduce((acc, curr) => acc + curr.proyectado, 0)
  const totalReal = data.reduce((acc, curr) => acc + curr.real, 0)
  const bestMonth = data.reduce(
    (best, curr) => (curr.real > best.real ? curr : best),
    data[0] || { name: "-", real: 0, proyectado: 0 }
  )
  const currentMonthIdx = new Date().getMonth()
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const currentMonthName = monthNames[currentMonthIdx]
  const currentMonthData = data.find((d) => d.name === currentMonthName)

  return (
    <Card className="bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner transition-transform duration-300 hover:scale-110">
              <TrendingUp size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Tendencia de Ingresos</CardTitle>
              <CardDescription className="text-sm font-medium opacity-60">Comparativa mensual de ingresos proyectados vs reales</CardDescription>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentMonthData && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-primary/20 bg-primary/5 text-primary"
              >
                <Activity size={10} className="mr-1.5" />
                {currentMonthName}: {formatCurrency(currentMonthData.real)}
              </Badge>
            )}
            {bestMonth && bestMonth.real > 0 && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
              >
                Mejor: {bestMonth.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            barGap={6}
          >
            <defs>
              <linearGradient id="gradientProyectado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-proyectado)" stopOpacity={0.85} />
                <stop offset="95%" stopColor="var(--color-proyectado)" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="gradientReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-real)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-real)" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-real)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--color-real)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-muted/20" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={15}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `S/ ${value}`}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} className="pt-6" />
            <Bar
              dataKey="proyectado"
              fill="url(#gradientProyectado)"
              radius={[12, 12, 0, 0]}
              className="drop-shadow-[0_0_12px_rgba(var(--primary),0.2)]"
              barSize={28}
            />
            <Bar
              dataKey="real"
              fill="url(#gradientReal)"
              radius={[12, 12, 0, 0]}
              className="drop-shadow-[0_0_12px_rgba(var(--chart-2),0.2)]"
              barSize={28}
            />
            {/* Trend line overlay for recaudado */}
            <Line
              type="monotone"
              dataKey="real"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={false}
              strokeDasharray=""
              legendType="none"
            />
          </ComposedChart>
        </ChartContainer>

        {/* Summary Stats Row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/80 transition-colors duration-300 group">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
              Total Proyectado
            </p>
            <p className="text-base font-black tracking-tight group-hover:text-primary transition-colors">
              {formatCurrency(totalProyectado)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/80 transition-colors duration-300 group">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
              Total Recaudado
            </p>
            <p className="text-base font-black tracking-tight text-emerald-500 group-hover:text-emerald-400 transition-colors">
              {formatCurrency(totalReal)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/80 transition-colors duration-300 group">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
              Diferencia
            </p>
            <p className={cn(
              "text-base font-black tracking-tight transition-colors",
              totalReal >= totalProyectado ? "text-emerald-500" : "text-red-500"
            )}>
              {totalReal >= totalProyectado ? "+" : ""}{formatCurrency(totalReal - totalProyectado)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
