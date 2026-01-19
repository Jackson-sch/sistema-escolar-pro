"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { IconChartBar } from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CursoData {
  name: string
  evaluations: number
  grades: number
}

interface ActividadCursoChartProps {
  data: CursoData[]
}

const chartConfig = {
  evaluations: {
    label: "Evaluaciones",
    color: "var(--chart-1)",
  },
  grades: {
    label: "Notas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ActividadCursoChart({ data }: ActividadCursoChartProps) {
  // Calculamos totales para el header
  const totals = useMemo(() => {
    return data.reduce(
      (acc, curr) => ({
        evaluations: acc.evaluations + curr.evaluations,
        grades: acc.grades + curr.grades,
      }),
      { evaluations: 0, grades: 0 }
    )
  }, [data])

  return (
    <Card className="lg:col-span-4 flex flex-col h-full shadow-sm border-border bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Actividad Académica</CardTitle>
            <CardDescription>
              Comparativa de evaluaciones vs. notas por curso
            </CardDescription>
          </div>
          {/* Badge informativo de totales */}
          {data.length > 0 && (
             <div className="hidden sm:flex gap-4 text-xs text-muted-foreground tabular-nums">
                <div className="flex items-center gap-1.5">
                   <div className="size-2 rounded-full bg-[var(--chart-1)]" />
                   <span className="font-medium text-foreground">{totals.evaluations}</span> Eval.
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="size-2 rounded-full bg-[var(--chart-2)]" />
                   <span className="font-medium text-foreground">{totals.grades}</span> Notas
                </div>
             </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-2 px-2 sm:px-6">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[250px] max-h-[350px] w-full">
            <BarChart 
                accessibilityLayer 
                data={data} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              {/* Definición de Degradados */}
              <defs>
                <linearGradient id="fillEvaluations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-evaluations)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-evaluations)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillGrades" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-grades)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-grades)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
            
              />
              
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                allowDecimals={false}
              />
              
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              
              <ChartLegend content={<ChartLegendContent />} />
              
              {/* Uso de los degradados definidos en <defs> */}
              <Bar 
                dataKey="evaluations" 
                fill="url(#fillEvaluations)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
              <Bar 
                dataKey="grades" 
                fill="url(#fillGrades)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex flex-col items-center justify-center gap-3 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 mx-4">
            <div className="p-3 bg-background rounded-full shadow-sm">
                <IconChartBar className="size-6 opacity-50" />
            </div>
            <p className="text-sm font-medium">No hay actividad registrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}