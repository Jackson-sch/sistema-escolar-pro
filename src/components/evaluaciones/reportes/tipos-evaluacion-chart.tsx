"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pie, PieChart, Cell } from "recharts"
import { IconChartPie } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
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
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="lg:col-span-3 bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <IconChartPie className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Tipos de Evaluación</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70 font-medium">
              Distribución de metodologías
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {data.length > 0 ? (
          <>
            <ChartContainer config={config} className="h-[200px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  strokeWidth={4}
                  stroke="transparent"
                  paddingAngle={3}
                  cornerRadius={4}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>

            {/* Summary list */}
            <div className="mt-auto space-y-1.5 pt-3 border-t border-border/30">
              {data.map((item, i) => {
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0"
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs font-medium text-foreground/80 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold tabular-nums">{item.value}</span>
                      <span className="text-[10px] text-muted-foreground/50">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="size-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/30">
              <IconChartPie className="size-6 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground/60">Sin datos</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">No hay tipos de evaluación registrados</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
