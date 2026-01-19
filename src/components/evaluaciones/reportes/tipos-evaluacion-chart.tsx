"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface TipoData {
  name: string
  value: number
  fill: string
}

interface TiposEvaluacionChartProps {
  data: TipoData[]
  config: ChartConfig
}

export function TiposEvaluacionChart({ data, config }: TiposEvaluacionChartProps) {
  return (
    <Card className="lg:col-span-3 bg-card/30 border-border/40">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-bold text-foreground">Tipos de Evaluación</CardTitle>
        <CardDescription className="text-[11px] text-muted-foreground/70 font-medium">
          Distribución de metodologías
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {data.length > 0 ? (
          <ChartContainer config={config} className="h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground/50 text-sm">
            No hay tipos de evaluación registrados
          </div>
        )}
      </CardContent>
    </Card>
  )
}
