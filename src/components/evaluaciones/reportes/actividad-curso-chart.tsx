"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { IconChartBar } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

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
    <Card className="lg:col-span-4 flex flex-col h-full bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <IconChartBar className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Actividad Académica</CardTitle>
              <CardDescription className="text-xs">
                Comparativa de evaluaciones vs. notas por curso
              </CardDescription>
            </div>
          </div>
          {/* Badge informativo de totales */}
          {data.length > 0 && (
            <div className="hidden sm:flex gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-[var(--chart-1)]/20 bg-[var(--chart-1)]/5">
                <div className="size-1.5 rounded-full bg-[var(--chart-1)] mr-1.5" />
                {totals.evaluations} Eval.
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-[var(--chart-2)]/20 bg-[var(--chart-2)]/5">
                <div className="size-1.5 rounded-full bg-[var(--chart-2)] mr-1.5" />
                {totals.grades} Notas
              </Badge>
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
                  <stop offset="95%" stopColor="var(--color-evaluations)" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="fillGrades" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-grades)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-grades)" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-muted/20" />
              
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={11}
                tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
              />
              
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={11}
                allowDecimals={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
              />
              
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              
              <ChartLegend content={<ChartLegendContent />} />
              
              <Bar 
                dataKey="evaluations" 
                fill="url(#fillEvaluations)" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                dataKey="grades" 
                fill="url(#fillGrades)" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex flex-col items-center justify-center gap-3 text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl bg-muted/5 mx-4">
            <div className="size-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/30">
              <IconChartBar className="size-6 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground/60">No hay actividad registrada</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">Programa evaluaciones para ver datos aquí</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}