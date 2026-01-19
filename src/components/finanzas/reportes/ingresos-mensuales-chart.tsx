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
    <Card className="lg:col-span-2 bg-card border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Ingresos Mensuales</CardTitle>
            <CardDescription className="text-sm">Proyectado vs. Real</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            {/* Definiciones de gradientes */}
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
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `S/ ${value}`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend  content={<ChartLegendContent />} />
            <Bar
              dataKey="proyectado"
              fill="url(#gradientProyectado)"
              radius={[6, 6, 0, 0]}
              className="drop-shadow-sm"
            />
            <Bar
              dataKey="real"
              fill="url(#gradientReal)"
              radius={[6, 6, 0, 0]}
              className="drop-shadow-sm"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
