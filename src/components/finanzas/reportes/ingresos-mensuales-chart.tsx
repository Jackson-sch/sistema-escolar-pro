"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

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
  return (
    <Card className="liquid-glass border-none rounded-[2rem] overflow-hidden shadow-xl bg-card/40 backdrop-blur-md h-full">
      <CardHeader className="flex flex-row items-center gap-4 pb-8">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <TrendingUp size={24} />
        </div>
        <div>
          <CardTitle className="text-xl font-black tracking-tight">Tendencia de Ingresos</CardTitle>
          <CardDescription className="text-sm font-medium opacity-60">Comparativa mensual de ingresos proyectados vs reales</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            barGap={8}
          >
            <defs>
              <linearGradient id="gradientProyectado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-proyectado)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-proyectado)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradientReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-real)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-real)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-muted/30" />
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
              radius={[10, 10, 0, 0]}
              className="drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              barSize={32}
            />
            <Bar
              dataKey="real"
              fill="url(#gradientReal)"
              radius={[10, 10, 0, 0]}
              className="drop-shadow-[0_0_15px_rgba(var(--chart-2),0.3)]"
              barSize={32}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
